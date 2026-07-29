import type { Metadata } from 'next';
import { LegalPage } from '@/components/legal/LegalPage';

// NOTE FOR THE TEAM: this is standard template language covering the data
// this platform actually collects (accounts, payments via third-party
// processors, cookies, contact form). Have a lawyer review before launch,
// particularly the sections on payment data handling and any
// jurisdiction-specific requirements (e.g. NDPR in Nigeria, GDPR if you
// serve EU users).
export const metadata: Metadata = {
  title: 'Privacy Policy',
  description: 'How Football AI collects, uses, and protects your data.',
};

export default function PrivacyPolicyPage() {
  return (
    <LegalPage title="Privacy Policy" lastUpdated="27 July 2026">
      <p>
        This Privacy Policy explains what information Football AI (&quot;we&quot;, &quot;us&quot;)
        collects when you use our website and services, and how we use it.
      </p>

      <h2>Information we collect</h2>
      <p>When you create an account or use the site, we may collect:</p>
      <ul>
        <li>Account information: name, email address, and password (stored as a salted hash — we never see or store your plain-text password).</li>
        <li>Usage data: predictions you save, teams and leagues you favorite, and general activity on the site.</li>
        <li>Payment data: when you subscribe to VIP, payment is processed directly by Paystack, Flutterwave, or Stripe. We store the subscription status, plan, and amount — never your card details.</li>
        <li>Contact form submissions: name, email, and message content if you contact us.</li>
        <li>Technical data: IP address, browser type, and device information, collected automatically for security and analytics purposes.</li>
      </ul>

      <h2>How we use your information</h2>
      <ul>
        <li>To provide and maintain your account and VIP subscription.</li>
        <li>To send transactional emails (verification, password reset, payment receipts).</li>
        <li>To send you predictions if you subscribe to our newsletter — you can unsubscribe at any time.</li>
        <li>To detect and prevent fraud, abuse, and security incidents.</li>
        <li>To improve the site based on aggregate, anonymized usage patterns.</li>
      </ul>

      <h2>Cookies</h2>
      <p>
        We use a small number of cookies essential to the site&apos;s operation, including an
        httpOnly authentication cookie that keeps you logged in securely. See our{' '}
        <a href="/cookies" className="text-primary hover:underline">Cookie Policy</a> for details.
      </p>

      <h2>Sharing your information</h2>
      <p>
        We do not sell your personal data. We share information only with the service providers
        necessary to run the platform: our payment processors (Paystack, Flutterwave, Stripe), our
        email delivery provider, and our cloud hosting and database providers — each bound by their
        own data protection obligations.
      </p>

      <h2>Your rights</h2>
      <p>
        You can access, update, or delete your account information at any time from your dashboard
        settings. To request a full export or deletion of your data, contact us using the details on
        our <a href="/contact" className="text-primary hover:underline">Contact page</a>.
      </p>

      <h2>Data retention</h2>
      <p>
        We retain your account data for as long as your account is active. If you delete your
        account, we remove your personal information within 30 days, except where we&apos;re
        required to retain records for legal or accounting purposes (e.g. payment records).
      </p>

      <h2>Changes to this policy</h2>
      <p>
        We may update this policy from time to time. We&apos;ll update the &quot;Last updated&quot;
        date above whenever we do.
      </p>
    </LegalPage>
  );
}
