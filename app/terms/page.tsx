import type { Metadata } from 'next';
import { LegalPage } from '@/components/legal/LegalPage';

// NOTE FOR THE TEAM: standard template terms covering account use, the informational nature of administrator-entered picks (important for
// limiting liability around gambling-adjacent content), and subscription
// billing. Have a lawyer review before launch, especially around local
// gambling-adjacent-content regulations in the jurisdictions you operate.
export const metadata: Metadata = {
  title: 'Terms of Service',
  description: 'The terms that govern your use of Football AI.',
};

export default function TermsOfServicePage() {
  return (
    <LegalPage title="Terms of Service" lastUpdated="27 July 2026">
      <p>
        These Terms of Service (&quot;Terms&quot;) govern your access to and use of Football AI. By
        creating an account or using the site, you agree to these Terms.
      </p>

      <h2>1. Not betting advice</h2>
      <p>
        Football AI provides administrator-entered football picks and match information for informational
        and entertainment purposes only. Picks are estimates informed by available match data and are
        not guaranteed to be accurate. Nothing on this site constitutes betting, financial, or
        professional advice. You are solely responsible for any decisions you make based on content
        from this site, including any wagering decisions. Please gamble responsibly and only within
        your means; if you or someone you know has a gambling problem, seek help from a licensed
        support service in your jurisdiction.
      </p>

      <h2>2. Accounts</h2>
      <p>
        You must provide accurate information when creating an account and are responsible for
        keeping your login credentials secure. You must be at least 18 years old (or the legal
        gambling/majority age in your jurisdiction, whichever is higher) to create an account.
      </p>

      <h2>3. VIP subscriptions and billing</h2>
      <ul>
        <li>VIP subscriptions renew automatically at the end of each billing period unless cancelled.</li>
        <li>You can cancel auto-renewal at any time from your dashboard; you retain VIP access until the end of the current billing period.</li>
        <li>Payments are processed by Paystack, Flutterwave, or Stripe, depending on your selection — their terms also apply to the transaction.</li>
        <li>Refunds are considered on a case-by-case basis; contact us if you believe you were charged in error.</li>
      </ul>

      <h2>4. Acceptable use</h2>
      <p>You agree not to:</p>
      <ul>
        <li>Attempt to gain unauthorized access to any part of the platform or another user&apos;s account.</li>
        <li>Scrape, resell, or redistribute predictions or content without permission.</li>
        <li>Use the contact form, referral program, or any other feature for spam or fraud.</li>
        <li>Use the platform for any unlawful purpose.</li>
      </ul>

      <h2>5. Intellectual property</h2>
      <p>
        All predictions, analysis, design, and branding on Football AI are our property or licensed
        to us. You may not copy or redistribute this content for commercial purposes without written
        permission.
      </p>

      <h2>6. Disclaimer of warranties</h2>
      <p>
        The service is provided &quot;as is&quot; without warranties of any kind. We do not guarantee
        the accuracy, completeness, or timeliness of any prediction, statistic, or piece of content on
        the site.
      </p>

      <h2>7. Limitation of liability</h2>
      <p>
        To the fullest extent permitted by law, Football AI is not liable for any indirect,
        incidental, or consequential damages arising from your use of the site, including any losses
        related to wagering decisions made using our content.
      </p>

      <h2>8. Changes to these Terms</h2>
      <p>
        We may update these Terms from time to time. Continued use of the site after changes take
        effect constitutes acceptance of the updated Terms.
      </p>

      <h2>9. Contact</h2>
      <p>
        Questions about these Terms? Reach out via our{' '}
        <a href="/contact" className="text-primary hover:underline">Contact page</a>.
      </p>
    </LegalPage>
  );
}
