import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const json = (body: unknown, init?: ResponseInit) =>
  Response.json(body, {
    ...init,
    headers: {
      ...corsHeaders,
      "Content-Type": "application/json",
      ...(init?.headers || {}),
    },
  });

const getSupabaseSecretKey = () => {
  const namedSecretKeys = Deno.env.get("SUPABASE_SECRET_KEYS");

  if (namedSecretKeys) {
    try {
      const parsedKeys = JSON.parse(namedSecretKeys) as Record<string, string>;
      return parsedKeys.default || Object.values(parsedKeys)[0] || null;
    } catch {
      return null;
    }
  }

  return Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return json({ error: "Method not allowed" }, { status: 405 });

  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY");
  const supabaseSecretKey = getSupabaseSecretKey();
  const paystackSecretKey = Deno.env.get("PAYSTACK_SECRET_KEY");

  if (!supabaseUrl || !supabaseAnonKey || !supabaseSecretKey || !paystackSecretKey) {
    return json({ error: "Missing Supabase or Paystack secrets." }, { status: 500 });
  }

  const authHeader = req.headers.get("Authorization") || "";
  const supabaseUser = createClient(supabaseUrl, supabaseAnonKey, {
    global: { headers: { Authorization: authHeader } },
  });
  const supabaseAdmin = createClient(supabaseUrl, supabaseSecretKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  const { data: userData, error: userError } = await supabaseUser.auth.getUser();
  if (userError || !userData.user) {
    return json({ error: "You must be signed in to initialize payment." }, { status: 401 });
  }

  const body = await req.json().catch(() => null) as {
    amount?: number;
    email?: string;
    campaignId?: string;
    purpose?: "wallet_topup" | "ad_campaign";
    callbackUrl?: string;
  } | null;

  const amount = Number(body?.amount || 0);
  const email = body?.email?.trim() || userData.user.email;
  const purpose = body?.purpose || "wallet_topup";
  const campaignId = body?.campaignId || null;

  if (!email || amount <= 0) {
    return json({ error: "A valid email and amount are required." }, { status: 400 });
  }

  if (purpose === "ad_campaign") {
    if (!campaignId) return json({ error: "campaignId is required for ad campaign payments." }, { status: 400 });

    const { data: campaign, error: campaignError } = await supabaseAdmin
      .from("ad_campaigns")
      .select("id, user_id, total_budget")
      .eq("id", campaignId)
      .eq("user_id", userData.user.id)
      .single();

    if (campaignError || !campaign) {
      return json({ error: "Campaign was not found for this user." }, { status: 404 });
    }

    if (Number(campaign.total_budget) !== amount) {
      return json({ error: "Payment amount must match the campaign budget." }, { status: 400 });
    }
  }

  const siteUrl = Deno.env.get("SITE_URL") || req.headers.get("origin") || "";
  const callbackUrl =
    body?.callbackUrl ||
    (siteUrl ? `${siteUrl.replace(/\/+$/, "")}/ads-manager?payment=verify` : undefined);

  const paystackResponse = await fetch("https://api.paystack.co/transaction/initialize", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${paystackSecretKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      email,
      amount: Math.round(amount * 100),
      callback_url: callbackUrl,
      metadata: {
        user_id: userData.user.id,
        purpose,
        campaign_id: campaignId,
      },
    }),
  });

  const paystackData = await paystackResponse.json().catch(() => null);
  if (!paystackResponse.ok || !paystackData?.status) {
    return json(
      { error: paystackData?.message || "Could not initialize Paystack payment." },
      { status: paystackResponse.status || 500 }
    );
  }

  const reference = paystackData.data?.reference || null;

  if (purpose === "ad_campaign" && campaignId && reference) {
    const { error: paymentError } = await supabaseAdmin.from("ad_payments").insert({
      user_id: userData.user.id,
      campaign_id: campaignId,
      amount,
      payment_method: "paystack",
      payment_status: "pending",
      transaction_reference: reference,
    });

    if (paymentError) {
      return json({ error: paymentError.message }, { status: 500 });
    }
  }

  return json({
    success: true,
    authorization_url: paystackData.data?.authorization_url,
    access_code: paystackData.data?.access_code,
    reference,
    data: paystackData.data,
  });
});
