import fs from "node:fs";
import path from "node:path";
import assert from "node:assert/strict";
import { localePath } from "../src/i18n/paths.mjs";

const directory = "src/content/posts";
const originals = fs.readdirSync(directory).filter(file => file.endsWith(".md"));
const english = fs.readdirSync(path.join(directory, "en")).filter(file => file.endsWith(".md"));
assert.deepEqual([...originals].sort(), [...english].sort(), "Article language parity");
const images = raw => [...raw.matchAll(/!\[[^\]]*\]\(([^)]+)\)/g)].map(match => match[1]);
const field = (raw, name) => raw.match(new RegExp(`^${name}: (.+)$`, "m"))?.[1];
let imagesChecked = 0, routesChecked = 0;
const routes = [];
for (const file of originals) {
  const es = fs.readFileSync(path.join(directory, file), "utf8");
  const en = fs.readFileSync(path.join(directory, "en", file), "utf8");
  for (const name of ["title", "description", "date", "tags"]) assert.ok(field(en, name), `${file}: ${name}`);
  for (const name of ["date", "tags"]) assert.equal(field(es, name), field(en, name), `${file}: preserve ${name}`);
  assert.notEqual(field(es, "title"), field(en, "title"), `${file}: translated title`);
  assert.deepEqual(images(es), images(en), `${file}: preserve every documentary image`);
  assert.equal((es.match(/^```/gm) ?? []).length, (en.match(/^```/gm) ?? []).length, `${file}: code examples retained`);
  assert.equal((es.match(/^#{2,3} /gm) ?? []).length, (en.match(/^#{2,3} /gm) ?? []).length, `${file}: all sections retained`);
  assert.ok(en.split(/\s+/).length > es.split(/\s+/).length * .7, `${file}: complete translation rather than summary`);
  for (const raw of [es, en]) {
    for (const image of images(raw)) { assert.ok(fs.existsSync(path.join("public", image)), `${file}: image ${image}`); imagesChecked++; }
    for (const [, href] of raw.matchAll(/(?<!!)\[[^\]]*\]\((\/[^)]+)\)/g)) {
      const pathname = href.split(/[?#]/)[0];
      if (pathname.startsWith("/blog/")) assert.ok(originals.includes(pathname.split("/")[2] + ".md"), `${file}: article link ${href}`);
      if (pathname.startsWith("/downloads/") || pathname.startsWith("/images/")) assert.ok(fs.existsSync(path.join("public", pathname)), `${file}: asset ${href}`);
    }
  }
  routes.push(`/blog/${file.replace(/\.md$/, "")}/`);
}
routes.push("/", "/blog/", "/recursos/", "/sobre-mi/", "/contacto/");
if (process.argv.includes("--dist")) {
  const sitemap = fs.readFileSync("dist/sitemap.xml", "utf8");
  for (const base of routes) for (const lang of ["es", "en"]) {
    const route = localePath(base, lang);
    const html = fs.readFileSync(path.join("dist", route, "index.html"), "utf8");
    assert.ok(html.includes(`<html lang="${lang}">`), `${route}: html language`);
    assert.equal((html.match(/rel="canonical"/g) ?? []).length, 1, `${route}: single canonical`);
    assert.ok(html.includes(`rel="canonical" href="https://sapintegrationlab.com${route}"`), `${route}: canonical URL`);
    for (const alternate of ["es", "en", "x-default"]) assert.ok(html.includes(`hreflang="${alternate}"`), `${route}: hreflang ${alternate}`);
    assert.ok(sitemap.includes(`<loc>https://sapintegrationlab.com${route}</loc>`), `${route}: sitemap`);
    for (const [, id] of html.matchAll(/href="#([^"]+)"/g)) assert.ok(html.includes(`id="${id}"`), `${route}: TOC anchor ${id}`);
    if (base.startsWith("/blog/") && base !== "/blog/") assert.ok(html.includes(`"inLanguage":"${lang}"`), `${route}: structured language`);
    routesChecked++;
  }
}
console.log(`Content checks passed: ${originals.length} complete ES/EN article pairs, ${imagesChecked} image references, ${routesChecked} static routes.`);
