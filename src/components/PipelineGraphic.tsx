/**
 * Mini-pipeline de integración decorativo para el hero:
 * Sender → CPI → Receiver con flujo de datos animado (CSS puro).
 */
export default function PipelineGraphic() {
  return (
    <svg
      viewBox="0 0 360 220"
      className="h-auto w-full max-w-md select-none"
      fill="none"
      aria-hidden="true"
    >
      {/* Conexiones con flujo animado */}
      <path
        d="M78 60 C 120 60, 130 110, 168 110"
        stroke="var(--grad-b)"
        strokeWidth="2"
        className="dash-flow"
        opacity="0.8"
      />
      <path
        d="M78 160 C 120 160, 130 110, 168 110"
        stroke="var(--grad-b)"
        strokeWidth="2"
        className="dash-flow"
        opacity="0.8"
      />
      <path
        d="M222 110 C 260 110, 270 110, 300 110"
        stroke="var(--grad-a)"
        strokeWidth="2"
        className="dash-flow"
      />

      {/* Nodo: Sender A */}
      <g>
        <rect x="18" y="38" width="60" height="44" rx="10" fill="var(--c-card)" stroke="var(--c-line-strong)" />
        <circle cx="48" cy="55" r="5" fill="#0070f2" className="node-pulse" />
        <text x="48" y="74" textAnchor="middle" fontSize="9" fill="var(--c-muted)" fontFamily="Inter, sans-serif">
          Salesforce
        </text>
      </g>

      {/* Nodo: Sender B */}
      <g>
        <rect x="18" y="138" width="60" height="44" rx="10" fill="var(--c-card)" stroke="var(--c-line-strong)" />
        <circle cx="48" cy="155" r="5" fill="#0070f2" className="node-pulse" style={{ animationDelay: "0.8s" }} />
        <text x="48" y="174" textAnchor="middle" fontSize="9" fill="var(--c-muted)" fontFamily="Inter, sans-serif">
          Postman
        </text>
      </g>

      {/* Nodo central: Integration Suite */}
      <g>
        <rect x="168" y="78" width="54" height="64" rx="12" fill="var(--c-card)" stroke="#0070f2" strokeWidth="1.5" />
        <rect x="180" y="92" width="30" height="6" rx="3" fill="var(--grad-b)" opacity="0.9" />
        <rect x="180" y="104" width="22" height="6" rx="3" fill="var(--grad-a)" opacity="0.7" />
        <rect x="180" y="116" width="26" height="6" rx="3" fill="var(--grad-b)" opacity="0.5" />
        <text x="195" y="156" textAnchor="middle" fontSize="9" fontWeight="600" fill="var(--c-body)" fontFamily="Inter, sans-serif">
          Integration Suite
        </text>
      </g>

      {/* Nodo: Receiver */}
      <g>
        <rect x="300" y="88" width="48" height="44" rx="10" fill="var(--c-card)" stroke="var(--c-line-strong)" />
        <circle cx="324" cy="105" r="5" fill="#22c55e" className="node-pulse" style={{ animationDelay: "0.4s" }} />
        <text x="324" y="124" textAnchor="middle" fontSize="9" fill="var(--c-muted)" fontFamily="Inter, sans-serif">
          S/4HANA
        </text>
      </g>
    </svg>
  );
}
