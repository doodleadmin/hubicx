import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");

function pad(value) {
  return String(value).padStart(2, "0");
}

function makeBuildId() {
  if (process.env.HUBICX_BUILD_ID) return String(process.env.HUBICX_BUILD_ID).trim();
  const d = new Date();
  return [
    d.getUTCFullYear(),
    pad(d.getUTCMonth() + 1),
    pad(d.getUTCDate()),
    "-",
    pad(d.getUTCHours()),
    pad(d.getUTCMinutes()),
    pad(d.getUTCSeconds()),
    "-gen-price-trace1",
  ].join("");
}

const buildId = makeBuildId();
const appDir = path.join(root, "public", "app");
const assetVersionRe =
  /(\/app\/(?:loader\.css|ma\.css|ma-desktop\.css|loader\.js|desktop-bootstrap\.js|assets\/app\.bundle\.js)\?v=)[^"'<>\s]+/g;

async function updateTextFile(rel, transform) {
  const abs = path.join(root, rel);
  const before = await readFile(abs, "utf8");
  const after = transform(before);
  if (after !== before) await writeFile(abs, after, "utf8");
}

await writeFile(
  path.join(appDir, "build-id.json"),
  `${JSON.stringify({ buildId }, null, 2)}\n`,
  "utf8",
);

for (const rel of ["public/app/desktop-bootstrap.js", "public/app/assets/bootstrap.20260629-fs-media1.js"]) {
  await updateTextFile(rel, (source) =>
    source.replace(/window\.__APP_BUILD__\s*=\s*['"][^'"]+['"];/, `window.__APP_BUILD__ = '${buildId}';`),
  );
}

for (const rel of ["public/desktop.html", "public/app/desktop.html", "public/app/index.source.html"]) {
  await updateTextFile(rel, (source) => source.replace(assetVersionRe, `$1${buildId}`));
}

console.log(`Synced Hubicx app build id: ${buildId}`);
