import { createClient, type SupabaseClient } from "npm:@supabase/supabase-js@2";

export const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

export const PROPERTY_IMAGE_BUCKET = "property-images";
export const PROPERTY_DOCUMENT_BUCKET = "property-documents";
const MAX_PROPERTY_IMAGE_FILES = 12;
const MAX_PROPERTY_DOCUMENT_FILES = 6;

const allowedPropertyTypes = new Set([
  "land",
  "rental",
  "building",
  "shop_rental",
  "joint_venture",
]);

const allowedVerificationTypes = new Set([
  "certificate",
  "deed",
  "survey",
  "receipt",
  "other",
]);

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const phoneCharactersPattern = /^[+\d\s()-]+$/;

export interface DuplicateMatch {
  title: string;
  location: string;
}

export interface DuplicateWarning {
  isDuplicate: boolean;
  reason: string;
  matches: DuplicateMatch[];
}

export interface PropertySubmissionPayload {
  propertyType: string;
  title: string;
  description: string;
  location: string;
  state: string;
  lga: string;
  price: string;
  size: string;
  amenities?: string[];
  ownerName: string;
  ownerPhone: string;
  ownerEmail: string;
  verificationType: string;
  expectedInvestment?: string;
  partnershipTerms?: string;
  developerRequirements?: string;
  landSize?: string;
  proposedDevelopment?: string;
  imageUrls: string[];
  documentPaths: string[];
}

export interface SanitizedPropertySubmissionPayload {
  propertyType: string;
  title: string;
  description: string;
  location: string;
  state: string;
  lga: string;
  price: string;
  size: string;
  amenities: string[];
  ownerName: string;
  ownerPhone: string;
  ownerEmail: string;
  verificationType: string;
  expectedInvestment: string | null;
  partnershipTerms: string | null;
  developerRequirements: string | null;
  landSize: string | null;
  proposedDevelopment: string | null;
  imageUrls: string[];
  documentPaths: string[];
}

const normalizeLine = (value: unknown) =>
  typeof value === "string" ? value.replace(/\s+/g, " ").trim() : "";

const normalizeParagraph = (value: unknown) =>
  typeof value === "string"
    ? value.replace(/\r\n/g, "\n").replace(/\n{3,}/g, "\n\n").trim()
    : "";

const toOptionalValue = (value: string) => (value.length > 0 ? value : null);

const isValidPublicImageUrl = (value: string, supabaseUrl: string, userId: string) =>
  value.startsWith(`${supabaseUrl}/storage/v1/object/public/${PROPERTY_IMAGE_BUCKET}/${userId}/`);

const isValidDocumentPath = (value: string, userId: string) =>
  value.startsWith(`${userId}/`) && value.includes("/documents/");

export const json = (body: unknown, init?: ResponseInit) =>
  Response.json(body, {
    ...init,
    headers: {
      ...corsHeaders,
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
  });

export const getSupabaseSecretKey = () => {
  const namedSecretKeys = Deno.env.get("SUPABASE_SECRET_KEYS");

  if (namedSecretKeys) {
    try {
      const parsedKeys = JSON.parse(namedSecretKeys) as Record<string, string>;

      if (parsedKeys.default) {
        return parsedKeys.default;
      }

      const firstKey = Object.values(parsedKeys)[0];
      if (firstKey) {
        return firstKey;
      }
    } catch (error) {
      console.error("Failed to parse SUPABASE_SECRET_KEYS:", error);
    }
  }

  return Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? null;
};

export const createUserSupabaseClient = (supabaseUrl: string, supabaseAnonKey: string, authHeader: string) =>
  createClient(supabaseUrl, supabaseAnonKey, {
    global: {
      headers: {
        Authorization: authHeader,
      },
    },
  });

export const createAdminSupabaseClient = (supabaseUrl: string, supabaseSecretKey: string) =>
  createClient(supabaseUrl, supabaseSecretKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });

