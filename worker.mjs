import { runAsWorker } from "synckit";
import { __unstable__loadDesignSystem } from "@tailwindcss/node";
import fs from "node:fs";

let designSystem;

runAsWorker(async (cssPath, candidates) => {
  if (!designSystem) {
    const cssContent = fs.readFileSync(cssPath, "utf-8");
    designSystem = await __unstable__loadDesignSystem(cssContent, { base: process.cwd() });
  }

  const cssValues = designSystem.candidatesToCss(candidates);
  return cssValues;
});
