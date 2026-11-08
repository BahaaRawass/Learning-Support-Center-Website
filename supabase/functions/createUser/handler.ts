import type { FunctionDefinition } from "../_shared/handler.ts";
import { AppError, providerError, serializeError } from "../_shared/errors.ts";
import {
  emailField,
  httpUrl,
  invalid,
  stringField,
} from "../_shared/validation.ts";
import { emailConfiguration } from "../_shared/email.ts";
import type { SendEmailResponse } from "../_shared/contracts.ts";

export const definition: FunctionDefinition = {
  name: "createUser",
  roles: ["admin"],
  status: 201,
  async execute(body, { admin, token, requestId, log }) {
    log.info("input.validation.started");
    const email = emailField(body, "email");
    const password = stringField(body, "password", 1024, false);
    const displayname = stringField(body, "displayname", 200);
    const { role, department_id } = body;
    if (role !== "admin" && role !== "workstudy") invalid("role");
    if (
      typeof department_id !== "number" ||
      !Number.isSafeInteger(department_id) ||
      department_id <= 0
    )
      invalid("department_id");
    log.info("input.validation.completed");
    const { from } = emailConfiguration();
    const redirect = Deno.env.get("AUTH_CONFIRM_REDIRECT_URL");
    const redirectTo = redirect
      ? httpUrl(redirect, "AUTH_CONFIRM_REDIRECT_URL")
      : undefined;
    log.info("department.checking");
    const { data: department, error: departmentError } = await admin
      .from("Department")
      .select("id")
      .eq("id", department_id)
      .maybeSingle();
    if (departmentError)
      throw providerError(
        departmentError,
        "Unable to verify the department.",
        "department_lookup_failed",
      );
    if (!department)
      throw new AppError("Department not found.", 400, "department_not_found");
    log.info("department.verified");

    log.info("user.creating");
    const { data, error } = await admin.auth.admin.createUser({
      email,
      password,
      email_confirm: false,
      app_metadata: { role, department_id },
      // Kept for existing profile consumers; never used for authorization.
      user_metadata: { display_name: displayname, role, department_id },
    });
    if (error)
      throw providerError(
        error,
        "Unable to create the account. Check the email and password requirements.",
        "user_create_failed",
      );
    if (!data.user)
      throw new AppError(
        "Account creation returned no user.",
        502,
        "user_create_failed",
      );
    const user = data.user;
    log.info("user.created", { targetId: user.id });

    try {
      log.info("confirmation.generating");
      const { data: link, error: linkError } =
        await admin.auth.admin.generateLink({
          type: "signup",
          email,
          password,
          options: { redirectTo },
        });
      if (linkError)
        throw providerError(
          linkError,
          "Unable to generate the confirmation link.",
          "confirmation_link_failed",
        );
      if (!link?.properties?.action_link || link.user?.id !== user.id) {
        throw new AppError(
          "Unable to generate the confirmation link for this account.",
          502,
          "confirmation_link_failed",
        );
      }
      log.info("confirmation.generated");
      log.info("confirmation.email_invoking");
      // Forward the authenticated admin's JWT, never the service role as an
      // authorization shortcut. sendEmail repeats the same live caller checks.
      const { data: sent, error: sendError } =
        await admin.functions.invoke<SendEmailResponse>("sendEmail", {
          headers: {
            Authorization: `Bearer ${token}`,
            "x-request-id": requestId,
          },
          body: {
            to: email,
            from,
            subject: "Confirm your Learning Support Center account",
            message: `Hello ${displayname},\n\nWelcome to the Learning Support Center! Your account has been created. Please confirm your email address to complete registration.\n\nIf you were not expecting this account, please contact the Learning Support Center.`,
            buttontext: "Confirm your email",
            buttonAction: link.properties.action_link,
          },
          timeout: 20_000,
        });
      if (sendError) {
        // Do not echo nested provider bodies (or the confirmation link).
        log.error("confirmation.email_failed", {
          code: "confirmation_email_failed",
        });
        throw new AppError(
          "Unable to send the confirmation email.",
          502,
          "confirmation_email_failed",
        );
      }
      if (sent?.error || !sent?.data?.id)
        throw new AppError(
          "Unable to send the confirmation email.",
          502,
          "confirmation_email_failed",
        );
      log.info("confirmation.email_sent");
    } catch (failure) {
      log.error("provisioning.failed", serializeError(failure));
      // Avoid leaving an unconfirmed, half-provisioned account that blocks retries.
      // Only the ID created by THIS request is eligible for compensation.
      log.info("user.rollback_started", { targetId: user.id });
      try {
        const { error: rollbackError } = await admin.auth.admin.deleteUser(
          user.id,
          false,
        );
        if (rollbackError)
          throw providerError(
            rollbackError,
            "Account cleanup failed.",
            "account_cleanup_failed",
          );
      } catch (rollbackError) {
        log.error("user.rollback_failed", serializeError(rollbackError));
        throw new AppError(
          "Account setup failed and cleanup could not be completed. An administrator must review the account before retrying.",
          500,
          "account_cleanup_failed",
        );
      }
      log.info("user.rollback_completed");
      throw failure;
    }
    return {
      user: {
        id: user.id,
        email: user.email ?? email,
        user_metadata: user.user_metadata,
        app_metadata: user.app_metadata,
      },
    };
  },
};
