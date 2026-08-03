import Link from "next/link";
import { LegalDocShell, LegalSection } from "@/components/LegalDocShell";

export const metadata = {
  title: "Privacy Policy — Make it RAIN",
  description:
    "Privacy Policy for Make it RAIN, operated by Reliable AI Network, LLC.",
};

export default function PrivacyPage() {
  return (
    <LegalDocShell title="Privacy Policy" updated="July 31, 2026">
      <p className="rounded-2xl border border-night-600 bg-night-700/60 p-5 text-slate-200">
        This Privacy Policy explains how{" "}
        <strong className="text-white">Reliable AI Network, LLC</strong>{" "}
        (&quot;Make it RAIN,&quot; &quot;we,&quot; &quot;us&quot;) collects, uses,
        and shares information when you use makeitrainapp.com and related
        services (the &quot;Service&quot;). By using the Service, you agree to
        this Policy.
      </p>

      <LegalSection id="collect" n="01" title="Information we collect">
        <p>We may collect:</p>
        <ul className="list-disc space-y-1 pl-5">
          <li>
            <strong className="text-white">Account information</strong> — name,
            email address, and password (passwords are handled by our auth
            provider).
          </li>
          <li>
            <strong className="text-white">Billing information</strong> —
            processed by Stripe. We do not store full card numbers on our
            servers. We may store Stripe customer IDs, plan, and subscription
            status.
          </li>
          <li>
            <strong className="text-white">Product and usage content</strong> —
            information you enter about your products, generated plans and
            assets, progress logs, and similar Service data.
          </li>
          <li>
            <strong className="text-white">Communications</strong> — emails you
            send us, and emails you provide for the Product Monetization Checkup
            or other optional capture forms.
          </li>
          <li>
            <strong className="text-white">Technical data</strong> — IP address,
            browser type, device information, pages visited, and basic analytics
            events (for example, button clicks) to operate and improve the
            Service.
          </li>
          <li>
            <strong className="text-white">Local storage</strong> — a random
            session id in local storage for first-party analytics, and marketing
            attribution (UTM parameters) in session storage when you arrive from
            a campaign link. We do not use third-party advertising cookies for
            this.
          </li>
          <li>
            <strong className="text-white">Referral data</strong> — referral
            codes and attribution when someone signs up with a shared link.
          </li>
        </ul>
      </LegalSection>

      <LegalSection id="use" n="02" title="How we use information">
        <p>We use information to:</p>
        <ul className="list-disc space-y-1 pl-5">
          <li>provide, secure, and improve the Service;</li>
          <li>create and manage accounts and subscriptions;</li>
          <li>process payments and send billing-related notices;</li>
          <li>
            generate AI-assisted recommendations based on content you submit;
          </li>
          <li>operate the referral program and apply credits;</li>
          <li>
            send product or marketing emails you requested (you can unsubscribe);
          </li>
          <li>detect abuse, debug issues, and comply with law.</li>
        </ul>
      </LegalSection>

      <LegalSection id="share" n="03" title="How we share information">
        <p>
          We do not sell your personal information. We share information with
          service providers who help us run the Service, including:
        </p>
        <ul className="list-disc space-y-1 pl-5">
          <li>Supabase (authentication and database);</li>
          <li>Stripe (payments);</li>
          <li>Vercel (hosting);</li>
          <li>email delivery providers (for transactional and opted-in mail);</li>
          <li>
            AI model providers that process prompts and outputs needed to run
            tools you use;
          </li>
          <li>
            optional lead-enrichment providers when you use features that search
            for buyer contacts.
          </li>
        </ul>
        <p>
          We may also share information if required by law, to protect rights and
          safety, or in connection with a merger, acquisition, or sale of
          assets.
        </p>
      </LegalSection>

      <LegalSection id="retention" n="04" title="Retention">
        <p>
          We keep account and Service data while your account is active and for a
          reasonable period afterward for backups, disputes, and legal
          obligations. You may request deletion by contacting us; some records
          may be retained where required by law or for legitimate business
          needs (for example, billing records).
        </p>
      </LegalSection>

      <LegalSection id="security" n="05" title="Security">
        <p>
          We use reasonable technical and organizational measures to protect
          information. No method of transmission or storage is completely
          secure.
        </p>
      </LegalSection>

      <LegalSection id="rights" n="06" title="Your choices">
        <p>
          You can update account details in the Service, cancel your
          subscription from Billing, and unsubscribe from marketing emails. For
          access, correction, or deletion requests, email{" "}
          <a
            href="mailto:ai@reliableainetwork.com"
            className="font-semibold text-aqua hover:underline"
          >
            ai@reliableainetwork.com
          </a>
          .
        </p>
      </LegalSection>

      <LegalSection id="children" n="07" title="Children">
        <p>
          The Service is not directed to children under 18, and we do not
          knowingly collect personal information from them.
        </p>
      </LegalSection>

      <LegalSection id="changes" n="08" title="Changes">
        <p>
          We may update this Privacy Policy from time to time. We will post the
          updated version with a new &quot;Last updated&quot; date. Continued use
          of the Service after changes means you accept the updated Policy.
        </p>
      </LegalSection>

      <LegalSection id="contact" n="09" title="Contact">
        <p>
          Questions about privacy:{" "}
          <a
            href="mailto:ai@reliableainetwork.com"
            className="font-semibold text-aqua hover:underline"
          >
            ai@reliableainetwork.com
          </a>
        </p>
        <p>
          Reliable AI Network, LLC
          <br />
          523 E 12th St.
          <br />
          Mission, TX 78572
        </p>
        <p>
          See also our{" "}
          <Link href="/terms" className="font-semibold text-aqua hover:underline">
            Terms & Conditions
          </Link>
          .
        </p>
      </LegalSection>
    </LegalDocShell>
  );
}
