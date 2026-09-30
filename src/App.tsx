import { Routes, Route } from "react-router-dom";
import { lazy, Suspense } from "react";
import { useLang } from "./i18n";
import Layout from "./components/Layout";
import Home from "./pages/Home";
import Blog from "./pages/Blog";
const BlogPost = lazy(() => import("./pages/BlogPost"));
import About from "./pages/About";
import Resources from "./pages/Resources";
import Contact from "./pages/Contact";
import NotFound from "./pages/NotFound";

export default function App() {
  const { t } = useLang();
  return (
    <Suspense fallback={<p className="site-shell page-section text-muted" role="status">{t.nav.loading}</p>}>
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="blog" element={<Blog />} />
        <Route path="blog/:slug" element={<BlogPost />} />
        <Route path="recursos" element={<Resources />} />
        <Route path="sobre-mi" element={<About />} />
        <Route path="contacto" element={<Contact />} />
        <Route path="*" element={<NotFound />} />
      </Route>
      <Route path="en" element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="blog" element={<Blog />} />
        <Route path="blog/:slug" element={<BlogPost />} />
        <Route path="resources" element={<Resources />} />
        <Route path="about" element={<About />} />
        <Route path="contact" element={<Contact />} />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
    </Suspense>
  );
}
