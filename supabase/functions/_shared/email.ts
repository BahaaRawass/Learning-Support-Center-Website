import type { SendEmailRequest } from "./contracts.ts";
import { AppError } from "./errors.ts";
import { emailField, httpUrl, invalid, stringField } from "./validation.ts";

export function validateEmail(body: Record<string, unknown>): SendEmailRequest {
  const to = emailField(body, "to");
  const from = emailField(body, "from", true);
  const subject = stringField(body, "subject", 200);
  if (/[\r\n]/.test(subject)) invalid("subject");
  const message = stringField(body, "message", 40_000);
  // Accept the old replyTo spelling for existing callers during rollout.
  const reply = body.replyto ?? body.replyTo;
  const replyto =
    reply === undefined || reply === ""
      ? undefined
      : emailField({ replyto: reply }, "replyto");
  const hasText = body.buttontext !== undefined;
  const hasAction = body.buttonAction !== undefined;
  if (hasText !== hasAction)
    invalid("buttontext and buttonAction (provide both)");
  const buttontext = hasText ? stringField(body, "buttontext", 100) : undefined;
  const buttonAction = hasAction
    ? httpUrl(stringField(body, "buttonAction", 4096), "buttonAction")
    : undefined;
  return { to, from, subject, message, replyto, buttontext, buttonAction };
}

export function emailConfiguration() {
  const apiKey = Deno.env.get("RESEND_API_KEY");
  const from = Deno.env.get("RESEND_FROM_EMAIL");
  if (!apiKey || !from) {
    throw new AppError(
      "Email delivery is not configured.",
      500,
      "configuration_error",
    );
  }
  // Server configuration, never a VITE_* secret. Additional approved senders
  // accommodate the website's Support address without allowing arbitrary From.
  const allowed = [
    from,
    ...(Deno.env.get("EMAIL_ALLOWED_FROM") ?? "").split(";"),
  ]
    .map((value) => value.trim())
    .filter(Boolean);
  return { apiKey, from, allowed };
}

export function escapeHtml(value: string): string {
  return value.replace(
    /[&<>"']/g,
    (char) =>
      ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;",
      })[char]!,
  );
}

// Inline styles and table layout work in email clients. These colors match
// src/index.css: purple #6e2479/#5a1d67, gold #c4973c, cream #faf8f4.
export function renderEmail(email: SendEmailRequest): {
  html: string;
  text: string;
} {
  const button =
    email.buttontext && email.buttonAction
      ? `<p style="margin:32px 0;text-align:center"><a href="${escapeHtml(email.buttonAction)}" style="display:inline-block;background:#c4973c;color:#1a1612;padding:14px 28px;border-radius:8px;text-decoration:none;font-weight:600">${escapeHtml(email.buttontext)}</a></p>
       <p style="font-size:12px;color:#8a8178;overflow-wrap:anywhere;word-break:break-all">If the button does not work, open this link:<br><a href="${escapeHtml(email.buttonAction)}" style="color:#6e2479">${escapeHtml(email.buttonAction)}</a></p>`
      : "";
  return {
    html: `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${escapeHtml(email.subject)}</title></head>
<body style="margin:0;padding:24px 12px;background:#faf8f4;font-family:Inter,-apple-system,BlinkMacSystemFont,'Segoe UI',Arial,sans-serif;color:#1a1612">
<table role="presentation" width="100%" cellspacing="0" cellpadding="0"><tr><td align="center">
<table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:600px;background:#ffffff;border:1px solid #f0ede8;border-radius:12px;overflow:hidden">
<tr><td style="padding:32px 28px;background:#5a1d67;border-bottom:4px solid #c4973c;color:#ffffff">
<p style="margin:0 0 10px;font-size:12px;letter-spacing:2px;color:#e8c47a">RAFIK HARIRI UNIVERSITY</p>
<p style="margin:0;font-size:24px;font-weight:700">Learning Support Center</p></td></tr>
<tr><td style="padding:32px 28px"><h1 style="margin:0 0 24px;font-size:21px;color:#6e2479">${escapeHtml(email.subject)}</h1>
<div style="font-size:15px;line-height:1.7;color:#4a4238;overflow-wrap:anywhere">${escapeHtml(email.message).replace(/\r?\n/g, "<br>")}</div>${button}</td></tr>
<tr><td style="padding:24px 28px;background:#faf8f4;border-top:1px solid #f0ede8;font-size:12px;line-height:1.6;color:#8a8178">RHU Learning Support Center<br>Supporting learning. Building confidence.</td></tr>
</table></td></tr></table></body></html>`,
    text: [
      "RHU Learning Support Center",
      "",
      email.subject,
      "",
      email.message,
      ...(email.buttontext && email.buttonAction
        ? ["", `${email.buttontext}: ${email.buttonAction}`]
        : []),
    ].join("\n"),
  };
}
