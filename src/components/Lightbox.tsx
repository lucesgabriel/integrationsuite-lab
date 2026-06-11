import { useEffect } from "react";

interface LightboxProps {
  src: string;
  alt?: string;
  onClose: () => void;
}

/**
 * Visor de imagen a pantalla completa. Cierra con clic (en imagen u
 * overlay), botón ✕ o tecla Escape. Bloquea el scroll mientras está abierto.
 */
export default function Lightbox({ src, alt, onClose }: LightboxProps) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-black/85 p-4 backdrop-blur-sm"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label={alt ?? "Imagen ampliada"}
    >
      <button
        onClick={onClose}
        aria-label="Cerrar imagen"
        className="absolute right-4 top-4 flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/25"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
          <path d="M6 6l12 12M18 6L6 18" />
        </svg>
      </button>

      <img
        src={src}
        alt={alt ?? ""}
        className="animate-zoom-in max-h-[90vh] max-w-[95vw] cursor-zoom-out rounded-xl object-contain shadow-2xl"
      />
      {alt && (
        <p className="mt-4 max-w-3xl text-center text-sm text-slate-300">
          {alt}
        </p>
      )}
    </div>
  );
}
