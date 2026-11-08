import type { FunctionDefinition } from "../_shared/handler.ts";
import { AppError, providerError } from "../_shared/errors.ts";
import { invalid, stringField } from "../_shared/validation.ts";

export const definition: FunctionDefinition = {
  name: "deleteUser",
  roles: ["admin", "workstudy"],
  async execute(body, { admin, caller, log }) {
    log.info("input.validation.started");
    const userId = stringField(body, "userId", 36).toLowerCase();
    if (
      !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
        userId,
      )
    )
      invalid("userId");
    log.info("input.validation.completed");
    // Check ownership before looking up the target or touching their files.
    // Only the verified caller's ID and protected role grant access.
    log.info("target.authorization_started");
    if (
      caller.app_metadata.role !== "admin" &&
      userId !== caller.id.toLowerCase()
    ) {
      throw new AppError(
        "You can only delete your own account.",
        403,
        "forbidden",
      );
    }
    log.info("target.authorization_completed");
    log.info("user.lookup_started", { targetId: userId });
    const { data, error } = await admin.auth.admin.getUserById(userId);
    if (error) {
      if (error.status === 404 || error.code === "user_not_found")
        throw new AppError("User not found.", 404, "user_not_found");
      throw providerError(
        error,
        "Unable to look up the user.",
        "user_lookup_failed",
      );
    }
    if (!data.user)
      throw new AppError("User not found.", 404, "user_not_found");
    log.info("user.found");

    // Storage ownership can prevent Auth deletion. Keep the existing profile
    // cleanup, but paginate it and fail explicitly instead of swallowing errors.
    const bucket = admin.storage.from(
      Deno.env.get("PROFILE_PICTURES_BUCKET") ?? "Profile Pictures",
    );
    log.info("profile.cleanup_started");
    while (true) {
      const { data: files, error: listError } = await bucket.list(userId, {
        limit: 100,
        offset: 0,
      });
      if (listError)
        throw providerError(
          listError,
          "Unable to list profile files.",
          "profile_cleanup_failed",
        );
      if (!files?.length) break;
      // The app stores flat files under <userId>/. Do not silently skip folders.
      if (files.some((file) => !file.id))
        throw new AppError(
          "Nested profile folders require administrator cleanup before deletion.",
          409,
          "profile_cleanup_required",
        );
      const { error: removeError } = await bucket.remove(
        files.map((file) => `${userId}/${file.name}`),
      );
      if (removeError)
        throw providerError(
          removeError,
          "Unable to remove profile files.",
          "profile_cleanup_failed",
        );
      log.info("profile.batch_removed", { count: files.length });
    }
    log.info("profile.cleanup_completed");
    log.info("user.deleting");
    const { error: deleteError } = await admin.auth.admin.deleteUser(
      userId,
      false,
    );
    if (deleteError)
      throw providerError(
        deleteError,
        "Unable to delete the account.",
        "user_delete_failed",
      );
    // Hard deletion cascades to auth.sessions and refresh tokens. signOut()
    // requires the TARGET'S JWT, not a user ID or the calling admin's JWT.
    // The shared getUser guard rejects this user's outstanding JWTs immediately.
    log.info("user.deleted");
    log.info("user.sessions_revoked");
    return { userId, message: "User deleted successfully." };
  },
};
