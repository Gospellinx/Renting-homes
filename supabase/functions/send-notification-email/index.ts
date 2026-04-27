import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface NotificationEmailRequest {
  notificationId: string;
  recipientUserId: string;
  type: string;
  title: string;
  message: string;
  subject?: string;
  actionUrl?: string;
}

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

const escapeHtml = (value: string) =>
  value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");

const getCallToActionLabel = (type: string) => {
  switch (type) {
    case "new_message":
      return "Open Messages";
    case "connection_request":
      return "Review Request";
    case "connection_accepted":
      return "Open Connection";
    case "verification_approved":
    case "verification_rejected":
    case "verification":
      return "View Update";
    default:
      return "Open Homes Nigeria";
  }
};

const getNotificationCategory = (type: string) => {
  switch (type) {
    case "new_message":
      return "Message";
    case "connection_request":
    case "connection_accepted":
      return "Community";
    case "verification_approved":
    case "verification_rejected":
    case "verification":
      return "Verification";
    default:
      return "Notification";
  }
};

const shouldSendEmailForType = (
  type: string,
  preferences: {
    email_notifications_enabled?: boolean;
    email_verification_notifications?: boolean;
    email_connection_notifications?: boolean;
    email_message_notifications?: boolean;
  } | null
) => {
  if (preferences?.email_notifications_enabled === false) {
    return {
      allowed: false,
      reason: "email_notifications_disabled",
    };
  }

  if (
    (type === "verification" ||
      type === "verification_approved" ||
      type === "verification_rejected") &&
    preferences?.email_verification_notifications === false
  ) {
    return {
      allowed: false,
      reason: "verification_notifications_disabled",
    };
  }

  if (
    (type === "connection_request" || type === "connection_accepted") &&
    preferences?.email_connection_notifications === false
  ) {
    return {
      allowed: false,
      reason: "connection_notifications_disabled",
    };
  }

  if (type === "new_message" && preferences?.email_message_notifications === false) {
    return {
      allowed: false,
      reason: "message_notifications_disabled",
    };
  }

  return {
    allowed: true,
    reason: null,
  };
};

const buildAbsoluteUrl = (value?: string) => {
  if (!value) {
    return null;
  }

  if (/^https?:\/\//i.test(value)) {
    return value;
  }

  const siteUrl = Deno.env.get("SITE_URL");

  if (!siteUrl) {
    return null;
  }

  try {
    return new URL(value, siteUrl).toString();
  } catch (error) {
    console.error("Invalid SITE_URL or action URL:", error);
    return null;
  }
};

const buildTextBody = ({
  recipientName,
  title,
  message,
  actionUrl,
}: {
  recipientName: string;
  title: string;
  message: string;
  actionUrl: string | null;
}) => {
  const lines = [
    `Hello ${recipientName},`,
    "",
    title,
    message,
    "",
    actionUrl ? `Open Homes Nigeria: ${actionUrl}` : "Open Homes Nigeria to view this update.",
    "",
    "Homes Nigeria",
  ];

  return lines.join("\n");
};

