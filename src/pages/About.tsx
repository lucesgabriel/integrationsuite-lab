import { profile } from "../data/profile";

export default function About() {
  return (
    <section className="mx-auto max-w-4xl px-4 py-16">
      <h1 className="text-4xl font-extrabold text-white">{profile.name}</h1>
      <p className="mt-3 text-lg text-sap-blue-light">{profile.headline}</p>
      <p className="mt-1 text-sm text-slate-500">{profile.location}</p>

      <div className="mt-8 space-y-4 text-slate-300 leading-relaxed">
        {profile.about.map((paragraph) => (
          <p key={paragraph.slice(0, 30)}>{paragraph}</p>
        ))}
      </div>

      {/* Objetivo de certificación */}
      <div className="mt-10 rounded-2xl border border-sap-blue/40 bg-sap-blue/10 p-6">
        <p className="text-sm font-semibold uppercase tracking-wider text-sap-blue-light">
          🎯 Próximo objetivo
        </p>
        <p className="mt-2 text-lg font-bold text-white">
          {profile.certificationGoal.name}
        </p>
        <p className="mt-1 text-sm text-slate-400">
          {profile.certificationGoal.status}
        </p>
      </div>

      {/* Skills */}
      <h2 className="mt-14 text-2xl font-bold text-white">Especialidades</h2>
      <div className="mt-5 flex flex-wrap gap-2">
        {profile.skills.map((skill) => (
          <span
            key={skill}
            className="rounded-full border border-ink-700 bg-ink-900 px-4 py-1.5 text-sm text-slate-300"
          >
            {skill}
          </span>
        ))}
      </div>

      {/* Experiencia */}
      <h2 className="mt-14 text-2xl font-bold text-white">Experiencia</h2>
      <div className="mt-6 space-y-0 border-l-2 border-ink-700">
        {profile.experience.map((job) => (
          <div key={`${job.company}-${job.period}`} className="relative pb-10 pl-8">
            <span className="absolute -left-[7px] top-1.5 h-3 w-3 rounded-full bg-sap-blue" />
            <p className="text-sm text-slate-500">{job.period}</p>
            <h3 className="mt-1 font-bold text-white">{job.role}</h3>
            <p className="text-sm text-sap-blue-light">
              {job.company} · {job.location}
            </p>
            <p className="mt-2 text-sm text-slate-400">{job.summary}</p>
          </div>
        ))}
      </div>

      {/* Certificaciones */}
      <h2 className="mt-6 text-2xl font-bold text-white">
        Certificaciones destacadas
      </h2>
      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        {profile.certifications.map((cert) => (
          <div
            key={cert.name}
            className="rounded-2xl border border-ink-700 bg-ink-900 p-5"
          >
            <p className="font-semibold text-white">{cert.name}</p>
            <p className="mt-1 text-sm text-slate-400">
              {cert.issuer} · {cert.year}
            </p>
          </div>
        ))}
      </div>

      {/* Educación e idiomas */}
      <div className="mt-14 grid gap-10 md:grid-cols-2">
        <div>
          <h2 className="text-2xl font-bold text-white">Educación</h2>
          <ul className="mt-5 space-y-4">
            {profile.education.map((edu) => (
              <li key={edu.school}>
                <p className="font-semibold text-white">{edu.school}</p>
                <p className="text-sm text-slate-400">{edu.degree}</p>
                <p className="text-sm text-slate-500">{edu.period}</p>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h2 className="text-2xl font-bold text-white">Idiomas</h2>
          <ul className="mt-5 space-y-3">
            {profile.languages.map((lang) => (
              <li key={lang.name} className="flex justify-between border-b border-ink-800 pb-2">
                <span className="text-slate-300">{lang.name}</span>
                <span className="text-sm text-slate-500">{lang.level}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Contacto */}
      <div className="mt-16 rounded-3xl border border-ink-700 bg-ink-900 p-8 text-center">
        <h2 className="text-2xl font-bold text-white">Contacto</h2>
        <p className="mt-2 text-slate-400">
          ¿Tienes un proyecto de integración o quieres intercambiar ideas?
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-4">
          <a
            href={profile.linkedin}
            target="_blank"
            rel="noreferrer"
            className="rounded-xl bg-sap-blue px-6 py-3 font-semibold text-white transition-colors hover:bg-sap-blue-light"
          >
            LinkedIn
          </a>
          <a
            href={`mailto:${profile.email}`}
            className="rounded-xl border border-ink-700 px-6 py-3 font-semibold text-slate-300 transition-colors hover:border-sap-blue hover:text-white"
          >
            Enviar correo
          </a>
        </div>
      </div>
    </section>
  );
}
