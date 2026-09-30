import { useSearchParams } from "react-router-dom";
import { LocalizedLink } from "../components/LocalizedLink";
import { resources, type ResourceCategory } from "../data/resources";
import { normalizeSearch } from "../lib/search";
import Seo from "../components/Seo";
import { useLang } from "../i18n";

const categoryOrder: ResourceCategory[] = ["guides", "postman", "groovy", "schemas", "diagrams"];
const categorySymbols: Record<ResourceCategory, string> = { guides: "PDF", postman: "{ }", groovy: "</>", schemas: "XSD", diagrams: "◇" };

export default function Resources() {
  const { t, lang } = useLang();
  const [params, setParams] = useSearchParams();
  const query = params.get("q") ?? "";
  const category = params.get("category") ?? "";
  const items = resources.filter(resource => {
    if (category && resource.category !== category) return false;
    const text = normalizeSearch([resource.title[lang], resource.description[lang], t.resources.categories[resource.category], resource.post ?? ""].join(" "));
    return normalizeSearch(query).trim().split(/\s+/).every(word => text.includes(word));
  });
  function filter(key: string, value: string) {
    setParams(previous => {
      const next = new URLSearchParams(previous);
      if (value) next.set(key, value); else next.delete(key);
      return next;
    }, { replace: true });
  }

  return <section className="site-shell page-section resources-page">
    <Seo title={t.seo.resourcesTitle} description={t.resources.description} path="/recursos/" />
    <div className="catalog-header">
      <div>
        <p className="eyebrow">{t.resources.eyebrow}</p>
        <h1 className="page-title font-extrabold text-strong">{t.resources.title}</h1>
        <p className="page-intro mt-4 max-w-2xl text-muted">{t.resources.description}</p>
      </div>
      <div className="catalog-total"><strong>{resources.length.toString().padStart(2, "0")}</strong><span>{t.resources.count}</span><div className="catalog-symbols" aria-hidden="true">PDF <span>/</span> JSON <span>/</span> XML</div></div>
    </div>
    <div className="catalog-controls">
      <label htmlFor="resource-search" className="resource-search"><span>{t.resources.search}</span><input id="resource-search" type="search" value={query} placeholder={t.resources.searchPlaceholder} onChange={event => filter("q", event.target.value)} /></label>
      <div className="filter-list flex flex-wrap gap-2" role="group" aria-label={t.resources.title}>
        <button onClick={() => filter("category", "")} aria-pressed={!category}>{t.resources.all} <span>{resources.length}</span></button>
        {categoryOrder.map(cat => <button key={cat} onClick={() => filter("category", cat)} aria-pressed={category === cat}>{t.resources.categories[cat]} <span>{resources.filter(r => r.category === cat).length}</span></button>)}
      </div>
    </div>
    <div className="catalog-result"><p role="status">{items.length} {t.resources.results}</p>{(query || category) && <button onClick={() => setParams({})}>{t.resources.clear}</button>}</div>
    {categoryOrder.map(cat => {
      const group = items.filter(resource => resource.category === cat);
      if (!group.length) return null;
      return <section key={cat} className="resource-group" aria-labelledby={`category-${cat}`}>
        <div className="resource-group-heading"><h2 id={`category-${cat}`}>{t.resources.categories[cat]}</h2><span>{String(group.length).padStart(2, "0")}</span></div>
        <div className="resource-grid">{group.map(resource => <article key={resource.file} className="resource-card">
          <div className="resource-card-top"><span className="resource-symbol" aria-hidden="true">{categorySymbols[cat]}</span><div className="resource-meta"><span>{resource.format ?? "ZIP"} · {resource.size}</span><span title={t.resources.language}>{t.resources.fileLanguages[resource.language ?? "technical"]}</span></div></div>
          <h3>{resource.title[lang]}</h3>
          <p>{resource.description[lang]}</p>
          <div className="resource-actions"><a href={resource.file} download className="resource-download">{t.resources.download}<span aria-hidden="true">↓</span></a>{resource.post && <LocalizedLink to={`/blog/${resource.post}/`}>{t.resources.fromCase}</LocalizedLink>}</div>
        </article>)}</div>
      </section>;
    })}
    {!items.length && <p className="catalog-empty">{t.resources.empty}</p>}
    <p className="catalog-note">{t.resources.note}</p>
  </section>;
}
