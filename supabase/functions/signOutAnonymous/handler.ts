import type { FunctionDefinition } from "../_shared/handler.ts";
import { AppError, providerError } from "../_shared/errors.ts";

export const definition: FunctionDefinition = {
  name: "signOutAnonymous",
  roles: "anonymous",
  async execute(body, { admin, caller, log }) {
    if (Object.keys(body).length > 0) {
      throw new AppError("Send an empty JSON object.", 400, "invalid_body");
    }

    log.info("anonymous_user.deleting", { targetId: caller.id });
    // Hard deletion removes the Auth user and revokes their refresh sessions.
    const { error } = await admin.auth.admin.deleteUser(caller.id, false);
    if (error) {
      throw providerError(error, "Unable to delete the anonymous account.", "user_delete_failed");
    }

    log.info("anonymous_user.deleted");
    return { signedOut: true };
  },
};
