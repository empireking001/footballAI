import type { Metadata } from "next";
import { Mail, Phone, MapPin } from "lucide-react";
import { Container } from "@/components/ui/Container";
import { ContactForm } from "@/components/contact/ContactForm";
import { fetchApi } from "@/lib/api/server";
import { SiteSettings } from "@/types/api";

export const metadata: Metadata = {
  title: "Contact",
  description: "Get in touch with the Football AI team.",
};

export default async function ContactPage() {
  const { data: settings } = await fetchApi<SiteSettings>("/settings", {
    revalidate: 300,
  });

  return (
    <>
      <div className="border-b border-border bg-surface/50 py-10 sm:py-12">
        <Container>
          <span className="font-mono text-xs uppercase tracking-widest text-primary">
            Contact
          </span>
          <h1 className="mt-2 font-display text-3xl font-bold uppercase tracking-tight sm:text-4xl">
            Get in touch
          </h1>
          <p className="mt-2 max-w-xl text-sm text-muted">
            Questions about a prediction, VIP, or billing? Send us a message.
          </p>
        </Container>
      </div>

      <Container className="grid gap-10 py-10 sm:py-12 lg:grid-cols-3">
        <div className="relative lg:col-span-2">
          <ContactForm />
        </div>

        <div className="flex flex-col gap-4">
          {settings?.contact?.email && (
            <div className="flex items-start gap-3 text-sm">
              <Mail className="mt-0.5 h-4 w-4 flex-shrink-0 text-primary" />
              <span className="text-foreground/90">
                {settings.contact.email}
              </span>
            </div>
          )}
          {settings?.contact?.phone && (
            <div className="flex items-start gap-3 text-sm">
              <Phone className="mt-0.5 h-4 w-4 flex-shrink-0 text-primary" />
              <span className="text-foreground/90">
                {settings.contact.phone}
              </span>
            </div>
          )}
          {settings?.contact?.address && (
            <div className="flex items-start gap-3 text-sm">
              <MapPin className="mt-0.5 h-4 w-4 flex-shrink-0 text-primary" />
              <span className="text-foreground/90">
                {settings.contact.address}
              </span>
            </div>
          )}
          {!settings?.contact?.email &&
            !settings?.contact?.phone &&
            !settings?.contact?.address && (
              <p className="text-sm text-muted">
                Reach us using the form and we&apos;ll respond by email.
              </p>
            )}
        </div>
      </Container>
    </>
  );
}
