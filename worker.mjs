import { runAsWorker } from "synckit";
import fs from "node:fs";
import { resolve, dirname, join } from "node:path";
import { createRequire } from "node:module";
import { pathToFileURL } from "node:url";
import postcss from "postcss";
import selectorParser from "postcss-selector-parser";


const cache = new Map();

/**
 * Robustly load @tailwindcss/node relative to the project root.
 */
async function loadTailwindNode(projectRoot) {
  try {
    // Try standard resolution first
    return await import("@tailwindcss/node");
  } catch (e) {
    if (e.code === 'ERR_MODULE_NOT_FOUND') {
      try {
        // Try resolving from the project root's node_modules
        const localRequire = createRequire(join(projectRoot, 'package.json'));
        const nodePath = localRequire.resolve("@tailwindcss/node");
        return await import(pathToFileURL(nodePath).href);
      } catch (innerError) {
        // Fallback to manual path resolution if all else fails
        const manualPath = resolve(projectRoot, "node_modules", "@tailwindcss", "node", "dist", "index.mjs");
        if (fs.existsSync(manualPath)) {
          return await import(pathToFileURL(manualPath).href);
        }
        throw innerError;
      }
    }
    throw e;
  }
}

/**
 * Recursively find all CSS files imported via @import.
 */
function resolveDependencies(filePath, visited = new Set()) {
  if (visited.has(filePath) || !fs.existsSync(filePath)) return visited;
  visited.add(filePath);

  // Strip CSS comments to ignore @import inside them
  const content = fs.readFileSync(filePath, "utf-8").replace(/\/\*[\s\S]*?\*\//g, "");
  
  // Regex to capture @import path, supporting simple quotes, url(), and optional media queries
  const importRegex = /@import\s+(?:url\s*\()?\s*["']?([^"'\s\)]+)["']?\s*\)?\s*([^;]*);?/g;
  let match;

  while ((match = importRegex.exec(content)) !== null) {
    const importPath = match[1];
    if (importPath.startsWith("tailwindcss/")) continue;
    
    const resolvedPath = resolve(dirname(filePath), importPath.endsWith('.css') ? importPath : `${importPath}.css`);
    resolveDependencies(resolvedPath, visited);
  }

  return visited;
}

/**
 * Extract all class names from a set of CSS files using PostCSS.
 */
function extractClasses(files) {
  const classes = new Set();
  const processor = selectorParser((selectors) => {
    selectors.walkClasses((node) => {
      classes.add(node.value);
    });
  });

  for (const file of files) {
    if (!fs.existsSync(file)) continue;
    const content = fs.readFileSync(file, "utf-8");
    const root = postcss.parse(content);
    
    root.walkRules((rule) => {
      processor.processSync(rule.selector);
    });
  }
  
  return classes;
}

runAsWorker(async (cssPath, candidates) => {
  const projectRoot = process.cwd();
  const absoluteCssPath = resolve(projectRoot, cssPath);
  
  let entry = cache.get(absoluteCssPath);
  if (!entry) {
    entry = {
      designSystem: null,
      customClasses: new Set(),
      lastMtime: 0,
    };
    cache.set(absoluteCssPath, entry);
  }

  const dependencies = resolveDependencies(absoluteCssPath);
  
  let maxMtime = 0;
  for (const f of dependencies) {
    try {
      const stats = fs.statSync(f);
      if (stats.mtimeMs > maxMtime) maxMtime = stats.mtimeMs;
    } catch (e) {
      if (e.code !== 'ENOENT') throw e;
    }
  }
  if (maxMtime === 0) maxMtime = Date.now();

  if (!entry.designSystem || maxMtime > entry.lastMtime) {
    entry.lastMtime = maxMtime;
    
    const { __unstable__loadDesignSystem } = await loadTailwindNode(projectRoot);
    const cssContent = fs.readFileSync(absoluteCssPath, "utf-8");
    
    entry.designSystem = await __unstable__loadDesignSystem(cssContent, { base: dirname(absoluteCssPath) });
    entry.customClasses = extractClasses(dependencies);
  }

  const cssValues = entry.designSystem.candidatesToCss(candidates);
  
  return cssValues.map((value, index) => {
    if (value !== null) return value;
    if (entry.customClasses.has(candidates[index])) return "/* custom class */";
    return null;
  });
});
