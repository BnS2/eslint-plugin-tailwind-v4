# @bns2/eslint-plugin-tailwind-v4

An ESLint plugin to catch and prevent typos in Tailwind CSS v4 class names. This plugin validates your `className` strings against your actual Tailwind configuration by loading the Tailwind v4 design system directly from your CSS entry point.

## Features

- **Typo Detection**: Catches invalid Tailwind class names by validating them against your actual design system.
- **Custom Class Support**: Supports any custom classes defined in your CSS files (no matter if they are in `@layer` or just bare CSS).
- **Dynamic Reloading**: Automatically detects changes in your CSS files and re-validates classes without needing to restart ESLint.

> [!TIP]
> After updating to this version (v1.0.3+), we recommend restarting your IDE or ESLint server once to ensure the new worker logic is active. After that, any changes you make to your CSS file will be picked up **automatically** with no further restarts required.
- **Nativewind Support**: Tested and works seamlessly with Nativewind v5 projects.
- **Tailwind v4 Support**: Specifically designed for Tailwind CSS v4.
- **Real-time Validation**: Uses `@tailwindcss/node` to verify if a class is valid within your theme.
- **Flat Config Ready**: Built for modern ESLint (v9+) and Flat Config.
- **Performance**: Utilizes `synckit` to perform synchronous validation via a background worker, ensuring ESLint stays responsive.
- **Biome & Prettier Compatible**: Designed to work alongside `eslint-config-biome` and `prettier-plugin-tailwindcss`.

## Installation

```bash
pnpm add -D @bns2/eslint-plugin-tailwind-v4
```

### Peer Dependencies

Ensure you have the following installed in your project:

- `eslint` >= 9.0.0
- `tailwindcss` >= 4.0.0
- `@tailwindcss/node` >= 4.0.0 (Usually included with `@tailwindcss/postcss`)
- `nativewind` >= 5.0.0 (Optional, for Nativewind projects)

> [!NOTE]
> This plugin relies on `@tailwindcss/node` to load your design system. If you are using `@tailwindcss/postcss`, this is already included as a dependency. If not, you may need to install it manually.

## Usage (Flat Config)

### Standard Configuration

In your `eslint.config.js`, import the plugin and use the `recommended` helper. You **must** provide the path to your Tailwind CSS entry file (e.g., `./app/globals.css`).

```javascript
import { defineConfig } from "eslint/config";
import tailwindV4 from "@bns2/eslint-plugin-tailwind-v4";

export default defineConfig([
  // ... other configs (next, biome, etc.)
  
  // Initialize the plugin with your CSS entry point
  tailwindV4.configs.recommended("./app/globals.css"),
  
  {
    rules: {
      // You can also customize the rule directly
      "tailwind-v4/typo": ["error", { cssPath: "./app/globals.css" }],
    },
  },
]);
```

### Expo / Nativewind v5 Configuration

If you are using Expo with Nativewind v5, your `eslint.config.mjs` might look like this:

```javascript
import expoConfig from "eslint-config-expo/flat.js";
import tailwindV4 from "@bns2/eslint-plugin-tailwind-v4";

/** @type {import('eslint').Linter.Config[]} */
export default [
  ...expoConfig,
  {
    ignores: ["dist/*", ".expo/*"],
  },
  {
    files: ["**/*.{js,jsx,ts,tsx}"],
    plugins: {
      "tailwind-v4": tailwindV4,
    },
    rules: {
      "tailwind-v4/typo": ["error", { cssPath: "./global.css" }],
    },
  },
];
```

### Example Configuration with Next.js & Biome

If you are using Next.js and Biome (as mentioned in your setup), your configuration might look like this:

```javascript
import { defineConfig, globalIgnores } from "eslint/config";
import biome from "eslint-config-biome";
import nextVitals from "eslint-config-next/core-web-vitals";
import tailwindV4 from "@bns2/eslint-plugin-tailwind-v4";

export default defineConfig([
  ...nextVitals,
  biome,
  tailwindV4.configs.recommended("./app/globals.css"),
  {
    rules: {
      // Your custom rules
    },
  },
  globalIgnores([".next/**", "out/**"]),
]);
```

## Recommended Complementary Plugins

For the best Tailwind CSS v4 experience, we recommend using this plugin alongside:

- **[prettier-plugin-tailwindcss](https://github.com/tailwindlabs/prettier-plugin-tailwindcss)**: Automatically sorts your classes according to the recommended order.
- **[eslint-plugin-tailwind-canonical-classes](https://github.com/m-mizutani/eslint-plugin-tailwind-canonical-classes)**: Ensures your classes are canonical, sorted, and non-redundant.

### The "Pro" Setup

While `prettier-plugin-tailwindcss` and `eslint-plugin-tailwind-canonical-classes` handle organization and consistency, this plugin (`@bns2/eslint-plugin-tailwind-v4`) handles **validity**. Using them together ensures your classes are both valid and well-organized.

```javascript
// eslint.config.js
import { defineConfig } from "eslint/config";
import tailwindV4 from "@bns2/eslint-plugin-tailwind-v4";
import tailwindCanonical from "eslint-plugin-tailwind-canonical-classes";

export default defineConfig([
  // 1. Organization & Sorting
  ...tailwindCanonical.configs["flat/recommended"],
  
  // 2. Validity & Typo Detection
  tailwindV4.configs.recommended("./app/globals.css"),

  {
    rules: {
      "tailwind-canonical-classes/tailwind-canonical-classes": [
        "warn",
        { cssPath: "./app/globals.css" },
      ],
    },
  },
]);
```

```json
{
  "semi": true,
  "singleQuote": false,
  "tabWidth": 2,
  "trailingComma": "all",
  "printWidth": 120,
  "plugins": ["prettier-plugin-tailwindcss"],
  "tailwindStylesheet": "./global.css"
}
```

## Why this plugin?

While Biome and other tools provide excellent linting and formatting, Tailwind CSS v4 introduced significant changes to how classes are generated. This plugin ensures that any class you type actually exists in your generated CSS, preventing "silent" typos that result in missing styles.

## Configuration

The `typo` rule accepts a single option:

| Option | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `cssPath` | `string` | Yes | Path to the CSS file where `@tailwind` directives or v4 imports are defined. |

## Contributing

Please see our [Contributing Guide](CONTRIBUTING.md) for more details.

## License

MIT
