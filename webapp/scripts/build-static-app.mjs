import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { build, transform } from "esbuild";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");

const targets = [
  {
    name: "app",
    outfile: "public/app/assets/app.bundle.js",
    files: [
      "public/app/ma-api.jsx",
      "public/app/hbx-i18n.jsx",
      "public/app/ma-core.jsx",
      "public/app/ma-chat.jsx",
      "public/app/ma-agent.jsx",
      "public/app/ma-generation.jsx",
      "public/app/ma-create.jsx",
      "public/app/ma-profile.jsx",
      "public/app/ma-desktop-screens.jsx",
      "public/app/ma-landing.jsx",
      "public/app/ma-app.jsx",
    ],
  },
  {
    name: "partners",
    outfile: "public/partners/partners.bundle.js",
    files: [
      "public/partners/partners-api.js",
      "public/partners/partners-core.jsx",
      "public/partners/partners-login.jsx",
      "public/partners/partners-dash.jsx",
      "public/partners/partners-links.jsx",
      "public/partners/partners-comms.jsx",
      "public/partners/partners-payouts.jsx",
      "public/partners/partners-app.jsx",
    ],
  },
];

async function buildTarget(target) {
  const parts = [];
  for (const rel of target.files) {
    const abs = path.join(root, rel);
    const source = await readFile(abs, "utf8");
    parts.push(`\n/* ${rel} */\n;(function(){\n${source}\n})();\n`);
  }

  const prelude = [
    "(function(){",
    "var useState=React.useState,useEffect=React.useEffect,useMemo=React.useMemo,useRef=React.useRef;",
    "var uS=React.useState,uE=React.useEffect,uM=React.useMemo,uR=React.useRef;",
  ].join("\n");
  const source = `${prelude}\n${parts.join("\n")}\n})();`;
  const commonOptions = {
    jsx: "transform",
    target: "es2018",
    format: "iife",
    minify: true,
    legalComments: "none",
  };
  const bundled = target.name === "partners"
    ? await build({
        ...commonOptions,
        bundle: true,
        write: false,
        stdin: {
          contents: `import * as ReactModule from "react";\nimport { createRoot } from "react-dom/client";\nvar React = ReactModule;\nvar ReactDOM = { createRoot };\n${source}`,
          loader: "jsx",
          resolveDir: root,
          sourcefile: `${target.name}.bundle.jsx`,
        },
      }).then((result) => ({ code: result.outputFiles[0].text }))
    : await transform(source, {
        ...commonOptions,
        loader: "jsx",
        sourcefile: `${target.name}.bundle.jsx`,
      });

  const outfile = path.join(root, target.outfile);
  await mkdir(path.dirname(outfile), { recursive: true });
  await writeFile(outfile, `${bundled.code}\n`, "utf8");
  if (target.name === "app") {
    try {
      const meta = JSON.parse(await readFile(path.join(root, "public", "app", "build-id.json"), "utf8"));
      if (meta && meta.buildId) {
        const versionedOutfile = path.join(root, "public", "app", "assets", `app.bundle.${meta.buildId}.js`);
        await writeFile(versionedOutfile, `${bundled.code}\n`, "utf8");
        console.log(`Built public/app/assets/app.bundle.${meta.buildId}.js`);
      }
    } catch (e) {
      // Keep the unversioned bundle as the required fallback if build metadata is absent.
    }
  }
  console.log(`Built ${target.outfile}`);
}

await Promise.all(targets.map(buildTarget));
