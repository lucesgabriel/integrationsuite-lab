import { useEffect, useRef, useState } from "react";
import { useLang } from "../i18n";

export default function Lightbox({ src, alt, onClose }: { src: string; alt?: string; onClose: () => void }) {
  const { t } = useLang();
  const [zoomed, setZoomed] = useState(false);
  const dialog = useRef<HTMLDivElement>(null);
  const close = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    const previous = document.activeElement as HTMLElement | null;
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden"; close.current?.focus();
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
      if (event.key !== "Tab") return;
      const controls = dialog.current?.querySelectorAll<HTMLElement>("button, a[href], [tabindex='0']");
      if (!controls?.length) return;
      const first = controls[0], last = controls[controls.length - 1];
      if (event.shiftKey && document.activeElement === first) { event.preventDefault(); last.focus(); }
      else if (!event.shiftKey && document.activeElement === last) { event.preventDefault(); first.focus(); }
    };
    document.addEventListener("keydown", onKey);
    return () => { document.removeEventListener("keydown", onKey); document.body.style.overflow = overflow; previous?.focus(); };
  }, [onClose]);

  return <div ref={dialog} className="lightbox" role="dialog" aria-modal="true" aria-label={t.media.title} onClick={event => { if (event.target === event.currentTarget) onClose(); }}>
    <div className="lightbox-toolbar">
      <button onClick={() => setZoomed(!zoomed)}>{zoomed ? t.media.fit : t.media.zoom}</button>
      <a href={src} target="_blank" rel="noreferrer">{t.media.original} ↗</a>
      <button ref={close} onClick={onClose} aria-label={t.media.close}>✕</button>
    </div>
    <div className={`lightbox-viewport ${zoomed ? "is-zoomed" : ""}`} tabIndex={0} onClick={event => { if (event.target === event.currentTarget) onClose(); }}>
      <img src={src} alt={alt ?? ""} onClick={() => setZoomed(!zoomed)} />
    </div>
    {alt && <p>{alt}</p>}
  </div>;
}
