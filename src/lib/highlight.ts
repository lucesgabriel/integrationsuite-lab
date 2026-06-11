/**
 * Resaltado de sintaxis para los bloques de código de los posts.
 * Usamos rehype-prism-plus con un refractor "a la carta": solo los
 * lenguajes que usan los artículos, para mantener el bundle liviano.
 * Los colores de los tokens viven en index.css (variables por tema).
 */
import { refractor } from "refractor/core";
import markup from "refractor/markup";
import json from "refractor/json";
import groovy from "refractor/groovy";
import bash from "refractor/bash";
import yaml from "refractor/yaml";
import javascript from "refractor/javascript";
import rehypePrismGenerator from "rehype-prism-plus/generator";

refractor.register(markup);
refractor.register(json);
refractor.register(groovy);
refractor.register(bash);
refractor.register(yaml);
refractor.register(javascript);

refractor.alias({ markup: ["xml", "html"], bash: ["sh", "shell"] });

/** Plugin rehype listo para pasar a <ReactMarkdown rehypePlugins>. */
export const rehypePrism = rehypePrismGenerator(refractor);
