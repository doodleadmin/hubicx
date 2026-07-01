import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");
const appDir = path.join(root, "public", "app");

const scripts = [
  ["telegram-web-app", "assets/vendor/telegram-web-app.62.js"],
  ["bootstrap", "assets/bootstrap.20260629-fs-media1.js"],
  ["loader", "loader.js"],
  ["react", "assets/vendor/react.production.min.js"],
  ["react-dom", "assets/vendor/react-dom.production.min.js"],
  ["app", "assets/app.bundle.js"],
];

function escapeScript(source) {
  return source
    .replace(/<\/script/gi, "<\\/script")
    .replace(/<!--/g, "<\\!--")
    .replace(/-->/g, "--\\>");
}

const template = await readFile(path.join(appDir, "index.source.html"), "utf8");
const blocks = [];
let buildId = "dev";
try {
  const meta = JSON.parse(await readFile(path.join(appDir, "build-id.json"), "utf8"));
  if (meta && meta.buildId) buildId = String(meta.buildId);
} catch (e) {
  buildId = process.env.HUBICX_BUILD_ID || "dev";
}

blocks.push(`<script>window.__HUBICX_INLINE_INDEX__='${buildId}';</script>`);

for (const [name, rel] of scripts) {
  const source = await readFile(path.join(appDir, rel), "utf8");
  blocks.push(`<script data-hubicx-inline="${name}">\n${escapeScript(source)}\n</script>`);
}

const html = template.replace("<!-- HUBICX_INLINE_SCRIPTS -->", () => blocks.join("\n"));
await writeFile(path.join(appDir, "index.html"), html, "utf8");
console.log("Built public/app/index.html with inline Mini App scripts");
