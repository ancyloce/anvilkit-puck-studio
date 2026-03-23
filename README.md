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
- Virtualized image and copy libraries with ghost-drag into the canvas
- Per-instance persisted UI and locale state via `storeId`
- Persisted locale state plus message overrides
- Light/dark theme sync between the host document and the Puck iframe
- Optional AI copilot panel when `aiHost` is provided
- Exported compiled stylesheet in `@anvilkit/puck-studio/styles.css`

## Requirements

| Package | Version |
|---|---|
| `react` | `^19.2.4` |
| `react-dom` | `^19.2.4` |
| `@puckeditor/core` | `^0.21.1` |
| `@base-ui/react` | `^1.3.0` |

`next` is used only by the local demo app in [`app/`](./app) and is not imported from the publishable library code in [`src/`](./src).

Styles note:
The root runtime entrypoints now auto-load the compiled package stylesheet. `import "@anvilkit/puck-studio/styles.css"` is still available if you want to load the CSS explicitly, but `import { Studio } from "@anvilkit/puck-studio"` and `import { puckOverrides } from "@anvilkit/puck-studio/overrides"` already bring the package styles with them.

## Installation

```bash
pnpm add @anvilkit/puck-studio
```

The package publishes:

- root exports from `@anvilkit/puck-studio`
- overrides-only exports from `@anvilkit/puck-studio/overrides`
- deprecated compatibility exports from `@anvilkit/puck-studio/legacy`
- compiled package styles from `@anvilkit/puck-studio/styles.css`

## Recommended Usage: `Studio`

`Studio` is the higher-level entry point. It mounts `Puck`, injects Puck base CSS, creates the UI and i18n stores, merges the default overrides, and renders the custom shell.

```tsx
import { Studio } from "@anvilkit/puck-studio";

export function Editor({
  config,
  data,
  setData,
  publishPage,
  saveDraft,
  savingDraft,
  lastSavedAt,
  openShare,
}) {
  return (
    <Studio
      config={config}
      data={data}
      onChange={setData}
      onSaveDraft={saveDraft}
      isSavingDraft={savingDraft}
      lastSavedAt={lastSavedAt}
      onPublish={publishPage}
      onOpenShare={openShare}
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
| `onSaveDraft`, `isSavingDraft`, `lastSavedAt` | Wires the header draft action to your persistence flow and lets the host control lightweight save status |
| `onOpenShare`, `onOpenCollaborators`, `onExportJson` | Lets host apps replace secondary header actions with real share, collaborator, or export workflows |
| `onHeaderAction` | Optional unified callback for studio chrome action reporting (`undo`, `redo`, `save-draft`, `publish`, `open-share`, `open-collaborators`, `export-json`, `toggle-theme`) |
| `isPublishing` | Optional loading state for the publish button |
| `overrideExtensions` | Merged last, so your overrides win over the packaged defaults |
| `images` | Configures image library `items`, `seeds`, or paged loading |
| `copywritings` | Configures copy library `items` or paged loading |
| `aiHost` | Lazily loads `@puckeditor/plugin-ai` and renders its panel in the copilot tab |
| `storeId` | Namespaces persisted UI state under `anvilkit-ui-${storeId}` and locale state under `anvilkit-i18n-${storeId}` |
| `locale` | Current locale string; defaults to `"en"` |
| `messages` | Plain key/value message map used by the shell |
| `className` | Applied to the outer wrapper around `Puck` |

Merge order for overrides is:

```ts
{ ...(aiPlugin?.overrides ?? {}), ...puckOverrides, ...overrideExtensions }
```

That means consumer overrides take precedence.

### Studio Chrome

The studio keeps viewport switching plus undo/redo in a canvas action bar above the preview. The header now keeps theme toggle, collaborators, save/publish, and `More`. Every action still uses the current Puck data from the editor state, and `onHeaderAction` continues to report undo/redo even though those controls now live in the canvas chrome.

```tsx
<Studio
  config={config}
  data={data}
  onPublish={publishPage}
  onSaveDraft={saveDraft}
  isSavingDraft={savingDraft}
  lastSavedAt={draftSavedAt}
  onOpenShare={(currentData) => openShareModal(currentData)}
  onOpenCollaborators={(currentData) => openCollaboratorsPanel(currentData)}
  onExportJson={(currentData) => exportDocument(currentData)}
  onHeaderAction={(action) => {
    console.log(action.type, action.data);
  }}
/>
```

By default:

- `Save Draft` calls `onSaveDraft` when provided
- `Publish` calls `onPublish`
- `Share` opens the built-in share dialog unless `onOpenShare` is provided
- `Collaborators` opens the built-in popover unless `onOpenCollaborators` is provided
- `Export JSON` uses the built-in JSON export unless `onExportJson` is provided

### Demo App Coverage

[`app/page.tsx`](./app/page.tsx) is the live showcase for the current `Studio` integration. It now wires `seededImageDemo`, `pagedImageDemo`, and `pagedCopyDemo` into `Studio`, plus demo `onSaveDraft` and `onPublish` handlers, so the local page exercises both sidebar libraries and the shell actions together.

Use `pnpm dev` and the sidebar tabs to verify:

- switching between seeded and paged image modes
- search behavior in both libraries
- image ghost-drag from `ImageLibrary`
- text ghost-drag from `CopyLibrary`
- grouped category presentation in `CopyLibrary`
- the recommended `images` and `copywritings` integration pattern inside `Studio`
- draft save and publish wiring from the header shell

## Library Customization

### Image Library

`ImageLibrary` uses `@tanstack/react-virtual` with row-based virtualization over the existing two-column grid. Infinite loading is unified behind `loadPage(query, page, pageSize)`, while backward-compatible fixed-data inputs remain supported.

```tsx
import type { ImageItem, ImagesProps } from "@anvilkit/puck-studio";

