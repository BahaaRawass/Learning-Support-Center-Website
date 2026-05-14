import { corsHeaders } from "../_shared/cors.ts";
import { getAdminClient } from "../_shared/adminClient.ts";
import { jsonResponse, parseJsonBody } from "../_shared/response.ts";
import { serializeError } from "../_shared/errors.ts";

interface CreateUserRequest {
  email: string;
  password: string;
  displayname: string;
  isSupervisor: boolean;
  department_id: number;
}

type ResendEmailResponse = {
  id?: string;
  message?: string;
};

async function sendConfirmationEmail(params: {
  to: string;
  displayName: string;
  confirmationLink: string;
}) {
  const resendApiKey =
    Deno.env.get("RESEND_API_KEY") ?? Deno.env.get("VITE_RESEND_API_KEY");

  if (!resendApiKey) {
    throw new Error("Missing RESEND_API_KEY environment variable");
  }

  const from = Deno.env.get("VITE_RESEND_FROM_EMAIL");

  if (!from) {
    throw new Error("Missing VITE_RESEND_FROM_EMAIL environment variable");
  }

  console.log("[createUser] Sending email from:", from);

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${resendApiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from,
      to: [params.to],
      subject: "Confirm your Learning Support Center account",
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
          </head>
          <body style="margin: 0; padding: 0; font-family: 'Inter Variable', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background-color: #faf8f4;">
            <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border: 1px solid #f0ede8;">
              <!-- Header with Logo -->
              <div style="background: linear-gradient(135deg, #5a1d67 0%, #6e2479 100%); padding: 40px 20px; text-align: center;">
                <img src="https://arcoqekgvzhxjlwwcked.supabase.co/storage/v1/object/public/Profile%20Pictures/rhu_logo.png" alt="RHU Learning Support Center" style="max-width: 120px; height: auto; margin-bottom: 20px;">
                <h1 style="color: #ffffff; margin: 0; font-size: 24px; font-weight: 600;">Learning Support Center</h1>
              </div>

              <!-- Main Content -->
              <div style="padding: 40px 30px; color: #1a1612;">
                <p style="margin: 0 0 20px 0; font-size: 16px;">Hello <strong>${params.displayName}</strong>,</p>
                
                <p style="margin: 0 0 30px 0; font-size: 15px; line-height: 1.6; color: #4a4238;">
                  Welcome to the Learning Support Center! Your account has been successfully created. To complete your registration, please verify your email address by clicking the button below.
                </p>

                <!-- CTA Button -->
                <div style="text-align: center; margin: 40px 0;">
                  <a href="${params.confirmationLink}" style="display: inline-block; background: linear-gradient(135deg, #c4973c 0%, #e8c47a 100%); color: #1a1612; padding: 14px 40px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 16px; box-shadow: 0 2px 8px rgba(196, 151, 60, 0.2);">
                    Confirm Your Email
                  </a>
                </div>

                <!-- Fallback Link -->
                <p style="margin: 30px 0 0 0; font-size: 13px; color: #8a8178; line-height: 1.6;">
                  If the button above doesn't work, copy and paste this link into your browser:
                </p>
                <p style="margin: 10px 0; padding: 12px; background-color: #f5f3ef; border-left: 3px solid #c4973c; font-size: 12px; color: #4a4238; word-break: break-all; overflow-wrap: break-word;">
                  ${params.confirmationLink}
                </p>

                <!-- Footer Note -->
                <p style="margin: 30px 0 0 0; font-size: 13px; color: #8a8178; line-height: 1.6;">
                  This link will expire in 24 hours. If you did not request this account, please ignore this email.
                </p>
              </div>

              <!-- Footer -->
              <div style="background-color: #faf8f4; padding: 30px; text-align: center; border-top: 1px solid #f0ede8;">
                <p style="margin: 0; font-size: 12px; color: #8a8178;">
                  Learning Support Center<br>
                  Questions? Contact us for support.
                </p>
              </div>
            </div>
          </body>
        </html>
      `,
      text: [
        `Hello ${params.displayName},`,
        "",
        "Your account has been created. Please confirm your email address using the link below:",
        params.confirmationLink,
      ].join("\n"),
    }),
  });

  if (!response.ok) {
    const errorBody = (await response.json()) as ResendEmailResponse;
    throw new Error(errorBody.message ?? "Failed to send confirmation email");
  }

  return (await response.json()) as ResendEmailResponse;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const body = await parseJsonBody<CreateUserRequest>(req);
    console.log(
      "[createUser] Received request body:",
      JSON.stringify(body, null, 2),
    );
    const { email, password, displayname, isSupervisor, department_id } = body;

    console.log("[createUser] Validating email:", email, "type:", typeof email);
    if (!email || typeof email !== "string") {
      console.error("[createUser] Email validation failed");
      return jsonResponse(
        { data: null, error: { message: "Missing or invalid field: email" } },
        400,
      );
    }
    console.log("[createUser] Email validation passed");

    console.log(
      "[createUser] Validating password:",
      password ? "***" : "missing",
      "type:",
      typeof password,
    );
    if (!password || typeof password !== "string") {
      console.error("[createUser] Password validation failed");
      return jsonResponse(
        {
          data: null,
          error: { message: "Missing or invalid field: password" },
        },
        400,
      );
    }
    console.log("[createUser] Password validation passed");

    console.log(
      "[createUser] Validating displayname:",
      displayname,
      "type:",
      typeof displayname,
    );
    if (!displayname || typeof displayname !== "string") {
      console.error("[createUser] Displayname validation failed");
      return jsonResponse(
        {
          data: null,
          error: { message: "Missing or invalid field: displayname" },
        },
        400,
      );
    }
    console.log("[createUser] Displayname validation passed");

    console.log(
      "[createUser] Validating isSupervisor:",
      isSupervisor,
      "type:",
      typeof isSupervisor,
    );
    if (typeof isSupervisor !== "boolean") {
      console.error(
        "[createUser] isSupervisor validation failed. Got type:",
        typeof isSupervisor,
      );
      return jsonResponse(
        {
          data: null,
          error: {
            message: "Missing or invalid field: isSupervisor (must be boolean)",
          },
        },
        400,
      );
    }
    console.log("[createUser] isSupervisor validation passed");

    console.log(
      "[createUser] Validating department_id:",
      department_id,
      "type:",
      typeof department_id,
    );
    if (typeof department_id !== "number" || isNaN(department_id)) {
      console.error(
        "[createUser] department_id validation failed. Got type:",
        typeof department_id,
        "value:",
        department_id,
        "isNaN:",
        isNaN(department_id),
      );
      return jsonResponse(
        {
          data: null,
          error: {
            message:
              "Missing or invalid field: department_id (must be a valid number)",
          },
        },
        400,
      );
    }
    console.log("[createUser] department_id validation passed");

    const role: "admin" | "workstudy" = isSupervisor ? "admin" : "workstudy";
    console.log("[createUser] Creating user with role:", role);
    const supabaseAdmin = getAdminClient();

    const { data: User, error: CreateError } =
      await supabaseAdmin.auth.admin.createUser({
        email,
        password,
        email_confirm: false,
        user_metadata: { display_name: displayname, role, department_id },
      });

    if (CreateError) {
      console.error(
        "[createUser] User creation error:",
        serializeError(CreateError),
      );
      return jsonResponse(
        { data: null, error: serializeError(CreateError) },
        400,
      );
    }

    console.log(
      "[createUser] User created successfully with ID:",
      User?.user.id,
    );

    const { data: LinkData, error: LinkError } =
      await supabaseAdmin.auth.admin.generateLink({
        type: "signup",
        email,
        password,
      });

    if (LinkError) {
      console.error(
        "[createUser] Link generation error:",
        serializeError(LinkError),
      );
      return jsonResponse(
        { data: null, error: serializeError(LinkError) },
        400,
      );
    }

    console.log("[createUser] Confirmation link generated successfully");
    const confirmationLink = LinkData?.properties?.action_link;

    if (!confirmationLink) {
      console.error("[createUser] No confirmation link returned from Supabase");
      return jsonResponse(
        {
          data: null,
          error: { message: "Supabase did not return a confirmation link" },
        },
        500,
      );
    }

    console.log("[createUser] Sending confirmation email to:", email);
    try {
      await sendConfirmationEmail({
        to: email,
        displayName: displayname,
        confirmationLink,
      });
      console.log("[createUser] Confirmation email sent successfully");
    } catch (err: unknown) {
      console.error("[createUser] Email sending error:", serializeError(err));
      return jsonResponse({ data: null, error: serializeError(err) }, 400);
    }

    console.log("[createUser] Returning success response");
    return jsonResponse({ data: User, error: null }, 201);
  } catch (err: unknown) {
    console.error("[createUser] Unexpected error:", serializeError(err));
    return jsonResponse({ data: null, error: serializeError(err) }, 500);
  }
});
