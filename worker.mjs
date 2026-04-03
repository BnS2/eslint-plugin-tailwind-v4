import { runAsWorker } from "synckit";
import fs from "node:fs";
import { resolve, join } from "node:path";

let designSystem;
let customClasses = new Set();
let lastMtime = 0;

runAsWorker(async (cssPath, candidates) => {
  const projectRoot = process.cwd();
  const mtime = fs.statSync(cssPath).mtimeMs;

  if (!designSystem || mtime > lastMtime) {
    lastMtime = mtime;
    
    let tailwindNode;
    try {
      tailwindNode = await import("@tailwindcss/node");
    } catch (e) {
      const nodePath = resolve(projectRoot, "node_modules", "@tailwindcss", "node", "dist", "index.mjs");
      tailwindNode = await import(`file://${nodePath}`);
    }
    const { __unstable__loadDesignSystem } = tailwindNode;

    const cssContent = fs.readFileSync(cssPath, "utf-8");
    designSystem = await __unstable__loadDesignSystem(cssContent, { base: projectRoot });

    // Improved regex to find class selectors even with pseudo-classes/nesting
    customClasses.clear();
    const classRegex = /\.([a-zA-Z0-9_-]+)(?=[:>+~ \[\{]|$)/g;
    let match;
    while ((match = classRegex.exec(cssContent)) !== null) {
      customClasses.add(match[1]);
    }
  }

  const cssValues = designSystem.candidatesToCss(candidates);
  
  return cssValues.map((value, index) => {
    if (value !== null) return value;
    if (customClasses.has(candidates[index])) return "/* custom class */";
    return null;
  });
});