const brandImages: ImageItem[] = [
  { id: "hero-1", src: "https://cdn.example.com/hero.jpg", alt: "Hero" },
  { id: "logo-1", src: "https://cdn.example.com/logo.png", alt: "Logo" },
];

const images: ImagesProps = { items: brandImages };

<Studio
  config={config}
  data={data}
  onPublish={save}
  images={images}
/>
```

Supported modes:

- `items`: fixed images; bypasses internal paging and remains the simplest integration
- `seeds`: placeholder-image fallback for local demos and lightweight setups
- `loadPage`: paged loading via `loadPage(query, page, pageSize)`
- `pageSize`: optional page size for internal infinite loading

If you only want placeholder images, provide `seeds` instead of `items`:

```tsx
<Studio
  config={config}
  data={data}
  onPublish={save}
  images={{ seeds: ["brand", "product", "team", "office"] }}
/>
```

For paged loading, keep the loader focused on returning the next page of images for the current search query. In production, it is usually worth normalizing the API response shape and throwing on non-OK responses so the library can surface its inline error state cleanly:

```tsx
type ImageApiResponse = {
  items: Array<{
    id: string;
    src: string;
    alt?: string;
  }>;
  nextPage?: number | null;
};

const remoteImages: ImagesProps = {
  pageSize: 24,
  loadPage: async (query, page, pageSize) => {
    const params = new URLSearchParams({
      q: query,
      page: String(page),
      pageSize: String(pageSize),
    });
    const res = await fetch(`/api/images?${params.toString()}`);

    if (!res.ok) {
      throw new Error(`Image request failed: ${res.status}`);
    }

    const json = (await res.json()) as ImageApiResponse;

    return {
      items: json.items.map((item) => ({
        id: item.id,
        src: item.src,
        alt: item.alt ?? "Image",
      })),
      hasMore: json.nextPage !== null && json.nextPage !== undefined,
    };
  },
};
```

`loadPage` may return either an array of `ImageItem` values or `{ items, hasMore }`. If `hasMore` is omitted, it is inferred from the returned page length.

### Copy Library

`CopyLibrary` uses `@tanstack/react-virtual` with single-column virtualization. Search mode virtualizes the flattened filtered snippets directly. Non-search mode preserves grouped category presentation by flattening category headers and snippet cards into one virtualized render list.

```tsx
import type { CopywritingItem, CopywritingProps } from "@anvilkit/puck-studio";

const snippets: CopywritingItem[] = [
  { category: "Headlines", label: "Promise", text: "Built for builders." },
  { category: "CTAs", label: "Primary", text: "Start for free" },
];

const copywritings: CopywritingProps = { items: snippets };

<Studio
  config={config}
  data={data}
  onPublish={save}
  copywritings={copywritings}
/>
```

Supported modes:

- `items`: fixed snippets; remains fully supported
- `loadPage`: paged loading via `loadPage(query, page, pageSize)`
- `pageSize`: optional page size for internal infinite loading

If you omit `copywritings`, the built-in snippet library is used.

```tsx
type CopyApiResponse = {
  items: Array<{
    category: string;
    label: string;
    text: string;
  }>;
  total?: number;
};

const remoteCopy: CopywritingProps = {
  pageSize: 24,
  loadPage: async (query, page, pageSize) => {
    const params = new URLSearchParams({
      q: query,
      page: String(page),
      pageSize: String(pageSize),
    });
    const res = await fetch(`/api/copy?${params.toString()}`);

    if (!res.ok) {
      throw new Error(`Copy request failed: ${res.status}`);
    }

    const json = (await res.json()) as CopyApiResponse;
    const consumed = (page + 1) * pageSize;

    return {
      items: json.items.map((item) => ({
        category: item.category,
        label: item.label,
        text: item.text,
      })),
      hasMore: json.total !== undefined ? consumed < json.total : json.items.length >= pageSize,
    };
  },
};
```

`loadPage` may return either an array of `CopywritingItem` values or `{ items, hasMore }`. If `hasMore` is omitted, it is inferred from the returned page length.

### Shared Scroll Infrastructure

[`ScrollArea`](./src/components/ui/scroll-area.tsx) now exposes a `viewportRef` prop so virtualized panels can bind `@tanstack/react-virtual` to the real scroll container instead of the outer wrapper. This viewport ref is the required shared foundation for both sidebar libraries, because their measurements, overscan, and load-more checks all depend on the actual scroll container.

## Localization

`Studio` now defaults to English UI messages because [`defaultMessages`](./src/store/i18n-defaults.ts) re-exports the English catalog. The built-in Chinese catalog is also exported at the package root as `zhMessages`.

You can switch locale and provide your own message map:

```tsx
import { Studio, zhMessages } from "@anvilkit/puck-studio";

<Studio
  config={config}
  data={data}
  onPublish={save}
  locale="zh"
  messages={zhMessages}
/>
```

Any missing message falls back to its key string at runtime.

## Using the Raw Overrides

Use `puckOverrides` when you want the styled Puck surfaces without the full `Studio` shell.

```tsx
import "@puckeditor/core/puck.css";

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
- `drawerItem`
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
- `enMessages`
- `zhMessages`

### Public types

- `StudioProps`
- `StudioActionHandler`
- `StudioHeaderAction`
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
- The built-in share dialog and collaborators popover are shell-level conveniences; they can be replaced with host callbacks, but they are not real-time collaboration features
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
