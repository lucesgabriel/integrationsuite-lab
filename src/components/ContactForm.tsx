import { useState, type FormEvent } from "react";
import { profile } from "../data/profile";
import { services } from "../data/services";
import { useLang } from "../i18n";

type Status = "idle" | "sending" | "success" | "error";

const inputClass =
  "w-full rounded-xl border border-line bg-canvas px-4 py-3 text-sm text-body placeholder:text-faint outline-none transition-colors focus:border-sap-blue";

export default function ContactForm() {
  const [status, setStatus] = useState<Status>("idle");
  const { t } = useLang();
  const f = t.contact.form;

  // Sin access key configurado: fallback al correo directo
  if (!services.web3formsAccessKey) {
    return (
      <div className="rounded-2xl border border-line bg-card p-8 text-center">
        <p className="text-muted">{f.pending}</p>
        <a
          href={`mailto:${profile.email}`}
          className="glow mt-6 inline-block rounded-xl bg-sap-blue px-6 py-3 font-semibold text-white transition-all hover:bg-sap-blue/90"
        >
          {profile.email}
        </a>
      </div>
    );
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const data = Object.fromEntries(new FormData(form));
    setStatus("sending");
    try {
      const res = await fetch("https://api.web3forms.com/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({
          access_key: services.web3formsAccessKey,
          subject: "Nuevo mensaje desde sapintegrationlab.com",
          ...data,
        }),
      });
      const json = await res.json();
      if (json.success) {
        setStatus("success");
        form.reset();
      } else {
        setStatus("error");
      }
    } catch {
      setStatus("error");
    }
  }

  if (status === "success") {
    return (
      <div className="rounded-2xl border border-emerald-500/40 bg-card p-8 text-center">
        <p className="text-3xl">✅</p>
        <h3 className="mt-3 text-xl font-bold text-strong">{f.successTitle}</h3>
        <p className="mt-2 text-muted">{f.successText}</p>
        <button
          onClick={() => setStatus("idle")}
          className="mt-6 rounded-xl border border-line px-5 py-2.5 text-sm font-semibold text-body transition-colors hover:border-sap-blue hover:text-strong"
        >
          {f.sendAnother}
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-2xl border border-line bg-card p-6 md:p-8">
      {/* Honeypot anti-spam de Web3Forms */}
      <input
        type="checkbox"
        name="botcheck"
        tabIndex={-1}
        autoComplete="off"
        className="hidden"
        aria-hidden="true"
      />

      <label className="block text-sm font-semibold text-strong" htmlFor="ct-name">
        {f.name}
      </label>
      <input
        id="ct-name"
        name="name"
        type="text"
        required
        placeholder={f.namePlaceholder}
        className={`${inputClass} mt-2`}
      />

      <label className="mt-5 block text-sm font-semibold text-strong" htmlFor="ct-email">
        {f.email}
      </label>
      <input
        id="ct-email"
        name="email"
        type="email"
        required
        placeholder={f.emailPlaceholder}
        className={`${inputClass} mt-2`}
      />

      <label className="mt-5 block text-sm font-semibold text-strong" htmlFor="ct-message">
        {f.message}
      </label>
      <textarea
        id="ct-message"
        name="message"
        required
        rows={5}
        placeholder={f.messagePlaceholder}
        className={`${inputClass} mt-2 resize-y`}
      />

      {status === "error" && (
        <p className="mt-4 rounded-xl border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-400">
          {f.error}{" "}
          <a href={`mailto:${profile.email}`} className="underline">
            {profile.email}
          </a>
          .
        </p>
      )}

      <button
        type="submit"
        disabled={status === "sending"}
        className="glow mt-6 w-full rounded-xl bg-sap-blue px-6 py-3 font-semibold text-white transition-all hover:bg-sap-blue/90 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {status === "sending" ? f.sending : f.send}
      </button>
    </form>
  );
}
