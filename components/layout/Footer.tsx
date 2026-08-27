import Link from 'next/link';
import { Twitter, Instagram, Youtube, MessageCircle } from 'lucide-react';
import { Container } from '@/components/ui/Container';

const FOOTER_COLUMNS = [
  {
    title: 'Predictions',
    links: [
      { label: "Today's predictions", href: '/predictions/today' },
      { label: 'Correct score', href: '/predictions/correct-score' },
      { label: 'BTTS', href: '/predictions/btts' },
      { label: 'Over/Under', href: '/predictions/over-under' },
      { label: 'Double chance', href: '/predictions/double-chance' },
      { label: 'VIP predictions', href: '/predictions/vip' },
    ],
  },
  {
    title: 'Explore',
    links: [
      { label: 'Leagues', href: '/leagues' },
      { label: 'Teams', href: '/teams' },
      { label: 'Live matches', href: '/live' },
      { label: 'Statistics', href: '/statistics' },
    ],
  },
  {
    title: 'Company',
    links: [
      { label: 'About', href: '/about' },
      { label: 'Pricing', href: '/pricing' },
      { label: 'FAQ', href: '/faq' },
      { label: 'Contact', href: '/contact' },
    ],
  },
  {
    title: 'Legal',
    links: [
      { label: 'Privacy policy', href: '/privacy' },
      { label: 'Terms of service', href: '/terms' },
      { label: 'Cookie policy', href: '/cookies' },
    ],
  },
];

const SOCIAL_LINKS = [
  { icon: Twitter, href: 'https://twitter.com', label: 'Twitter' },
  { icon: Instagram, href: 'https://instagram.com', label: 'Instagram' },
  { icon: Youtube, href: 'https://youtube.com', label: 'YouTube' },
  { icon: MessageCircle, href: 'https://wa.me', label: 'WhatsApp' },
];

export function Footer({ siteName = 'GreenLord' }: { siteName?: string }) {
  return (
    <footer className="border-t border-border bg-surface">
      <Container className="py-14">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
          {FOOTER_COLUMNS.map((col) => (
            <div key={col.title}>
              <h3 className="mb-4 text-xs font-semibold uppercase tracking-wider text-muted">
                {col.title}
              </h3>
              <ul className="flex flex-col gap-2.5">
                {col.links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm text-foreground/80 transition-colors hover:text-primary"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-border pt-8 sm:flex-row">
          <div className="flex items-center gap-2">
              <span className="font-display text-lg font-bold text-foreground">{siteName}</span>
            <span className="text-xs text-muted">
              &copy; {new Date().getFullYear()} All rights reserved.
            </span>
          </div>

          <div className="flex items-center gap-4">
            {SOCIAL_LINKS.map((social) => (
              <a
                key={social.label}
                href={social.href}
                aria-label={social.label}
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted transition-colors hover:text-primary"
              >
                <social.icon className="h-5 w-5" />
              </a>
            ))}
          </div>
        </div>

        <p className="mt-6 text-center text-xs leading-relaxed text-muted sm:text-left">
          Picks are entered by administrators and provided for informational and entertainment purposes
          only. They are not betting advice. Please gamble responsibly.
        </p>
      </Container>
    </footer>
  );
}
