/* eslint-disable @typescript-eslint/no-require-imports */
"use strict";

const fs = require("fs");
const path = require("path");

const projectRoot = path.join(__dirname, "..");
const targetFiles = [
  "node_modules/react-reconciler/cjs/react-reconciler.development.js",
  "node_modules/react-reconciler/cjs/react-reconciler.production.js",
  "node_modules/react-reconciler/cjs/react-reconciler.profiling.js",
];

const replacementSnippet =
  'rendererVersion = ($$$config.rendererVersion && $$$config.rendererVersion !== "" ? $$$config.rendererVersion : React.version || "0.0.0"),';

let patched = false;

for (const relativePath of targetFiles) {
  const filePath = path.join(projectRoot, relativePath);
  if (!fs.existsSync(filePath)) {
    console.warn(`[patch-react-reconciler] Skipping missing file: ${relativePath}`);
    continue;
  }

  const content = fs.readFileSync(filePath, "utf8");

  if (content.includes(replacementSnippet)) {
    console.log(`[patch-react-reconciler] Already patched: ${relativePath}`);
    continue;
  }
  const regex = /([ \t]*)rendererVersion = \$\$\$?config\.rendererVersion,/;
  if (!regex.test(content)) {
    console.warn(
      `[patch-react-reconciler] Expected target snippet not found in ${relativePath}. File layout may have changed.`,
    );
    continue;
  }

  const updated = content.replace(regex, (_, indent) => `${indent}${replacementSnippet}`);
  fs.writeFileSync(filePath, updated);
  patched = true;
  console.log(`[patch-react-reconciler] Patched ${relativePath}`);
}

if (!patched) {
  console.log("[patch-react-reconciler] No files patched (already up to date or missing).");
}
