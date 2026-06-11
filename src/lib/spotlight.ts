import type { MouseEvent } from "react";

/**
 * Actualiza las variables CSS --mx/--my con la posición del mouse dentro
 * del elemento, para el efecto spotlight de `.spotlight-card`.
 */
export function trackSpotlight(e: MouseEvent<HTMLElement>) {
  const rect = e.currentTarget.getBoundingClientRect();
  e.currentTarget.style.setProperty("--mx", `${e.clientX - rect.left}px`);
  e.currentTarget.style.setProperty("--my", `${e.clientY - rect.top}px`);
}
