import {
  COMPANY_MAILING_ADDRESS,
  SUPPORT_EMAIL,
  unsubscribeUrl,
} from "@/lib/unsubscribe";
import { escapeHtml } from "@/lib/email";
import {
  INTEL_INVITE_TOKEN,
  INTEL_PRO_REVIEW_HREF,
  INTEL_SAMPLE_BRIEF_HREF,
  INTEL_SITE,
  intelIntro,
  intelSurveyUrl,
  type IntelPerson,
} from "@/lib/intel-cohort";

export type BuiltIntelEmail = {
  to: string;
  replyTo: string;
  subject: string;
  text: string;
  html: string;
  listUnsubscribeUrl: string;
};

function opening(person: IntelPerson): { subject: string; lead: string } {
  if (person.kind === "new_signup") {
    return {
      subject: `${person.firstName}, did the confirmation email stop you?`,
      lead: `Hi ${person.firstName}, I saw you created a Make it RAIN account and never made it in. If the confirmation link never arrived or already expired, that is on me. You can send it again from sign-in now.`,
    };
  }
  if (person.kind === "reviewer") {
    return {
      subject: `${person.firstName}, two minutes of honest judgment`,
      lead: `Hi ${person.firstName}, you already have reviewer access. I am not asking you to start over. I am asking what you actually used, skipped, or did not trust, so the next founder does not hit the same wall.`,
    };
  }
  return {
    subject: `${person.firstName}, you signed up. I never saw a First Customer Path.`,
    lead: `Hi ${person.firstName}, you created a Make it RAIN account and never ran it on your product. I would rather hear why than guess. Looking around is a fair answer. Getting stuck is the one I can fix.`,
  };
}

function ctaButton(label: string, href: string): string {
  return `<a href="${href}" style="display:inline-block;background:linear-gradient(90deg,#00a8c4,#00e5ff);color:#070a12;text-decoration:none;padding:14px 22px;border-radius:999px;font-weight:800;font-size:15px;letter-spacing:0.01em">${escapeHtml(label)}</a>`;
}

function sampleCard(
  kicker: string,
  title: string,
  blurb: string,
  href: string,
  accent: string
): string {
  return `<td style="width:50%;padding:6px;vertical-align:top">
    <a href="${href}" style="display:block;border:1px solid ${accent};background:#121a2b;border-radius:16px;padding:16px 16px 18px;text-decoration:none">
      <p style="margin:0 0 6px;font-size:10px;font-weight:800;letter-spacing:0.16em;text-transform:uppercase;color:${accent}">${escapeHtml(kicker)}</p>
      <p style="margin:0 0 6px;font-size:16px;font-weight:800;color:#ffffff">${escapeHtml(title)}</p>
      <p style="margin:0;font-size:13px;line-height:1.45;color:#94a3b8">${escapeHtml(blurb)}</p>
    </a>
  </td>`;
}

