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
  const supabaseSecretKey = getSupabaseSecretKey();
  const paystackSecretKey = Deno.env.get("PAYSTACK_SECRET_KEY");

  if (!supabaseUrl || !supabaseSecretKey || !paystackSecretKey) {
    return json({ error: "Missing Supabase or Paystack secrets." }, { status: 500 });
  }

  const body = await req.json().catch(() => null) as { reference?: string } | null;
  const reference = body?.reference?.trim();

  if (!reference) {
    return json({ error: "Payment reference is required." }, { status: 400 });
  }

  const paystackResponse = await fetch(
    `https://api.paystack.co/transaction/verify/${encodeURIComponent(reference)}`,
    {
      headers: {
        Authorization: `Bearer ${paystackSecretKey}`,
      },
    }
  );

  const paystackData = await paystackResponse.json().catch(() => null);
  if (!paystackResponse.ok || !paystackData?.status) {
    return json(
      { error: paystackData?.message || "Could not verify Paystack payment." },
      { status: paystackResponse.status || 500 }
    );
  }

  const transaction = paystackData.data;
  if (transaction?.status !== "success") {
    return json({ error: "Payment was not successful yet.", status: transaction?.status }, { status: 400 });
  }

  const supabaseAdmin = createClient(supabaseUrl, supabaseSecretKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  const metadata = transaction.metadata || {};
  const purpose = metadata.purpose || "wallet_topup";
  const userId = metadata.user_id as string | undefined;
  const campaignId = metadata.campaign_id as string | undefined;
  const amount = Number(transaction.amount || 0) / 100;

  if (!userId) {
    return json({ error: "Payment metadata is missing user information." }, { status: 400 });
  }

  if (purpose === "ad_campaign") {
    if (!campaignId) {
      return json({ error: "Payment metadata is missing campaign information." }, { status: 400 });
    }

    const { data: campaign, error: campaignError } = await supabaseAdmin
      .from("ad_campaigns")
      .select("id, total_budget")
      .eq("id", campaignId)
      .eq("user_id", userId)
      .single();

    if (campaignError || !campaign) {
      return json({ error: "Campaign was not found for this payment." }, { status: 404 });
    }

    if (Number(campaign.total_budget) !== amount) {
      return json({ error: "Verified amount does not match the campaign budget." }, { status: 400 });
    }

    await supabaseAdmin
      .from("ad_payments")
      .update({ payment_status: "success" })
      .eq("transaction_reference", reference)
      .eq("campaign_id", campaignId);

    const { data: adSets, error: adSetsError } = await supabaseAdmin
      .from("ad_sets")
      .select("id")
      .eq("campaign_id", campaignId);

    if (adSetsError) return json({ error: adSetsError.message }, { status: 500 });

    const adSetIds = (adSets || []).map((adSet) => adSet.id);

    const { error: campaignUpdateError } = await supabaseAdmin
      .from("ad_campaigns")
      .update({ status: "pending_review" })
      .eq("id", campaignId);

    if (campaignUpdateError) return json({ error: campaignUpdateError.message }, { status: 500 });

    if (adSetIds.length > 0) {
      const { error: adSetUpdateError } = await supabaseAdmin
        .from("ad_sets")
        .update({ status: "pending_review" })
        .in("id", adSetIds);

      if (adSetUpdateError) return json({ error: adSetUpdateError.message }, { status: 500 });

      const { error: adUpdateError } = await supabaseAdmin
        .from("ads")
        .update({ status: "pending_review", rejection_reason: null })
        .in("ad_set_id", adSetIds);

      if (adUpdateError) return json({ error: adUpdateError.message }, { status: 500 });
    }

    return json({ success: true, purpose, campaignId, amount });
  }

  const { data: wallet, error: walletError } = await supabaseAdmin
    .from("wallets")
    .select("*")
    .eq("user_id", userId)
    .maybeSingle();

  if (walletError) return json({ error: walletError.message }, { status: 500 });

  const walletRecord = wallet || (await supabaseAdmin
    .from("wallets")
    .insert({ user_id: userId, balance: 0 })
    .select()
    .single()).data;

  if (!walletRecord) {
    return json({ error: "Could not create wallet record." }, { status: 500 });
  }

  const { data: existingTransaction } = await supabaseAdmin
    .from("wallet_transactions")
    .select("id")
    .eq("reference", reference)
    .maybeSingle();

  if (!existingTransaction) {
    const nextBalance = Number(walletRecord.balance || 0) + amount;
    const { error: updateWalletError } = await supabaseAdmin
      .from("wallets")
      .update({ balance: nextBalance })
      .eq("id", walletRecord.id);

    if (updateWalletError) return json({ error: updateWalletError.message }, { status: 500 });

    const { error: transactionError } = await supabaseAdmin.from("wallet_transactions").insert({
      wallet_id: walletRecord.id,
      user_id: userId,
      type: "credit",
      amount,
      description: "Wallet top-up via Paystack",
      reference,
      payment_method: "paystack",
      status: "success",
    });

    if (transactionError) return json({ error: transactionError.message }, { status: 500 });
  }

  return json({ success: true, purpose, amount });
});
