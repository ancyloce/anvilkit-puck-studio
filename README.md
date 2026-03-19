# @anvilkit/puck-studio

[![npm](https://img.shields.io/npm/v/@anvilkit/puck-studio)](https://www.npmjs.com/package/@anvilkit/puck-studio)
[![license](https://img.shields.io/npm/l/@anvilkit/puck-studio)](https://www.npmjs.com/package/@anvilkit/puck-studio)
[![react](https://img.shields.io/badge/react-19-blue)](https://react.dev)
[![puck](https://img.shields.io/badge/puck-%5E0.21.1-purple)](https://puckeditor.com)

Opinionated Puck editor chrome and override pack built with React 19, `@base-ui/react`, and Tailwind v4.

> Chinese reference: [docs/README.zh.md](./docs/README.zh.md). This README is the canonical, up-to-date guide for the current implementation.

## What This Package Gives You

- `Studio`: a desktop editor shell around `<Puck />` with a custom header, left sidebar, preview area, and fields panel
- `puckOverrides`: a packaged set of Puck overrides for drawer, outline, preview, canvas, and fields surfaces
- Image and copy libraries with ghost-drag into the canvas
- Per-instance persisted UI state via `storeId`
- Persisted locale state plus message overrides
- Light/dark theme sync between the host document and the Puck iframe
- Optional AI copilot panel when `aiHost` is provided
- Exported CSS tokens in `@anvilkit/puck-studio/styles.css`

## Requirements

| Package | Version |
|---|---|
| `react` | `^19.2.4` |
| `react-dom` | `^19.2.4` |
| `@puckeditor/core` | `^0.21.1` |
| `@base-ui/react` | `^1.3.0` |
| `tailwindcss` | `^4.2.1` |

`next` is used only by the local demo app in [`app/`](./app) and is not imported from the publishable library code in [`src/`](./src).

Tailwind note:
This package exports design tokens and class names, not a standalone compiled utility bundle. Your app still needs Tailwind v4 configured. If your Tailwind setup does not scan dependency code automatically, include this package in the sources Tailwind reads.

## Installation

```bash
pnpm add @anvilkit/puck-studio
```

The package publishes:

- root exports from `@anvilkit/puck-studio`
- overrides-only exports from `@anvilkit/puck-studio/overrides`
- deprecated compatibility exports from `@anvilkit/puck-studio/legacy`
- design tokens from `@anvilkit/puck-studio/styles.css`

## Recommended Usage: `Studio`

`Studio` is the higher-level entry point. It mounts `Puck`, injects Puck base CSS, creates the UI and i18n stores, merges the default overrides, and renders the custom shell.

```tsx
import "@anvilkit/puck-studio/styles.css";
import { Studio } from "@anvilkit/puck-studio";

export function Editor({ config, data, setData, save }) {
  return (
    <Studio
      config={config}
      data={data}
      onChange={setData}
      onPublish={save}
      className="h-screen"
      storeId="marketing-home"
    />
  );
}
```

### `Studio` Props That Matter Most

| Prop | What it does |
|---|---|
| `config`, `data`, `onPublish` | Standard Puck inputs |
| `onChange` | Optional Puck `onChange` passthrough |
| `onBack` | Optional header back-button click handler; when provided, the back button is rendered |
| `overrideExtensions` | Merged last, so your overrides win over the packaged defaults |
| `images` | Seeds or fixed items for the image library |
| `copywritings` | Fixed snippets for the copy library |
| `aiHost` | Lazily loads `@puckeditor/plugin-ai` and renders its panel in the copilot tab |
| `storeId` | Namespaces persisted UI state under `anvilkit-ui-${storeId}` |
| `locale` | Current locale string; defaults to `"zh"` |
| `messages` | Plain key/value message map used by the shell |
| `className` | Applied to the outer wrapper around `Puck` |

Merge order for overrides is:

```ts
{ ...(aiPlugin?.overrides ?? {}), ...puckOverrides, ...overrideExtensions }
```

That means consumer overrides take precedence.

## Library Customization

### Image Library

```tsx
import type { ImageItem } from "@anvilkit/puck-studio";

const brandImages: ImageItem[] = [
  { id: "hero-1", src: "https://cdn.example.com/hero.jpg", alt: "Hero" },
  { id: "logo-1", src: "https://cdn.example.com/logo.png", alt: "Logo" },
];

<Studio
  config={config}
  data={data}
  onPublish={save}
  images={{ items: brandImages }}
/>
```

If you only want placeholder images, provide `seeds` instead of `items`:

```tsx
<Studio
  config={config}
  data={data}
  onPublish={save}
  images={{ seeds: ["brand", "product", "team", "office"] }}
/>
```

### Copy Library

```tsx
import type { CopywritingItem } from "@anvilkit/puck-studio";

const snippets: CopywritingItem[] = [
  { category: "Headlines", label: "Promise", text: "Built for builders." },
  { category: "CTAs", label: "Primary", text: "Start for free" },
];

<Studio
  config={config}
  data={data}
  onPublish={save}
  copywritings={{ items: snippets }}
/>
```

If you omit `copywritings`, the built-in snippet library is used.

## Localization

`Studio` defaults to Chinese UI messages because [`defaultMessages`](./src/store/i18n-defaults.ts) re-exports the Chinese catalog.

You can switch locale and provide your own message map:

```tsx
<Studio
  config={config}
  data={data}
  onPublish={save}
  locale="en"
  messages={{
    "header.publish": "Publish",
    "header.undo": "Undo",
    "header.redo": "Redo",
  }}
/>
```

Any missing message falls back to its key string at runtime.

## Using the Raw Overrides

Use `puckOverrides` when you want the styled Puck surfaces without the full `Studio` shell.

```tsx
import "@puckeditor/core/puck.css";
import "@anvilkit/puck-studio/styles.css";

import { Puck } from "@puckeditor/core";
import { puckOverrides } from "@anvilkit/puck-studio";

export function Editor({ config, data, onPublish }) {
  return (
    <Puck
      config={config}
      data={data}
      onPublish={onPublish}
      overrides={puckOverrides}
    />
  );
}
```

The packaged override object currently wires these Puck keys:

- `drawer`
- `components`
- `drawerItem`
- `componentItem`
- `outline`
- `iframe`
- `preview`
- `componentOverlay`
- `actionBar`
- `fields`
- `fieldTypes`
- `puck`

`Studio` adds the surrounding header, sidebar, image library, copy library, and fields layout on top of that.

## Architecture At A Glance

```text
Studio
  -> EditorUiStoreProvider
  -> EditorI18nStoreProvider
  -> Puck
     -> merged overrides
     -> optional AI plugin
     -> EditorLayout
        -> Header
        -> Aside
        -> Puck.Components / Puck.Outline / ImageLibrary / CopyLibrary / aiPanel
        -> Puck.Preview
        -> Puck.Fields
```

The drag-drop libraries communicate with the canvas through typed `window` events defined in [`src/features/library-dnd/drop-contract.ts`](./src/features/library-dnd/drop-contract.ts). The iframe bridge listens for those events, hit-tests the hovered component, and dispatches Puck `replace` actions with updated props.

## Public API Summary

### Runtime exports

- `Studio`
- `puckOverrides`
- `createEditorUiStore`
- `createEditorI18nStore`
- `EditorUiStoreProvider`
- `EditorI18nStoreProvider`
- `useEditorUiStoreApi`
- `useEditorI18nStoreApi`
- `defaultMessages`

### Public types

- `StudioProps`
- `ImagesProps`
- `ImageItem`
- `CopywritingProps`
- `CopywritingItem`
- `EditorUiStore`
- `EditorUiStoreApi`
- `ActiveTab`
- `EditorI18nStoreApi`
- `Locale`
- `Messages`

### Deprecated compatibility exports

`@anvilkit/puck-studio/legacy` exists only for the deprecated singleton `uiStore` and `UIStore` type alias.

## Current Scope

- `Studio` is desktop-first today; [`EditorLayout`](./src/core/studio/layout/Layout.tsx) is hidden on very small screens
- The image and copy libraries are local editor tooling, not asset management backends
- The share and collaborators popovers in the header are presentational shell UI, not real-time collaboration features
- If you need fully custom publish, share, or shell-level workflows, build on `puckOverrides` directly or fork `Studio`

## Development

```bash
pnpm install
pnpm dev
pnpm lint
pnpm test
pnpm test:types
pnpm build
```

Useful directories:

- [`src/core/studio`](./src/core/studio): `Studio` and the shell layout
- [`src/core/overrides`](./src/core/overrides): packaged Puck overrides
- [`src/features/library-dnd`](./src/features/library-dnd): drag/drop protocol and prop replacement helpers
- [`src/store`](./src/store): UI and i18n stores, providers, hooks
- [`app`](./app): local Next.js demo only

Build output is generated in [`dist/`](./dist) as ESM `.js`, CJS `.cjs`, CSS, and type declaration files.
