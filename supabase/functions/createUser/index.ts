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

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const body = await parseJsonBody<CreateUserRequest>(req);
    const { email, password, displayname, isSupervisor, department_id } = body;

    if (!email || typeof email !== "string") {
      return jsonResponse(
        { data: null, error: { message: "Missing or invalid field: email" } },
        400,
      );
    }
    if (!password || typeof password !== "string") {
      return jsonResponse(
        {
          data: null,
          error: { message: "Missing or invalid field: password" },
        },
        400,
      );
    }
    if (!displayname || typeof displayname !== "string") {
      return jsonResponse(
        {
          data: null,
          error: { message: "Missing or invalid field: displayname" },
        },
        400,
      );
    }
    if (typeof isSupervisor !== "boolean") {
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
    if (typeof department_id !== "number") {
      return jsonResponse(
        {
          data: null,
          error: {
            message: "Missing or invalid field: department_id (must be number)",
          },
        },
        400,
      );
    }

    const role: "admin" | "workstudy" = isSupervisor ? "admin" : "workstudy";
    const supabaseAdmin = getAdminClient();

    const { data: User, error: CreateError } =
      await supabaseAdmin.auth.admin.createUser({
        email,
        password,
        email_confirm: false,
        user_metadata: { display_name: displayname, role, department_id },
      });

    const { error: EmailConfirmationError } =
      await supabaseAdmin.auth.admin.generateLink({
        type: "signup",
        email,
        password,
      });

    const error = CreateError || EmailConfirmationError;

    if (error) {
      return jsonResponse({ data: null, error: serializeError(error) }, 400);
    }

    return jsonResponse({ data: User, error: null }, 201);
  } catch (err: unknown) {
    return jsonResponse({ data: null, error: serializeError(err) }, 500);
  }
});
