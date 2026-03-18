import { createSyncFn } from "synckit";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const tailwindWorker = createSyncFn(path.resolve(__dirname, "worker.mjs"));

const MARKERS = /^(group|peer)(\/.*)?$/;

const typoRule = {
  meta: {
    type: "problem",
    docs: { description: "Catch Tailwind v4 typos" },
    messages: { invalidClass: "Unknown Tailwind class: '{{className}}'" },
    schema: [{ type: "object", properties: { cssPath: { type: "string" } }, required: ["cssPath"] }],
  },
  create(context) {
    const { cssPath } = context.options[0];
    const absoluteCssPath = path.resolve(context.cwd, cssPath);

    return {
      JSXAttribute(node) {
        if (node.name.name !== "className" || !node.value || node.value.type !== "Literal") return;
        const classes = node.value.value.split(/\s+/).filter(Boolean);
        if (classes.length === 0) return;

        const cssValues = tailwindWorker(absoluteCssPath, classes);
        
        classes.forEach((className, index) => {
          if (cssValues[index] === null && !MARKERS.test(className)) {
            context.report({
              node: node.value,
              messageId: "invalidClass",
              data: { className },
            });
          }
        });
      },
    };
  },
};

const plugin = {
  rules: {
    "typo": typoRule,
  },
  configs: {
    recommended: (cssPath) => ({
      plugins: { "tailwind-v4": plugin },
      rules: {
        "tailwind-v4/typo": ["error", { cssPath }],
      },
    }),
  },
};

export default plugin;
