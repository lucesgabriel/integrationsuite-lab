const keywords = [
  "iFlows",
  "Groovy",
  "OData",
  "API Proxy",
  "Event Mesh",
  "SAP BTP",
  "Cloud Connector",
  "Message Mapping",
  "Data Store",
  "XSLT",
  "JMS Queues",
  "Open Connectors",
  "Edge Integration Cell",
  "OAuth 2.0",
];

export default function TechTicker() {
  return (
    <div className="ticker-mask overflow-hidden border-y border-line bg-card/60">
      <div className="animate-marquee flex w-max items-center gap-10 py-3">
        {[...keywords, ...keywords].map((word, i) => (
          <span
            key={`${word}-${i}`}
            className="flex items-center gap-10 whitespace-nowrap font-mono text-xs font-medium tracking-wider text-faint"
          >
            {word}
            <span className="h-1 w-1 rounded-full bg-sap-blue" />
          </span>
        ))}
      </div>
    </div>
  );
}