export const sanitizePropertySubmissionPayload = (
  payload: PropertySubmissionPayload
): SanitizedPropertySubmissionPayload => ({
  propertyType: normalizeLine(payload.propertyType),
  title: normalizeLine(payload.title),
  description: normalizeParagraph(payload.description),
  location: normalizeLine(payload.location),
  state: normalizeLine(payload.state),
  lga: normalizeLine(payload.lga),
  price: normalizeLine(payload.price),
  size: normalizeLine(payload.size),
  amenities: Array.isArray(payload.amenities)
    ? payload.amenities.map((value) => normalizeLine(value)).filter(Boolean)
    : [],
  ownerName: normalizeLine(payload.ownerName),
  ownerPhone: normalizeLine(payload.ownerPhone),
  ownerEmail: normalizeLine(payload.ownerEmail).toLowerCase(),
  verificationType: normalizeLine(payload.verificationType),
  expectedInvestment: toOptionalValue(normalizeLine(payload.expectedInvestment)),
  partnershipTerms: toOptionalValue(normalizeParagraph(payload.partnershipTerms)),
  developerRequirements: toOptionalValue(normalizeParagraph(payload.developerRequirements)),
  landSize: toOptionalValue(normalizeLine(payload.landSize)),
  proposedDevelopment: toOptionalValue(normalizeLine(payload.proposedDevelopment)),
  imageUrls: Array.isArray(payload.imageUrls)
    ? payload.imageUrls.map((value) => normalizeLine(value)).filter(Boolean)
    : [],
  documentPaths: Array.isArray(payload.documentPaths)
    ? payload.documentPaths.map((value) => normalizeLine(value)).filter(Boolean)
    : [],
});

