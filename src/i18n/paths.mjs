const englishSegments = { recursos: "resources", "sobre-mi": "about", contacto: "contact" };
const spanishSegments = Object.fromEntries(Object.entries(englishSegments).map(([es, en]) => [en, es]));

export function languageFromPath(path) {
  return /^\/en(?:\/|$)/.test(path) ? "en" : "es";
}

/** Localize site URLs while preserving downloads, external URLs and anchors. */
export function localePath(value, lang) {
  if (!value.startsWith("/") || value.startsWith("//")) return value;
  const split = value.search(/[?#]/);
  const pathname = split < 0 ? value : value.slice(0, split);
  const suffix = split < 0 ? "" : value.slice(split);
  let parts = pathname.split("/").filter(Boolean);
  if (parts[0] === "en") parts.shift();
  if (spanishSegments[parts[0]]) parts[0] = spanishSegments[parts[0]];
  if (parts.length && !["blog", ...Object.keys(englishSegments)].includes(parts[0])) return value;
  if (lang === "en") {
    if (englishSegments[parts[0]]) parts[0] = englishSegments[parts[0]];
    parts.unshift("en");
  }
  return "/" + parts.join("/") + (pathname.endsWith("/") && parts.length ? "/" : "") + suffix;
}
