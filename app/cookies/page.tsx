import type { Metadata } from 'next';
import { LegalPage } from '@/components/legal/LegalPage';

export const metadata: Metadata = {
  title: 'Cookie Policy',
  description: 'How Football AI uses cookies.',
};

export default function CookiePolicyPage() {
  return (
    <LegalPage title="Cookie Policy" lastUpdated="27 July 2026">
      <p>
        This Cookie Policy explains what cookies Football AI uses and why. We keep cookie use
        minimal and functional — we don&apos;t use cookies for third-party advertising.
      </p>

      <h2>What cookies we use</h2>
      <ul>
        <li>
          <strong>Authentication (essential):</strong> an httpOnly, secure cookie that keeps you
          logged in. This cookie can&apos;t be read by JavaScript, which protects it from
          cross-site scripting attacks. Without it, you&apos;d need to log in on every page.
        </li>
        <li>
          <strong>Session preferences (essential):</strong> lightweight cookies that remember
          things like whether you&apos;ve dismissed the cookie notice.
        </li>
      </ul>
      <p>
        We do not currently use third-party advertising or cross-site tracking cookies. If that
        changes, we&apos;ll update this policy and, where required, ask for your consent first.
      </p>

      <h2>Managing cookies</h2>
      <p>
        Most browsers let you block or delete cookies through their settings. Blocking the
        essential authentication cookie will prevent you from staying logged in.
      </p>

      <h2>Changes to this policy</h2>
      <p>We&apos;ll update the &quot;Last updated&quot; date above whenever this policy changes.</p>
    </LegalPage>
  );
}
