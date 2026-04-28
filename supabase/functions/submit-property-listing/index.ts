import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import {
  createAdminSupabaseClient,
  createUserSupabaseClient,
  findDuplicateProperty,
  getSupabaseSecretKey,
  isSchemaNotReadyError,
  json,
  type PropertySubmissionPayload,
  validatePropertySubmissionPayload,
  corsHeaders,
} from "../_shared/propertySubmission.ts";

const buildSchemaHint = () =>
  "Run supabase/migrations/properties_table.sql first. If this project already had an older properties table before today, run supabase/migrations/20260428_property_submission_upgrade.sql immediately after, then refresh the app.";

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return json(
      {
        ok: false,
        errorType: "validation",
        message: "Method not allowed.",
      },
      { status: 405 }
    );
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY");
  const supabaseSecretKey = getSupabaseSecretKey();
  const authHeader = req.headers.get("Authorization");

  if (!supabaseUrl || !supabaseAnonKey || !supabaseSecretKey) {
    return json(
      {
        ok: false,
        errorType: "database",
        message: "Supabase environment variables are not configured.",
      },
      { status: 500 }
    );
  }

  if (!authHeader) {
    return json(
      {
        ok: false,
        errorType: "auth",
        message: "You must be signed in to submit a property.",
      },
      { status: 401 }
    );
  }

  let payload: PropertySubmissionPayload;

  try {
    payload = (await req.json()) as PropertySubmissionPayload;
  } catch (_error) {
    return json(
      {
        ok: false,
        errorType: "validation",
        message: "Request body is not valid JSON.",
      },
      { status: 400 }
    );
  }

  try {
    const userSupabase = createUserSupabaseClient(supabaseUrl, supabaseAnonKey, authHeader);
    const {
      data: { user },
      error: authError,
    } = await userSupabase.auth.getUser();

    if (authError || !user) {
      return json(
        {
          ok: false,
          errorType: "auth",
          message: "Your session has expired. Sign in again and retry.",
        },
        { status: 401 }
      );
    }

    const validation = validatePropertySubmissionPayload(payload, {
      supabaseUrl,
      userId: user.id,
    });

    if (!validation.ok) {
      return json(
        {
          ok: false,
          errorType: "validation",
          message: "Fix the highlighted fields and try again.",
          fieldErrors: validation.fieldErrors,
        },
        { status: 400 }
      );
    }

    const supabaseAdmin = createAdminSupabaseClient(supabaseUrl, supabaseSecretKey);
    const duplicateWarning = await findDuplicateProperty(supabaseAdmin, validation.sanitized);

    if (duplicateWarning.isDuplicate) {
      return json(
        {
          ok: false,
          errorType: "duplicate",
          message: duplicateWarning.reason,
          duplicateWarning,
        },
        { status: 409 }
      );
    }

    const { data, error } = await supabaseAdmin
      .from("properties")
      .insert({
        user_id: user.id,
        title: validation.sanitized.title,
        description: validation.sanitized.description,
        property_type: validation.sanitized.propertyType,
        location: validation.sanitized.location,
        state: validation.sanitized.state,
        lga: validation.sanitized.lga,
        price: validation.sanitized.price,
        size: validation.sanitized.size,
        amenities: validation.sanitized.amenities,
        images: validation.sanitized.imageUrls,
        document_paths: validation.sanitized.documentPaths,
        owner_name: validation.sanitized.ownerName,
        owner_phone: validation.sanitized.ownerPhone,
        owner_email: validation.sanitized.ownerEmail,
        verification_type: validation.sanitized.verificationType,
        expected_investment: validation.sanitized.expectedInvestment,
        partnership_terms: validation.sanitized.partnershipTerms,
        developer_requirements: validation.sanitized.developerRequirements,
        land_size: validation.sanitized.landSize,
        proposed_development: validation.sanitized.proposedDevelopment,
        status: "pending_review",
      })
      .select("id, status")
      .single();

    if (error) {
      throw error;
    }

    return json({
      ok: true,
      propertyId: data.id,
      status: data.status,
    });
  } catch (error) {
    console.error("submit-property-listing error:", error);

    const errorCode =
      typeof error === "object" && error !== null && "code" in error ? String(error.code) : "";

    if (errorCode === "23505") {
      return json(
        {
          ok: false,
          errorType: "duplicate",
          message: "You have already submitted this property for review.",
          duplicateWarning: {
            isDuplicate: true,
            reason: "You have already submitted this property for review.",
            matches: [],
          },
        },
        { status: 409 }
      );
    }

    if (isSchemaNotReadyError(error)) {
      return json(
        {
          ok: false,
          errorType: "schema_not_ready",
          message: "Property submission is not ready yet on this environment.",
          hint: buildSchemaHint(),
        },
        { status: 503 }
      );
    }

    return json(
      {
        ok: false,
        errorType: "database",
        message: error instanceof Error ? error.message : "We could not submit this property right now.",
      },
      { status: 500 }
    );
  }
});
