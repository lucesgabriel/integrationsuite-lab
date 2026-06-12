import { profile } from "../data/profile";
import ContactForm from "../components/ContactForm";
import Seo from "../components/Seo";
import { useLang } from "../i18n";

export default function Contact() {
  const { t } = useLang();

  return (
    <section className="mx-auto max-w-5xl px-4 py-12 md:py-16">
      <Seo
        title={t.seo.contactTitle}
        description={t.contact.description}
        path="/contacto/"
      />
      <span className="eyebrow">~/contacto</span>
      <h1 className="text-4xl font-extrabold text-strong">{t.contact.title}</h1>
      <p className="mt-3 max-w-2xl text-muted">{t.contact.description}</p>

      <div className="mt-10 grid gap-8 md:grid-cols-[3fr_2fr]">
        <ContactForm />

        <div className="flex flex-col gap-4">
          <a
            href={profile.linkedin}
            target="_blank"
            rel="noreferrer"
            className="hover-glow flex items-start gap-4 rounded-2xl border border-line bg-card p-5 transition-all hover:-translate-y-0.5 hover:border-sap-blue/60"
          >
            <span className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-sap-blue/30 bg-gradient-to-br from-sap-blue/25 to-sap-blue/5">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="var(--c-accent-text)">
                <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.32 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.79M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z" />
              </svg>
            </span>
            <div>
              <p className="font-semibold text-strong">LinkedIn</p>
              <p className="mt-1 text-sm text-muted">{t.contact.linkedinNote}</p>
            </div>
          </a>

          <a
            href={`mailto:${profile.email}`}
            className="hover-glow flex items-start gap-4 rounded-2xl border border-line bg-card p-5 transition-all hover:-translate-y-0.5 hover:border-sap-blue/60"
          >
            <span className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-sap-blue/30 bg-gradient-to-br from-sap-blue/25 to-sap-blue/5">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--c-accent-text)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="4" width="20" height="16" rx="2" />
                <path d="m2 7 10 7L22 7" />
              </svg>
            </span>
            <div>
              <p className="font-semibold text-strong">{t.contact.emailLabel}</p>
              <p className="mt-1 text-sm text-muted">{profile.email}</p>
            </div>
          </a>

          <div className="flex items-start gap-4 rounded-2xl border border-line bg-card p-5">
            <span className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-sap-blue/30 bg-gradient-to-br from-sap-blue/25 to-sap-blue/5">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--c-accent-text)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 21s-7-5.5-7-11a7 7 0 0 1 14 0c0 5.5-7 11-7 11z" />
                <circle cx="12" cy="10" r="2.5" />
              </svg>
            </span>
            <div>
              <p className="font-semibold text-strong">
                {t.contact.locationLabel}
              </p>
              <p className="mt-1 text-sm text-muted">
                {profile.location} · {t.contact.locationNote}
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
