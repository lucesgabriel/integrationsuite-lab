import { useEffect } from "react";
import { Outlet, useLocation } from "react-router-dom";
import Navbar from "./Navbar";
import Footer from "./Footer";
import { useLang } from "../i18n";

export default function Layout() {
  const { pathname, hash } = useLocation();
  const { t } = useLang();

  useEffect(() => {
    if (hash) {
      let id: string;
      try { id = decodeURIComponent(hash.slice(1)); } catch { return; }
      document.getElementById(id)?.scrollIntoView();
    } else {
      window.scrollTo(0, 0);
    }
  }, [pathname, hash]);

  return (
    <div className="min-h-screen flex flex-col">
      <a className="skip-link" href="#main-content">{t.nav.skip}</a>
      <Navbar />
      <main id="main-content" tabIndex={-1} className="min-w-0 flex-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
