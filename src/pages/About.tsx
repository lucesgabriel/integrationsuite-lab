import { Link } from "react-router-dom";
import { profile } from "../data/profile";
import Seo from "../components/Seo";
import { useReveal } from "../hooks/useReveal";
import { useLang } from "../i18n";

export default function About() {
  const expRef = useReveal<HTMLDivElement>();
  const certRef = useReveal<HTMLDivElement>();
  const contactRef = useReveal<HTMLDivElement>();
  const { t, lang } = useLang();

  return (
    <section className="mx-auto max-w-4xl px-4 py-12 md:py-16">
      <Seo
        title={t.seo.aboutTitle}
        description={t.seo.aboutDesc}
        path="/sobre-mi/"
      />
      {/* Header con foto */}
      <div className="relative overflow-hidden rounded-3xl border border-line bg-gradient-to-br from-raised to-card p-8 md:p-10">
        <div
          className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full blur-3xl"
          style={{ background: "var(--orb)" }}
        />
        <div className="relative flex flex-col items-start gap-6 md:flex-row md:items-center">
          <img
            src={profile.photo}
            alt={`${t.about.photoAlt} ${profile.name}`}
            className="glow-strong h-28 w-28 shrink-0 rounded-full border-2 border-sap-blue/50 object-cover object-top"
          />
          <div>
            <h1 className="text-3xl font-extrabold text-strong md:text-4xl">
              {profile.name}
            </h1>
            <p className="mt-2 text-accent-text">{profile.headline}</p>
            <p className="mt-1 flex items-center gap-1.5 text-sm text-faint">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 21s-7-5.5-7-11a7 7 0 0 1 14 0c0 5.5-7 11-7 11z" />
                <circle cx="12" cy="10" r="2.5" />
              </svg>
              {profile.location}
            </p>
          </div>
        </div>
      </div>

      <div className="mt-10 space-y-4 leading-relaxed text-body">
        {profile.about[lang].map((paragraph) => (
          <p key={paragraph.slice(0, 30)}>{paragraph}</p>
        ))}
      </div>

      {/* Skills */}
      <h2 className="mt-14 text-2xl font-bold text-strong">{t.about.skills}</h2>
      <div className="mt-5 flex flex-wrap gap-2">
        {profile.skills.map((skill) => (
          <span
            key={skill}
            className="rounded-full border border-line bg-card px-4 py-1.5 text-sm text-body transition-colors hover:border-sap-blue/60 hover:text-strong"
          >
            {skill}
          </span>
        ))}
      </div>

      {/* Experiencia */}
      <h2 className="mt-14 text-2xl font-bold text-strong">
        {t.about.experience}
      </h2>
      <div ref={expRef} className="reveal mt-6 space-y-0 border-l-2 border-line">
        {profile.experience.map((job) => (
          <div key={`${job.company}-${job.period.es}`} className="relative pb-8 pl-8">
            <span className="absolute -left-[9px] top-2 h-4 w-4 rounded-full border-2 border-base bg-sap-blue shadow-[0_0_12px_var(--glow-strong)]" />
            <div className="hover-glow rounded-2xl border border-line bg-card/60 p-5 hover:border-sap-blue/50">
              <p className="text-sm text-faint">{job.period[lang]}</p>
              <h3 className="mt-1 font-bold text-strong">{job.role}</h3>
              <p className="text-sm text-accent-text">
                {job.company} · {job.location[lang]}
              </p>
              <p className="mt-2 text-sm text-muted">{job.summary[lang]}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Certificaciones */}
      <h2 className="mt-6 text-2xl font-bold text-strong">
        {t.about.certifications}
      </h2>
      <div ref={certRef} className="reveal mt-6 grid gap-4 sm:grid-cols-2">
        {profile.certifications.map((cert) => (
          <div
            key={cert.name}
            className="hover-glow flex items-start gap-4 rounded-2xl border border-line bg-card p-5 transition-all hover:-translate-y-0.5 hover:border-sap-blue/60"
          >
            <span className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-sap-blue/30 bg-gradient-to-br from-sap-blue/25 to-sap-blue/5">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--c-accent-text)" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="9" r="6" />
                <path d="M9 14.5L7.5 21l4.5-2.5L16.5 21 15 14.5M10 9l1.5 1.5L14.5 7" />
              </svg>
            </span>
            <div>
              <p className="font-semibold text-strong">{cert.name}</p>
              <p className="mt-1 text-sm text-muted">
                {cert.issuer} · {cert.year}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Educación e idiomas */}
      <div className="mt-14 grid gap-10 md:grid-cols-2">
        <div>
          <h2 className="text-2xl font-bold text-strong">
            {t.about.education}
          </h2>
          <ul className="mt-5 space-y-4">
            {profile.education.map((edu) => (
              <li key={edu.school}>
                <p className="font-semibold text-strong">{edu.school}</p>
                <p className="text-sm text-muted">{edu.degree[lang]}</p>
                <p className="text-sm text-faint">{edu.period}</p>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h2 className="text-2xl font-bold text-strong">
            {t.about.languages}
          </h2>
          <ul className="mt-5 space-y-3">
            {profile.languages.map((language) => (
              <li
                key={language.name.es}
                className="flex justify-between border-b border-line pb-2"
              >
                <span className="text-body">{language.name[lang]}</span>
                <span className="text-sm text-faint">
                  {language.level[lang]}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Contacto */}
      <div ref={contactRef} className="reveal relative mt-16 overflow-hidden rounded-3xl border border-line bg-card p-8 text-center">
        <div
          className="pointer-events-none absolute -bottom-20 -right-16 h-48 w-48 rounded-full blur-3xl"
          style={{ background: "var(--orb)" }}
        />
        <div className="relative">
          <h2 className="text-2xl font-bold text-strong">
            {t.about.contactHeading}
          </h2>
          <p className="mt-2 text-muted">{t.about.contactText}</p>
          <div className="mt-6 flex flex-wrap justify-center gap-4">
            <Link
              to="/contacto"
              className="glow rounded-xl bg-sap-blue px-6 py-3 font-semibold text-white transition-all hover:bg-sap-blue-light"
            >
              {t.about.sendMessage}
            </Link>
            <a
              href={profile.linkedin}
              target="_blank"
              rel="noreferrer"
              className="rounded-xl border border-line px-6 py-3 font-semibold text-body transition-colors hover:border-sap-blue hover:text-strong"
            >
              LinkedIn
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
