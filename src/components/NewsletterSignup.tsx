import { useState, type FormEvent } from "react";
import { services } from "../data/services";
import { useLang } from "../i18n";

type Status = "idle" | "sending" | "success" | "error";

/**
 * Suscripción al newsletter vía Kit (ConvertKit).
 * No se renderiza hasta que services.kitFormAction esté configurado.
 */
export default function NewsletterSignup() {
  const [status, setStatus] = useState<Status>("idle");
  const { t } = useLang();

  if (!services.kitFormAction) return null;

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    setStatus("sending");
    try {
      const res = await fetch(services.kitFormAction, {
        method: "POST",
        headers: { Accept: "application/json" },
        body: new FormData(form),
      });
      const json = await res.json();
      if (json.status === "success" || json.status === "quarantined") {
        setStatus("success");
        form.reset();
      } else {
        setStatus("error");
      }
    } catch {
      setStatus("error");
    }
  }

  return (
    <div className="relative overflow-hidden rounded-3xl border border-sap-blue/30 bg-gradient-to-br from-raised to-card p-8 md:p-10">
      <div
        className="pointer-events-none absolute -right-16 -top-16 h-48 w-48 rounded-full blur-3xl"
        style={{ background: "var(--orb)" }}
      />
      <div className="relative mx-auto max-w-xl text-center">
        <p className="text-2xl">📬</p>
        <h2 className="mt-2 text-2xl font-bold text-strong">
          {t.newsletter.heading}
        </h2>
        <p className="mt-2 text-sm text-muted">{t.newsletter.description}</p>

        {status === "success" ? (
          <p className="mt-6 rounded-xl border border-emerald-500/40 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-500">
            {t.newsletter.success}
          </p>
        ) : (
          <form
            onSubmit={handleSubmit}
            className="mt-6 flex flex-col gap-3 sm:flex-row"
          >
            <input
              type="email"
              name="email_address"
              required
              placeholder={t.newsletter.placeholder}
              aria-label="Email"
              className="w-full flex-1 rounded-xl border border-line bg-base px-4 py-3 text-sm text-body placeholder:text-faint outline-none transition-colors focus:border-sap-blue"
            />
            <button
              type="submit"
              disabled={status === "sending"}
              className="glow rounded-xl bg-sap-blue px-6 py-3 text-sm font-semibold text-white transition-all hover:bg-sap-blue-light disabled:cursor-not-allowed disabled:opacity-60"
            >
              {status === "sending" ? t.newsletter.sending : t.newsletter.subscribe}
            </button>
          </form>
        )}

        {status === "error" && (
          <p className="mt-3 text-sm text-red-400">{t.newsletter.error}</p>
        )}
      </div>
    </div>
  );
}
