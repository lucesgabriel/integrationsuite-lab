/** Stable, unique anchors shared by the static and interactive article renderers. */
export default function headingIds() {
  return (tree) => {
    const used = new Map();
    function text(node) {
      return node.value ?? node.children?.map(text).join("") ?? "";
    }
    function visit(node) {
      if (node.type === "heading") {
        const base = text(node).normalize("NFD").replace(/[\u0300-\u036f]/g, "")
          .toLowerCase().replace(/[^a-z0-9\s-]/g, "").trim().replace(/\s+/g, "-") || "section";
        const count = used.get(base) ?? 0;
        used.set(base, count + 1);
        node.data = { ...node.data, hProperties: { ...node.data?.hProperties, id: count ? `${base}-${count}` : base } };
      }
      node.children?.forEach(visit);
    }
    visit(tree);
  };
}