const buildHtmlBody = ({
  recipientName,
  category,
  title,
  message,
  actionUrl,
  ctaLabel,
}: {
  recipientName: string;
  category: string;
  title: string;
  message: string;
  actionUrl: string | null;
  ctaLabel: string;
}) => {
  const safeRecipientName = escapeHtml(recipientName);
  const safeCategory = escapeHtml(category);
  const safeTitle = escapeHtml(title);
  const safeMessage = escapeHtml(message);
  const safeActionUrl = actionUrl ? escapeHtml(actionUrl) : null;

  return `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${safeTitle}</title>
  </head>
  <body style="margin:0;padding:0;background:#f5efe4;font-family:Arial,sans-serif;color:#1f2937;">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#f5efe4;padding:24px 12px;">
      <tr>
        <td align="center">
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:600px;background:#ffffff;border-radius:18px;overflow:hidden;">
            <tr>
              <td style="background:#0f766e;padding:28px 32px;color:#ffffff;">
                <div style="font-size:12px;letter-spacing:0.12em;text-transform:uppercase;opacity:0.8;">Homes Nigeria</div>
                <div style="margin-top:10px;font-size:28px;font-weight:700;line-height:1.25;">${safeTitle}</div>
              </td>
            </tr>
            <tr>
              <td style="padding:32px;">
                <div style="display:inline-block;margin-bottom:16px;background:#ecfeff;color:#0f766e;border-radius:999px;padding:6px 12px;font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:0.08em;">
                  ${safeCategory}
                </div>
                <p style="margin:0 0 16px;font-size:16px;line-height:1.6;">Hello ${safeRecipientName},</p>
                <p style="margin:0 0 16px;font-size:16px;line-height:1.6;">${safeMessage}</p>
                ${
                  safeActionUrl
                    ? `<p style="margin:28px 0 0;">
                  <a href="${safeActionUrl}" style="display:inline-block;background:#0f766e;color:#ffffff;text-decoration:none;padding:12px 18px;border-radius:10px;font-size:14px;font-weight:700;">
                    ${escapeHtml(ctaLabel)}
                  </a>
                </p>`
                    : ""
                }
              </td>
            </tr>
            <tr>
              <td style="padding:0 32px 28px;color:#6b7280;font-size:13px;line-height:1.6;">
                You are receiving this email because email notifications are enabled on your Homes Nigeria account.
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return json({ error: "Method not allowed" }, { status: 405 });
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const supabaseSecretKey = getSupabaseSecretKey();
  const resendApiKey = Deno.env.get("RESEND_API_KEY");
  const emailFrom = Deno.env.get("EMAIL_FROM");

  if (!supabaseUrl || !supabaseSecretKey || !resendApiKey || !emailFrom) {
    return json(
      {
        error:
          "Missing required secrets. Expected SUPABASE_URL, a Supabase secret key, RESEND_API_KEY, and EMAIL_FROM.",
      },
      { status: 500 }
    );
  }

  let body: NotificationEmailRequest;

  try {
    body = (await req.json()) as NotificationEmailRequest;
  } catch {
    return json({ error: "Invalid JSON body" }, { status: 400 });
  }

  if (!body.recipientUserId || !body.title || !body.message) {
    return json(
      {
        error: "recipientUserId, title, and message are required.",
      },
      { status: 400 }
    );
  }

  const supabaseAdmin = createClient(supabaseUrl, supabaseSecretKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });

  const { data: profile, error: profileError } = await supabaseAdmin
    .from("profiles")
    .select(
      "full_name, email_notifications_enabled, email_verification_notifications, email_connection_notifications, email_message_notifications"
    )
    .eq("user_id", body.recipientUserId)
    .maybeSingle();

  if (profileError) {
    return json({ error: profileError.message }, { status: 500 });
  }

  const emailPreferenceCheck = shouldSendEmailForType(body.type, profile);

  if (!emailPreferenceCheck.allowed) {
    return json({
      success: true,
      skipped: true,
      reason: emailPreferenceCheck.reason,
      notificationId: body.notificationId,
    });
  }

  const { data: authUserData, error: authError } =
    await supabaseAdmin.auth.admin.getUserById(body.recipientUserId);

  if (authError || !authUserData.user?.email) {
    return json(
      {
        error: authError?.message || "Recipient email address was not found.",
      },
      { status: 404 }
    );
  }

  const recipientEmail = authUserData.user.email;
  const fallbackName =
    typeof authUserData.user.user_metadata?.full_name === "string"
      ? authUserData.user.user_metadata.full_name.trim()
      : "";
  const recipientName =
    profile?.full_name?.trim() || fallbackName || recipientEmail.split("@")[0];
  const actionUrl = buildAbsoluteUrl(body.actionUrl);
  const category = getNotificationCategory(body.type);
  const subject = body.subject?.trim() || `[Homes Nigeria] ${body.title}`;

  const resendResponse = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${resendApiKey}`,
      "Content-Type": "application/json",
      "User-Agent": "homes-nigeria-edge-function/1.0",
    },
    body: JSON.stringify({
      from: emailFrom,
      to: [recipientEmail],
      subject,
      html: buildHtmlBody({
        recipientName,
        category,
        title: body.title,
        message: body.message,
        actionUrl,
        ctaLabel: getCallToActionLabel(body.type),
      }),
      text: buildTextBody({
        recipientName,
        title: body.title,
        message: body.message,
        actionUrl,
      }),
    }),
  });

  const resendData = await resendResponse.json().catch(() => null);

  if (!resendResponse.ok) {
    const resendMessage =
      resendData && typeof resendData.message === "string"
        ? resendData.message
        : "Failed to send notification email.";

    return json({ error: resendMessage }, { status: resendResponse.status });
  }

  return json({
    success: true,
    skipped: false,
    notificationId: body.notificationId,
    id: resendData?.id ?? null,
  });
});
