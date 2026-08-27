import { sendEmail, type SendEmailInput } from "@/lib/email";

export const SELECT_CONTACT_EMAIL = "oliver@rainselect.com";

export const SELECT_FROM_DEFAULT = `Oliver at RAIN Select <${SELECT_CONTACT_EMAIL}>`;

function selectFrom(): string {
  return process.env.RAIN_SELECT_FROM_EMAIL?.trim() || SELECT_FROM_DEFAULT;
}

/** Prospect-facing RAIN Select mail. Do not use for Make it RAIN. */
export function sendSelectEmail(
  input: Omit<SendEmailInput, "from" | "replyTo"> & { replyTo?: string }
) {
  return sendEmail({
    ...input,
    from: selectFrom(),
    replyTo: input.replyTo || SELECT_CONTACT_EMAIL,
  });
}