export const validatePropertySubmissionPayload = (
  payload: PropertySubmissionPayload,
  context: {
    supabaseUrl: string;
    userId: string;
  }
) => {
  const sanitized = sanitizePropertySubmissionPayload(payload);
  const fieldErrors: Record<string, string> = {};

  if (!allowedPropertyTypes.has(sanitized.propertyType)) {
    fieldErrors.propertyType = "Select a valid property type.";
  }

  if (sanitized.title.length < 5 || sanitized.title.length > 120) {
    fieldErrors.title = "Property title must be between 5 and 120 characters.";
  }

  if (sanitized.description.length < 20 || sanitized.description.length > 2000) {
    fieldErrors.description = "Description must be between 20 and 2000 characters.";
  }

  if (sanitized.location.length < 5 || sanitized.location.length > 200) {
    fieldErrors.location = "Address must be between 5 and 200 characters.";
  }

  if (!sanitized.state) {
    fieldErrors.state = "Select a state.";
  }

  if (!sanitized.lga) {
    fieldErrors.lga = "Select an LGA.";
  }

  if (sanitized.price.length < 2 || sanitized.price.length > 60 || !/\d/.test(sanitized.price)) {
    fieldErrors.price = "Enter a valid property price.";
  }

  if (sanitized.size.length < 2 || sanitized.size.length > 80) {
    fieldErrors.size = "Property size must be between 2 and 80 characters.";
  }

  if (sanitized.ownerName.length < 2 || sanitized.ownerName.length > 100) {
    fieldErrors.ownerName = "Full name must be between 2 and 100 characters.";
  }

  if (!phoneCharactersPattern.test(sanitized.ownerPhone)) {
    fieldErrors.ownerPhone = "Use only numbers, spaces, hyphens, parentheses, or a leading +.";
  } else {
    const digitsOnly = sanitized.ownerPhone.replace(/\D/g, "");
    if (digitsOnly.length < 10 || digitsOnly.length > 15) {
      fieldErrors.ownerPhone = "Phone number must contain 10 to 15 digits.";
    }
  }

  if (!emailPattern.test(sanitized.ownerEmail)) {
    fieldErrors.ownerEmail = "Enter a valid email address.";
  }

  if (!allowedVerificationTypes.has(sanitized.verificationType)) {
    fieldErrors.verificationType = "Select a valid document type.";
  }

  if (sanitized.imageUrls.length === 0) {
    fieldErrors.images = "Upload at least one property photo.";
  } else if (sanitized.imageUrls.length > MAX_PROPERTY_IMAGE_FILES) {
    fieldErrors.images = `You can upload up to ${MAX_PROPERTY_IMAGE_FILES} property photos.`;
  }

  if (sanitized.documentPaths.length === 0) {
    fieldErrors.documents = "Upload at least one legal document.";
  } else if (sanitized.documentPaths.length > MAX_PROPERTY_DOCUMENT_FILES) {
    fieldErrors.documents = `You can upload up to ${MAX_PROPERTY_DOCUMENT_FILES} legal documents.`;
  }

  if (
    sanitized.imageUrls.some(
      (value) => !isValidPublicImageUrl(value, context.supabaseUrl, context.userId)
    )
  ) {
    fieldErrors.images = "One or more property photos could not be verified.";
  }

  if (sanitized.documentPaths.some((value) => !isValidDocumentPath(value, context.userId))) {
    fieldErrors.documents = "One or more legal documents could not be verified.";
  }

  if (sanitized.propertyType === "joint_venture") {
    if (!sanitized.landSize) {
      fieldErrors.landSize = "Enter the land size.";
    }

    if (!sanitized.expectedInvestment) {
      fieldErrors.expectedInvestment = "Enter the expected investment amount.";
    }

    if (!sanitized.proposedDevelopment) {
      fieldErrors.proposedDevelopment = "Enter the proposed development type.";
    }

    if (!sanitized.partnershipTerms || sanitized.partnershipTerms.length < 10) {
      fieldErrors.partnershipTerms = "Partnership terms must be at least 10 characters.";
    }

    if (!sanitized.developerRequirements || sanitized.developerRequirements.length < 10) {
      fieldErrors.developerRequirements = "Developer requirements must be at least 10 characters.";
    }
  }

  if (Object.keys(fieldErrors).length > 0) {
    return {
      ok: false as const,
      fieldErrors,
      sanitized,
    };
  }

  return {
    ok: true as const,
    fieldErrors,
    sanitized,
  };
};

export const findDuplicateProperty = async (
  supabaseAdmin: SupabaseClient,
  payload: SanitizedPropertySubmissionPayload
): Promise<DuplicateWarning> => {
  const { data, error } = await supabaseAdmin
    .from("properties")
    .select("title, location, owner_email, status")
    .eq("property_type", payload.propertyType)
    .ilike("title", payload.title)
    .ilike("location", payload.location)
    .neq("status", "archived")
    .limit(5);

  if (error) {
    throw error;
  }

  if (!data || data.length === 0) {
    return {
      isDuplicate: false,
      reason: "",
      matches: [],
    };
  }

  const duplicateReason =
    data.some((match) => match.owner_email?.toLowerCase() === payload.ownerEmail)
      ? "You have already submitted this property for review."
      : "A matching property listing has already been submitted on this platform.";

  return {
    isDuplicate: true,
    reason: duplicateReason,
    matches: data.map((match) => ({
      title: match.title,
      location: match.location,
    })),
  };
};

export const isSchemaNotReadyError = (error: unknown) => {
  const errorCode =
    typeof error === "object" && error !== null && "code" in error ? String(error.code) : "";
  const errorMessage = error instanceof Error ? error.message.toLowerCase() : String(error).toLowerCase();

  return (
    errorCode === "PGRST205" ||
    errorCode === "42P01" ||
    errorCode === "42703" ||
    errorMessage.includes("public.properties") ||
    errorMessage.includes("schema cache") ||
    errorMessage.includes("document_paths") ||
    errorMessage.includes("property-images")
  );
};
