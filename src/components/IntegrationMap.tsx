import { lazy, Suspense, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useLang } from "../i18n";
import { LocalizedLink } from "./LocalizedLink";

const ThreeFlowCanvas = lazy(() => import("./ThreeFlowCanvas"));
const flows = [
  { nodes: ["Postman", "Cloud Integration", "Cloud Connector", "S/4HANA"], slug: "maintenance-order-lookup-simple-postman" },
  { nodes: ["Postman", "API Management", "Cloud Integration", "Catalog API"], slug: "api-gobernada-cpi-api-management" },
  { nodes: ["CPI", "ProcessDirect", "Open Connectors", "ServiceNow"], slug: "servicenow-incident-open-connectors-cloud-connector" },
];

function StaticFlow({ nodes }: { nodes: string[] }) {
  return <svg viewBox="0 0 600 300" aria-hidden="true" className="flow-fallback">
    <path d="M65 160 Q150 80 220 135 T390 135 T540 160" fill="none" stroke="var(--c-accent-text)" strokeWidth="3" strokeDasharray="7 6" />
    {nodes.map((name, i) => <g key={name} transform={`translate(${65 + i * 155},${i === 1 || i === 2 ? 128 : 160})`}>
      <rect x="-52" y="-32" width="104" height="64" rx="16" fill="var(--c-card)" stroke="var(--c-accent-text)" strokeWidth="2" />
      <circle r="8" fill="var(--c-accent-text)" />
      <text y="53" textAnchor="middle" fontSize="12" fill="var(--c-strong)">{name}</text>
    </g>)}
  </svg>;
}

export default function IntegrationMap() {
  const { t } = useLang();
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const [visible, setVisible] = useState(false);
  const [activated, setActivated] = useState(false);
  const [reduced, setReduced] = useState(true);
  const [failed, setFailed] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const nodes = useMemo(() => flows[active].nodes, [active]);
  const onFailure = useCallback(() => setFailed(true), []);

  useEffect(() => {
    const media = matchMedia("(prefers-reduced-motion: reduce)");
    const change = () => setReduced(media.matches);
    change(); media.addEventListener("change", change);
    const observer = new IntersectionObserver(([entry]) => {
      setVisible(entry.isIntersecting);
      if (entry.isIntersecting) setActivated(true);
    }, { rootMargin: "100px" });
    if (ref.current) observer.observe(ref.current);
    return () => { observer.disconnect(); media.removeEventListener("change", change); };
  }, []);

  return <div ref={ref} className="integration-map">
    <div className="map-heading">
      <p className="eyebrow">{t.integrationMap.eyebrow}</p>
      <h2>{t.integrationMap.title}</h2>
    </div>
    <div className="map-tabs" role="group" aria-label={t.integrationMap.title}>
      {t.integrationMap.scenarios.map((scenario, i) => <button key={i} aria-pressed={i === active} onClick={() => setActive(i)}>{scenario.name}</button>)}
    </div>
    <div className="map-stage">
      <StaticFlow nodes={nodes} />
      {activated && !reduced && !failed && <Suspense fallback={null}>
        <ThreeFlowCanvas nodes={nodes} active={visible && !paused} onFailure={onFailure} />
      </Suspense>}
      {!reduced && !failed && <button className="map-pause" onClick={() => setPaused(!paused)} aria-label={paused ? t.integrationMap.play : t.integrationMap.pause} title={paused ? t.integrationMap.play : t.integrationMap.pause}>{paused ? "▶" : "Ⅱ"}</button>}
    </div>
    <ol className="map-route" aria-label={t.integrationMap.canvasLabel}>{nodes.map((node, i) => <li key={node}><span>{String(i + 1).padStart(2, "0")}</span>{node}</li>)}</ol>
    <p className="map-description">{t.integrationMap.scenarios[active].description}</p>
    <LocalizedLink to={`/blog/${flows[active].slug}/`} className="map-case-link">{t.integrationMap.readCase}</LocalizedLink>
  </div>;
}
