import type { FunctionDefinition } from "../_shared/handler.ts";
import { AppError, providerError } from "../_shared/errors.ts";
import {
  emailConfiguration,
  renderEmail,
  validateEmail,
} from "../_shared/email.ts";

export const definition: FunctionDefinition = {
  name: "sendEmail",
  roles: ["admin", "workstudy"],
  allowAnonymous: true,
  async execute(body, { log }) {
    log.info("input.validation.started");
    const email = validateEmail(body);
    log.info("input.validation.completed");

    const config = emailConfiguration();
    if (!config.allowed.includes(email.from)) {
      throw new AppError(
        "This sender address is not authorized.",
        403,
        "sender_not_allowed",
      );
    }
    log.info("email.rendering");
    const content = renderEmail(email);
    log.info("email.sending");
    let response: Response;
    try {
      response = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${config.apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: email.from,
          to: [email.to],
          subject: email.subject,
          ...content,
          ...(email.replyto ? { reply_to: email.replyto } : {}),
        }),
        signal: AbortSignal.timeout(15_000),
      });
    } catch {
      throw new AppError(
        "Email delivery could not be confirmed. Check delivery logs before retrying.",
        502,
        "email_delivery_unknown",
      );
    }
    log.info("email.provider_responded", { status: response.status });
    const result = await response.json().catch(() => null);
    if (!response.ok) {
      throw providerError(
        { ...result, status: response.status },
        "The email provider rejected the message.",
        "email_send_failed",
      );
    }
    if (!result || typeof result.id !== "string" || !result.id) {
      throw new AppError(
        "Email delivery could not be confirmed. Check delivery logs before retrying.",
        502,
        "email_delivery_unknown",
      );
    }
    log.info("email.sent");
    return { id: result.id };
  },
};