export function buildIntelOutreachEmail(person: IntelPerson): BuiltIntelEmail {
  const { subject, lead } = opening(person);
  const surveyHref = intelSurveyUrl(person.token);
  const unsubHref = unsubscribeUrl(person.email, INTEL_SITE);
  const intro = intelIntro(person);
  const logo = `${INTEL_SITE}/brand/logo.png`;
  const loginHref = `${INTEL_SITE}/login`;

  const text = [
    lead,
    "",
    intro,
    "",
    "What changed so you do not get stuck the same way:",
    "- Confirmation email: if the link expired, sign in and send it again.",
    "- After the survey, 60 days of Pro applies with no card. If it does not apply automatically, paste the code you will see on Billing or Onboarding.",
    "- Homepage now shows a live Standard Founder Brief next to a redacted Pro Review sample.",
    "- First Customer Path still does the job: who may pay, a price to test, Buyer Stress Test, and the next conversation worth your hour. Starter tools work without a card. Evidence grades stay on the brief so assumptions stay labeled as assumptions.",
    "",
    `Standard Founder Brief (pet health SaaS, names redacted): ${INTEL_SAMPLE_BRIEF_HREF}`,
    `Pro Review sample (redacted PDF): ${INTEL_PRO_REVIEW_HREF}`,
    "",
    `Two minutes, then 60 days of Pro: ${surveyHref}`,
    "",
    "Reply to this email if anything still blocks you. I read these.",
    "",
    "You built something real. Now it's time to get paid. Make it RAIN.",
    "",
    "Oliver",
    "Make it RAIN",
    SUPPORT_EMAIL,
    COMPANY_MAILING_ADDRESS,
    `Unsubscribe: ${unsubHref}`,
  ].join("\n");

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>${escapeHtml(subject)}</title>
</head>
<body style="margin:0;padding:0;background:#070a12;color:#e2e8f0">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#070a12">
    <tr>
      <td align="center" style="padding:28px 16px 40px">
        <table role="presentation" width="600" cellspacing="0" cellpadding="0" style="max-width:600px;width:100%">
          <tr>
            <td style="padding:8px 8px 20px">
              <img src="${logo}" alt="Make it RAIN" width="168" height="56" style="display:block;border:0;height:40px;width:auto" />
            </td>
          </tr>
          <tr>
            <td style="background:#0c1220;border:1px solid #243049;border-radius:24px;padding:32px 28px 28px">
              <p style="margin:0 0 8px;font-size:11px;font-weight:800;letter-spacing:0.18em;text-transform:uppercase;color:#00e5ff">Private note from Oliver</p>
              <h1 style="margin:0 0 16px;font-family:Georgia,Times,serif;font-size:28px;line-height:1.25;color:#ffffff;font-weight:700">I want the honest version.</h1>
              <p style="margin:0 0 14px;font-size:16px;line-height:1.6;color:#cbd5e1">${escapeHtml(lead)}</p>
              <p style="margin:0 0 22px;font-size:15px;line-height:1.6;color:#94a3b8">${escapeHtml(intro)}</p>
              <p style="margin:0 0 28px">${ctaButton("Two minutes, then 60 days of Pro", surveyHref)}</p>
              <p style="margin:0 0 8px;font-size:11px;font-weight:800;letter-spacing:0.16em;text-transform:uppercase;color:#ff4de8">See the work first</p>
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                <tr>
                  ${sampleCard(
                    "First Customer Path · Free",
                    "Standard Founder Brief",
                    "Pet health / records SaaS. Who may pay, Buyer Stress Test, names redacted.",
                    INTEL_SAMPLE_BRIEF_HREF,
                    "#00e5ff"
                  )}
                  ${sampleCard(
                    "Available with Pro",
                    "Pro Review sample",
                    "Redacted PDF. Deeper buyer, evidence, risk, and validation analysis.",
                    INTEL_PRO_REVIEW_HREF,
                    "#ff4de8"
                  )}
                </tr>
              </table>
              <div style="height:22px"></div>
              <p style="margin:0 0 10px;font-size:11px;font-weight:800;letter-spacing:0.16em;text-transform:uppercase;color:#b388ff">What I fixed so you do not get stuck again</p>
              <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#121a2b;border:1px solid #243049;border-radius:16px">
                <tr>
                  <td style="padding:16px 18px;font-size:14px;line-height:1.55;color:#cbd5e1">
                    <p style="margin:0 0 10px"><strong style="color:#ffffff">Confirmation email.</strong> If the link expired or never arrived, sign in and send it again.</p>
                    <p style="margin:0 0 10px"><strong style="color:#ffffff">No-card Pro after the survey.</strong> The code appears when you finish. Continue, and it should apply. If it does not, paste it on Billing or Onboarding.</p>
                    <p style="margin:0 0 10px"><strong style="color:#ffffff">Real samples on the homepage.</strong> A live Standard Founder Brief next to a redacted Pro Review, so you can judge the work before you spend another hour.</p>
                    <p style="margin:0"><strong style="color:#ffffff">First Customer Path is still the product.</strong> Who may pay, a price to test, Buyer Stress Test, next conversation. Starter tools work without a card. Evidence grades stay on the brief.</p>
                  </td>
                </tr>
              </table>
              <p style="margin:22px 0 0;font-size:14px;line-height:1.6;color:#94a3b8">
                Reply if anything still blocks you. I read these.
                ${person.kind === "new_signup" ? ` You can also <a href="${loginHref}" style="color:#00e5ff">sign in</a> after the survey and resend confirmation.` : ""}
              </p>
              <p style="margin:18px 0 0;font-size:13px;line-height:1.5;color:#64748b">
                You built something real. Now it's time to get paid. Make it RAIN.
              </p>
              <p style="margin:8px 0 0;font-size:13px;color:#94a3b8">Oliver</p>
            </td>
          </tr>
          <tr>
            <td style="padding:20px 8px 0;font-size:12px;line-height:1.6;color:#64748b">
              Reliable AI Network, LLC × Innovative Marketing Solutions<br/>
              ${escapeHtml(COMPANY_MAILING_ADDRESS)}<br/>
              <a href="${INTEL_SITE}" style="color:#00a8c4">makeitrainapp.com</a>
              · <a href="mailto:${SUPPORT_EMAIL}" style="color:#00a8c4">${escapeHtml(SUPPORT_EMAIL)}</a>
              · <a href="${unsubHref}" style="color:#00a8c4">Unsubscribe</a>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

  return {
    to: person.email,
    replyTo: SUPPORT_EMAIL,
    subject,
    text,
    html,
    listUnsubscribeUrl: unsubHref,
  };
}

