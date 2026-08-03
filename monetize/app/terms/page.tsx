import Link from "next/link";
import { LegalDocShell, LegalSection } from "@/components/LegalDocShell";

export const metadata = {
  title: "Terms & Conditions — Make it RAIN",
  description:
    "Terms & Conditions for Make it RAIN, operated by Reliable AI Network, LLC.",
};

export default function TermsPage() {
  return (
    <LegalDocShell title="Terms & Conditions" updated="July 31, 2026">
      <p className="rounded-2xl border border-night-600 bg-night-700/60 p-5 text-slate-200">
        These Terms & Conditions (&quot;Terms&quot;) govern your access to and
        use of the Make it RAIN website, application, and related services
        (collectively, the &quot;Service&quot;), operated by{" "}
        <strong className="text-white">Reliable AI Network, LLC</strong>{" "}
        (&quot;Make it RAIN,&quot; &quot;we,&quot; &quot;us,&quot; or
        &quot;our&quot;), in collaboration with Innovative Marketing Solutions.
        By creating an account, starting a trial, or otherwise using the
        Service, you agree to be bound by these Terms. If you do not agree, do
        not use the Service.
      </p>

      <LegalSection id="service" n="01" title="The Service">
        <p>
          Make it RAIN provides guided, AI-assisted commercialization tools for
          software builders, including buyer identification, positioning,
          pricing guidance, launch planning, sales and outreach content, and
          progress tracking. The Service is a decision-support tool. It does not
          run your business, guarantee revenue, or replace your own judgment.
        </p>
      </LegalSection>

      <LegalSection id="eligibility" n="02" title="Eligibility">
        <p>
          You must be at least 18 years old and capable of forming a binding
          contract to use the Service. If you use the Service on behalf of a
          company, you represent that you have authority to bind that company,
          and &quot;you&quot; refers to that company.
        </p>
      </LegalSection>

      <LegalSection id="accounts" n="03" title="Accounts">
        <p>
          You are responsible for maintaining the confidentiality of your
          account credentials and for all activity under your account. You
          agree to provide accurate registration information and to notify us
          promptly of any unauthorized use. We may suspend or terminate accounts
          that violate these Terms.
        </p>
      </LegalSection>

      <LegalSection id="billing" n="04" title="Free trial, subscriptions, and billing">
        <h3 className="text-base font-semibold text-white">Free trial</h3>
        <p>
          New subscribers receive a 30-day free trial on the plan they select.
          If you do not cancel before the trial ends, your chosen plan begins
          and the payment method on file is charged at the then-current rate.
        </p>
        <h3 className="text-base font-semibold text-white">Billing</h3>
        <p>
          Subscriptions are billed in advance on a recurring monthly basis
          (unless otherwise stated) and renew automatically until cancelled.
          Payments are processed by third-party payment processors (currently
          Stripe). By providing a payment method you authorize us and our
          processor to charge it. Your payment information is handled by the
          processor under its own terms and privacy policy.
        </p>
        <h3 className="text-base font-semibold text-white">Cancellation</h3>
        <p>
          You may cancel at any time from your billing settings (Stripe customer
          portal). Cancellation takes effect at the end of the current billing
          period; you retain access until then.
        </p>
        <h3 className="text-base font-semibold text-white">Refunds</h3>
        <p>
          Except where required by law, payments are non-refundable, including
          for partial periods or unused features.
        </p>
        <h3 className="text-base font-semibold text-white">Price changes</h3>
        <p>
          We may change subscription prices with at least 30 days&apos; notice.
          Changes apply at your next renewal. Continued use after the change
          takes effect constitutes acceptance.
        </p>
        <h3 className="text-base font-semibold text-white">Referrals</h3>
        <p>
          We may offer a referral program. When someone signs up with your
          referral link, finishes the free trial, and pays their first bill, you
          may receive account credit equal to half of what they paid that first
          month. Credits apply to your Make it RAIN subscription balance, stack
          for each qualifying referral, and are not cash. We may modify or end
          the referral program at any time. Referral abuse (including
          self-referrals or fraudulent accounts) may void credits and lead to
          account suspension.
        </p>
      </LegalSection>

      <LegalSection
        id="advice"
        n="05"
        title="No professional advice; no guaranteed results"
      >
        <p>
          The Service generates business, marketing, positioning, and pricing
          suggestions, including AI-generated content. All output is provided{" "}
          <strong className="text-white">for informational purposes only</strong>{" "}
          and does not constitute legal, financial, tax, accounting, or
          investment advice. We do not guarantee that any recommendation will
          produce customers, revenue, or any particular outcome. Business
          results depend on factors outside our control, and example journeys or
          scenarios shown in the Service or on our website are illustrative, not
          promises of performance. You are solely responsible for decisions you
          make based on the Service, and you should consult qualified
          professionals before acting on matters with legal or financial
          consequences.
        </p>
      </LegalSection>

      <LegalSection id="ai" n="06" title="AI-generated content">
        <p>
          Portions of the Service are generated by artificial intelligence. AI
          output may be inaccurate, incomplete, or unsuitable for your
          situation. You agree to review and verify all output before relying on
          it or publishing it. You are responsible for ensuring that your use of
          any output (including marketing copy and outreach messages) complies
          with applicable laws, including advertising, anti-spam, and
          consumer-protection laws.
        </p>
      </LegalSection>

      <LegalSection id="your-content" n="07" title="Your content and ownership">
        <h3 className="text-base font-semibold text-white">
          You keep your product
        </h3>
        <p>
          You retain all ownership of your product, code, business information,
          and any materials you submit to the Service (&quot;Your Content&quot;).
          Nothing in these Terms transfers ownership of Your Content to us.
        </p>
        <h3 className="text-base font-semibold text-white">License to us</h3>
        <p>
          You grant us a limited, non-exclusive, worldwide license to host,
          process, and display Your Content solely to operate, provide, secure,
          and improve the Service for you.
        </p>
        <h3 className="text-base font-semibold text-white">Output</h3>
        <p>
          As between you and us, you own the strategies, plans, and content the
          Service generates for you, subject to the rights of any third parties
          and to our underlying rights in the Service itself.
        </p>
        <h3 className="text-base font-semibold text-white">
          Your responsibility
        </h3>
        <p>
          You represent that you have the rights to submit Your Content and that
          it does not infringe any third party&apos;s rights or violate any law.
        </p>
      </LegalSection>

      <LegalSection id="ip" n="08" title="Our intellectual property">
        <p>
          The Service — including its software, tools, prompts, workflows,
          frameworks, design, text, graphics, logos, and trademarks — is owned
          by us or our licensors and is protected by intellectual-property laws.
          Except for the limited right to use the Service under these Terms, no
          rights are granted to you. You may not copy, modify, reverse engineer,
          resell, or create derivative works from the Service, or use it to
          build a competing product.
        </p>
      </LegalSection>

      <LegalSection id="use" n="09" title="Acceptable use">
        <p>You agree not to:</p>
        <ul className="list-disc space-y-1 pl-5">
          <li>
            use the Service for any unlawful, fraudulent, or deceptive purpose;
          </li>
          <li>
            generate or distribute spam, harassment, or misleading claims;
          </li>
          <li>
            upload malicious code or attempt to probe, disrupt, or gain
            unauthorized access to the Service or its infrastructure;
          </li>
          <li>scrape, harvest, or bulk-extract data from the Service;</li>
          <li>share, resell, or sublicense your account access;</li>
          <li>
            misrepresent AI-generated output as independent third-party
            endorsement or reviews; or
          </li>
          <li>
            use the Service to violate the rights of others, including
            intellectual-property and privacy rights.
          </li>
        </ul>
        <p>
          We may suspend or terminate access for violations of this section.
        </p>
      </LegalSection>

      <LegalSection id="third-party" n="10" title="Third-party services and links">
        <p>
          The Service may link to or integrate with third-party sites, tools,
          and content. We do not control and are not responsible for third-party
          services, and your use of them is governed by their own terms.
        </p>
      </LegalSection>

      <LegalSection id="privacy" n="11" title="Privacy">
        <p>
          Our collection and use of personal information is described in our{" "}
          <Link href="/privacy" className="font-semibold text-aqua hover:underline">
            Privacy Policy
          </Link>
          . By using the Service you consent to that collection and use. You may
          unsubscribe from marketing emails at any time via the unsubscribe
          mechanism provided.
        </p>
      </LegalSection>

      <LegalSection id="warranties" n="12" title="Disclaimer of warranties">
        <p className="text-sm uppercase tracking-wide text-slate-400">
          THE SERVICE IS PROVIDED &quot;AS IS&quot; AND &quot;AS
          AVAILABLE,&quot; WITHOUT WARRANTIES OF ANY KIND, WHETHER EXPRESS,
          IMPLIED, OR STATUTORY, INCLUDING WARRANTIES OF MERCHANTABILITY,
          FITNESS FOR A PARTICULAR PURPOSE, NON-INFRINGEMENT, ACCURACY, AND
          UNINTERRUPTED OR ERROR-FREE OPERATION. WE DO NOT WARRANT THAT ANY
          OUTPUT WILL BE ACCURATE, COMPLETE, OR ACHIEVE ANY RESULT.
        </p>
      </LegalSection>

      <LegalSection id="liability" n="13" title="Limitation of liability">
        <p className="text-sm uppercase tracking-wide text-slate-400">
          TO THE MAXIMUM EXTENT PERMITTED BY LAW: (A) WE WILL NOT BE LIABLE FOR
          ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, EXEMPLARY, OR
          PUNITIVE DAMAGES, OR FOR LOST PROFITS, LOST REVENUE, LOST DATA, OR
          LOSS OF GOODWILL, ARISING FROM OR RELATED TO THE SERVICE, EVEN IF
          ADVISED OF THE POSSIBILITY OF SUCH DAMAGES; AND (B) OUR TOTAL
          AGGREGATE LIABILITY FOR ALL CLAIMS ARISING FROM OR RELATED TO THE
          SERVICE WILL NOT EXCEED THE GREATER OF (i) THE AMOUNTS YOU PAID US IN
          THE TWELVE (12) MONTHS BEFORE THE EVENT GIVING RISE TO THE CLAIM OR
          (ii) ONE HUNDRED U.S. DOLLARS (US$100). SOME JURISDICTIONS DO NOT
          ALLOW CERTAIN LIMITATIONS, SO SOME OF THE ABOVE MAY NOT APPLY TO YOU.
        </p>
      </LegalSection>

      <LegalSection id="indemnity" n="14" title="Indemnification">
        <p>
          You agree to defend, indemnify, and hold harmless Reliable AI Network,
          LLC, its collaborators (including Innovative Marketing Solutions), and
          their respective officers, employees, and agents from any claims,
          damages, liabilities, and expenses (including reasonable
          attorneys&apos; fees) arising from Your Content, your use of the
          Service or its output, or your violation of these Terms or applicable
          law.
        </p>
      </LegalSection>

      <LegalSection id="termination" n="15" title="Termination">
        <p>
          You may stop using the Service and cancel your subscription at any
          time. We may suspend or terminate your access immediately if you
          materially breach these Terms, misuse the Service, or if required by
          law. Upon termination, your right to use the Service ends; Sections
          5–8 and 12–18 survive termination. Upon written request within 30 days
          of termination, we will make a reasonable export of Your Content
          available where technically feasible.
        </p>
      </LegalSection>

      <LegalSection id="changes" n="16" title="Changes to the Service or Terms">
        <p>
          We may modify or discontinue features of the Service at any time. We
          may update these Terms from time to time; if a change is material, we
          will provide reasonable notice (for example, by email or in-app
          notice) before it takes effect. Continued use of the Service after the
          effective date constitutes acceptance of the updated Terms.
        </p>
      </LegalSection>

      <LegalSection id="law" n="17" title="Governing law and disputes">
        <p>
          These Terms are governed by the laws of the State of Texas, without
          regard to conflict-of-law rules. Any dispute arising from these Terms
          or the Service will be resolved exclusively in the state or federal
          courts located in Hidalgo County, Texas, and the parties consent to
          personal jurisdiction there. To the extent permitted by law, each
          party waives any right to a jury trial and agrees that claims may be
          brought only in an individual capacity, not as a class or
          representative action.
        </p>
      </LegalSection>

      <LegalSection id="general" n="18" title="General">
        <p>
          These Terms, together with the Privacy Policy and any plan-specific
          terms, are the entire agreement between you and us regarding the
          Service. If any provision is found unenforceable, the remainder stays
          in effect. Our failure to enforce a provision is not a waiver. You may
          not assign these Terms without our consent; we may assign them in
          connection with a merger, acquisition, or sale of assets. We are not
          liable for delays or failures caused by events beyond our reasonable
          control.
        </p>
      </LegalSection>

      <LegalSection id="contact" n="19" title="Contact">
        <p>
          Questions about these Terms:{" "}
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
      </LegalSection>
    </LegalDocShell>
  );
}
