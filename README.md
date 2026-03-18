# eslint-plugin-tailwind-v4

An ESLint plugin to catch typos in Tailwind CSS v4 classes. This plugin validates your `className` strings against your actual Tailwind configuration by loading the Tailwind v4 design system directly from your CSS entry point.

## Features

- **Tailwind v4 Support**: Specifically designed for Tailwind CSS v4.
- **Real-time Validation**: Uses `@tailwindcss/node` to verify if a class is valid within your theme.
- **Flat Config Ready**: Built for modern ESLint (v9+) and Flat Config.
- **Performance**: Utilizes `synckit` to perform synchronous validation via a background worker, ensuring ESLint stays responsive.
- **Biome Compatible**: Designed to work alongside `eslint-config-biome`.

## Installation

Since this is currently a local package, you can add it to your project's `devDependencies`. If you plan to use it via `pnpm`, you can use `link:` or `file:` protocols, or publish it to a private/public registry.

```bash
pnpm add -D ./path/to/eslint-plugin-tailwind-v4
```

### Dependencies

Ensure you have the following installed in your project:

- `eslint` >= 9.0.0
- `tailwindcss` >= 4.0.0
- `synckit`

## Usage (Flat Config)

In your `eslint.config.js`, import the plugin and use the `recommended` helper. You **must** provide the path to your Tailwind CSS entry file (e.g., `./app/globals.css`).

```javascript
import { defineConfig } from "eslint/config";
import tailwindV4 from "eslint-plugin-tailwind-v4";

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

### Example Configuration with Next.js & Biome

If you are using Next.js and Biome (as mentioned in your setup), your configuration might look like this:

```javascript
import { defineConfig, globalIgnores } from "eslint/config";
import biome from "eslint-config-biome";
import nextVitals from "eslint-config-next/core-web-vitals";
import tailwindV4 from "eslint-plugin-tailwind-v4";

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

## Why this plugin?

While Biome and other tools provide excellent linting and formatting, Tailwind CSS v4 introduced significant changes to how classes are generated. This plugin ensures that any class you type actually exists in your generated CSS, preventing "silent" typos that result in missing styles.

## Configuration

The `typo` rule accepts a single option:

| Option | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `cssPath` | `string` | Yes | Path to the CSS file where `@tailwind` directives or v4 imports are defined. |

## License

MIT