export function buildIntelCodeEmail(person: IntelPerson, code: string): BuiltIntelEmail {
  const unsubHref = unsubscribeUrl(person.email, INTEL_SITE);
  const loginHref = `${INTEL_SITE}/login?next=${encodeURIComponent("/onboarding")}&invite=${encodeURIComponent(INTEL_INVITE_TOKEN)}`;
  const subject = `${person.firstName}, your 60 days of Pro is ready`;
  const text = [
    `Hi ${person.firstName},`,
    "",
    "Thank you for the honest answers.",
    "",
    `Your access code is ${code}. No card. Sign in, continue to onboarding, and it should apply. If it does not, open Billing or Onboarding and paste the code.`,
    "",
    `Continue: ${loginHref}`,
    "",
    "If sign-in says to confirm your email, send the link again from that screen.",
    "",
    "Oliver",
    SUPPORT_EMAIL,
    COMPANY_MAILING_ADDRESS,
    `Unsubscribe: ${unsubHref}`,
  ].join("\n");
  const html = `<!DOCTYPE html>
<html lang="en">
<body style="margin:0;padding:24px;background:#070a12;color:#e2e8f0;font-family:system-ui,sans-serif">
  <p style="margin:0 0 12px">Hi ${escapeHtml(person.firstName)},</p>
  <p style="margin:0 0 16px">Thank you for the honest answers.</p>
  <p style="margin:0 0 8px">Your access code is</p>
  <p style="margin:0 0 16px;font-size:22px;font-weight:800;letter-spacing:0.08em;color:#00e5ff">${escapeHtml(code)}</p>
  <p style="margin:0 0 16px">No card. Sign in, continue to onboarding, and it should apply. If it does not, paste the code on Billing or Onboarding.</p>
  <p style="margin:0 0 16px"><a href="${loginHref}" style="display:inline-block;background:#00e5ff;color:#070a12;text-decoration:none;padding:12px 18px;border-radius:999px;font-weight:800">Sign in and continue</a></p>
  <p style="margin:0 0 16px;color:#94a3b8;font-size:14px">If sign-in says to confirm your email, send the link again from that screen.</p>
  <p style="margin:0;color:#94a3b8">Oliver</p>
  <p style="margin:24px 0 0;font-size:12px;color:#64748b">
    ${escapeHtml(COMPANY_MAILING_ADDRESS)} · <a href="${unsubHref}" style="color:#00a8c4">Unsubscribe</a>
  </p>
</body>
</html>`;

  return {
    to: person.email,
    replyTo: SUPPORT_EMAIL,
    subject,
    text,
    html,
    listUnsubscribeUrl: unsubHref,
  };
}
