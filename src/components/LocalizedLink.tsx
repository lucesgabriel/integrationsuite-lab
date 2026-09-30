import { Link, NavLink, type LinkProps, type NavLinkProps } from "react-router-dom";
import { useLang } from "../i18n";
import { localePath } from "../i18n/paths.mjs";

export function LocalizedLink({ to, ...props }: LinkProps) {
  const { lang } = useLang();
  return <Link to={typeof to === "string" ? localePath(to, lang) : to} {...props} />;
}

export function LocalizedNavLink({ to, ...props }: NavLinkProps) {
  const { lang } = useLang();
  return <NavLink to={typeof to === "string" ? localePath(to, lang) : to} {...props} />;
}
