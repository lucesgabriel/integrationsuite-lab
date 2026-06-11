import { useRef, useState, type HTMLAttributes } from "react";
import { useLang } from "../i18n";

/**
 * <pre> de los posts: bloque de código resaltado + botón de copiar.
 * El resaltado lo hace rehype-prism-plus (ver src/lib/highlight.ts).
 */
export default function CodeBlock(props: HTMLAttributes<HTMLPreElement>) {
  const preRef = useRef<HTMLPreElement>(null);
  const [copied, setCopied] = useState(false);
  const { t } = useLang();

  async function copy() {
    const text = preRef.current?.innerText ?? "";
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // clipboard no disponible (http antiguo): no romper nada
    }
  }

  return (
    <div className="group relative">
      <button
        onClick={copy}
        aria-label={t.blog.copy}
        className={`absolute right-2.5 top-2.5 z-10 flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs font-medium backdrop-blur transition-all ${
          copied
            ? "border-emerald-500/50 text-emerald-500"
            : "border-line bg-card/80 text-faint opacity-0 hover:border-sap-blue hover:text-strong group-hover:opacity-100"
        }`}
      >
        {copied ? (
          <>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 6L9 17l-5-5" />
            </svg>
            {t.blog.copied}
          </>
        ) : (
          <>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="9" y="9" width="13" height="13" rx="2" />
              <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
            </svg>
            {t.blog.copy}
          </>
        )}
      </button>
      <pre ref={preRef} {...props} />
    </div>
  );
}
