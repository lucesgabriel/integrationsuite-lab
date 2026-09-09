export function normalizeSearch(value: string): string {
  return value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
}

export function matchesSearch(post: { title: string; description: string; tags: string[] }, query: string): boolean {
  const text = normalizeSearch([post.title, post.description, ...post.tags].join(" "));
  return normalizeSearch(query).trim().split(/\s+/).every((word) => text.includes(word));
}
