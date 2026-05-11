import { corsHeaders } from "../_shared/cors.ts";
import { getAdminClient } from "../_shared/adminClient.ts";
import { jsonResponse } from "../_shared/response.ts";
import { serializeError } from "../_shared/errors.ts";

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabaseAdmin = getAdminClient();

    const allUsers = [];
    let page = 1;
    const perPage = 1000;

    while (true) {
      const { data, error } = await supabaseAdmin.auth.admin.listUsers({
        page,
        perPage,
      });

      if (error) {
        return jsonResponse({ data: null, error: serializeError(error) }, 500);
      }

      allUsers.push(...data.users);
      if (data.users.length < perPage) break;
      page++;
    }

    const summary = {
      deletedUsersCount: 0,
      skippedAdminCount: 0,
      failedDeletes: [] as {
        userId: string;
        error: ReturnType<typeof serializeError>;
      }[],
    };

    for (const user of allUsers) {
      const role = user.user_metadata?.role;

      if (role === "admin") {
        summary.skippedAdminCount++;
        continue;
      }

      const { error: deleteError } = await supabaseAdmin.auth.admin.deleteUser(
        user.id,
      );

      if (deleteError) {
        summary.failedDeletes.push({
          userId: user.id,
          error: serializeError(deleteError),
        });
      } else {
        summary.deletedUsersCount++;
      }
    }

    return jsonResponse(summary, 200);
  } catch (err: unknown) {
    return jsonResponse({ data: null, error: serializeError(err) }, 500);
  }
});
