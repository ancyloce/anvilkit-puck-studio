# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Snapshot

- Publishable library code lives in [`src/`](./src)
- The local demo app lives in [`app/`](./app)
- `Studio` is a Puck wrapper plus an opinionated desktop shell, not just an overrides object
- `puckOverrides` styles core Puck surfaces, while `Header` and `Aside` live outside Puck in the shell
- Default UI messages are English
- `uiStore` and the `legacy` entrypoint exist only for backward compatibility

Hard constraint:
Nothing in `src/` may import from `next`. Keep Next.js usage in `app/` only.

## Current Repo Layout

| Path | Role |
|---|---|
| `src/index.ts` | Canonical public API |
| `src/index.legacy.ts` | Deprecated compatibility exports |
| `src/types/public.ts` | Stable public type surface |
| `src/core/studio/Studio.tsx` | Main `Studio` wrapper |
| `src/core/studio/layout/Layout.tsx` | Desktop shell composition |
| `src/core/studio/layout/header/*` | Header chrome, share UI, collaborators UI |
| `src/core/studio/layout/sidebar/*` | Aside tabs plus image/copy libraries |
| `src/core/overrides/index.tsx` | Packaged `puckOverrides` object |
| `src/core/overrides/layout/*` | Drawer, outline, component item overrides |
| `src/core/overrides/canvas/*` | Preview, iframe bridge, overlay, action bar |
| `src/core/overrides/fields/*` | Field wrapper plus field type registry |
| `src/features/library-dnd/*` | Typed drag/drop contract and pure prop replacement helpers |
| `src/features/theme/useThemeSync.ts` | Theme sync for host document and iframe |
| `src/hooks/*` | Shared React hooks (canvas zoom sync, drop bridge, auto-height, studio action reporting) |
| `src/lib/*` | Utility modules (canvas positioning, drop targets, zoom math, viewport config, Puck selector, strict context helper) |
| `src/store/*` | UI store, i18n store, providers, and hooks |
| `src/components/ui/*` | Base UI wrappers and shared primitives |
| `src/components/ui/scroll-area.tsx` | Shared scroll wrapper; exposes `viewportRef` for virtualized panels |
| `app/page.tsx` | Demo editor page with showcase `images` and `copywritings` data |
| `app/globals.css` | Demo Tailwind setup and tokens |

## Public API

Root exports from [`src/index.ts`](./src/index.ts):

- `Studio`
- `puckOverrides`
- `createEditorUiStore`
- `createEditorI18nStore`
- `EditorUiStoreProvider`
- `EditorI18nStoreProvider`
- `useEditorUiStoreApi`
- `useEditorI18nStoreApi`
- `defaultMessages`

Public types re-exported from [`src/types/public.ts`](./src/types/public.ts):

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

Compatibility exports:

- `@anvilkit/puck-studio/legacy` exposes deprecated `uiStore` and `UIStore`

Contributor rule:
If you add or remove anything from the public API, update [`src/types/api.test-d.ts`](./src/types/api.test-d.ts).

Current public library prop surfaces to keep in sync:

- `StudioProps`: `onSaveDraft`, `isSavingDraft`, `lastSavedAt`, `isPublishing`, `onOpenShare`, `onOpenCollaborators`, `onExportJson`, `onHeaderAction`
- `ImagesProps`: `items`, `seeds`, `loadPage`, `pageSize`
- `CopywritingProps`: `items`, `loadPage`, `pageSize`

## Runtime Architecture

`Studio` currently does the following:

1. Creates a persisted UI store with `createEditorUiStore(storeId ?? "default")`
2. Creates a persisted i18n store with `createEditorI18nStore({ locale, messages, storeId })`
3. Lazily imports `@puckeditor/plugin-ai` only when `aiHost` is set — it is an `optionalDependency`; if not installed the import fails silently and the AI panel is skipped
4. Merges overrides in this order:
   `{ ...(aiPlugin?.overrides ?? {}), ...puckOverrides, ...overrideExtensions }`
5. Renders `Puck` with [`EditorLayout`](./src/core/studio/layout/Layout.tsx) as children

High-level flow:

```text
Studio
  -> UI/i18n providers
  -> Puck
     -> merged overrides
     -> optional AI plugin
     -> EditorLayout
        -> Header
        -> Aside
        -> left panel content by active tab
        -> Puck.Preview
        -> Puck.Fields
```

Important distinction:

- `Header` and `Aside` are shell components owned by `Studio`
- `puckOverrides` currently covers only Puck override keys

## Override Coverage

[`puckOverrides`](./src/core/overrides/index.tsx) currently wires:

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

Notes:

- `fieldLabel` exists internally in [`src/core/overrides/fields/FieldWrapper.tsx`](./src/core/overrides/fields/FieldWrapper.tsx) but is not currently included in `puckOverrides`
- `puck` is just a pass-through root slot
- `Header` is not implemented as a Puck `header` or `headerActions` override

## State, Persistence, and i18n

UI store in [`src/store/editor-ui/`](./src/store/editor-ui/):

- Active tabs: `insert`, `layer`, `image`, `text`, `copilot`
- Persists `activeTab`, `drawerCollapsed`, `outlineExpanded`, and `theme`
- Does not persist `drawerSearch`
- Uses localStorage key `anvilkit-ui-${storeId}`

i18n store in [`src/store/editor-i18n/`](./src/store/editor-i18n/):

- Persists only `locale`
- Replaces `messages` from props on mount/update
- Uses localStorage key `anvilkit-i18n-${storeId}`

Important nuance:
`storeId` namespaces both the UI store and the i18n store.

Default messages:

- [`src/store/editor-i18n/default-messages.ts`](./src/store/editor-i18n/default-messages.ts) re-exports the English catalog
- [`enMessages`](./src/index.ts) re-exports the English catalog from [`src/i18n/en.ts`](./src/i18n/en.ts)
- [`zhMessages`](./src/index.ts) re-exports the Chinese catalog from [`src/i18n/zh.ts`](./src/i18n/zh.ts)
- If you add or rename a message key, update both [`src/i18n/zh.ts`](./src/i18n/zh.ts) and [`src/i18n/en.ts`](./src/i18n/en.ts)

## Drag-and-Drop Contract

The image and copy libraries do not talk to the canvas directly. They use typed `window` events from [`src/features/library-dnd/drop-contract.ts`](./src/features/library-dnd/drop-contract.ts):

- `anvilkit:librarydragstart`
- `anvilkit:imagedrop`
- `anvilkit:textdrop`

Flow:

1. [`useGhostDrag`](./src/features/library-dnd/useGhostDrag.ts) creates the floating ghost element and dispatches typed events
2. [`CanvasIframe`](./src/core/overrides/canvas/CanvasIframe.tsx) installs [`useCanvasLibraryDropBridge`](./src/hooks/use-canvas-library-drop-bridge.ts)
3. The bridge hit-tests inside the iframe, highlights eligible targets, and dispatches Puck `replace` actions
4. [`replace-props.ts`](./src/features/library-dnd/replace-props.ts) performs pure image/text replacement heuristics

Testing:

- Runtime tests for replacement heuristics live in [`src/features/library-dnd/replace-props.test.ts`](./src/features/library-dnd/replace-props.test.ts)

## Sidebar Library Guidance

The sidebar libraries are editor-local tooling that live inside a shared `ScrollArea`. The current implementation direction is intentional and should stay consistent unless there is a strong architectural reason to change it.

- Use `@tanstack/react-virtual` for long sidebar lists. It fits the current sidebar architecture because the panels are fixed-width, editor-local surfaces that need predictable scroll ownership, drag behavior, and small DOM size at the same time.
- `ImageLibrary` uses row-based virtualization for the two-column grid. Infinite loading should continue to flow through `loadPage(query, page, pageSize)`.
- `CopyLibrary` uses single-column virtualization over one flattened render list. Search mode virtualizes filtered snippets directly; non-search mode flattens category headers and snippet items together so grouping is preserved.
- Preserve backward compatibility when changing these panels: `ImageLibrary` still supports `items` and `seeds`, and `CopyLibrary` still supports `items`.
- `src/components/ui/scroll-area.tsx` exposes `viewportRef`; virtualizers must bind to that viewport element, not the outer root wrapper. This is a required foundation for both libraries, or measurements and load-more triggers will drift.
- Keep `useGhostDrag` and the existing drag/drop event contract intact when refactoring the libraries.
- If you change `ImagesProps`, `CopywritingProps`, or public exports, update [`README.md`](./README.md), [`docs/README.zh.md`](./docs/README.zh.md), [`app/page.tsx`](./app/page.tsx), and [`src/types/api.test-d.ts`](./src/types/api.test-d.ts) in the same change.

## Theme Sync

[`useThemeSync`](./src/features/theme/useThemeSync.ts) is the single source of truth for theme application:

- Toggles `.dark` on the host document
- Optionally injects lightweight canvas CSS into the iframe document
- Is called from both the shell header and the iframe override

If you change theme behavior, verify both the host UI and the canvas iframe.

## Base UI Rules

This repo uses `@base-ui/react`, not Radix UI.

Key differences to remember:

- Prefer Base UI's `render` prop when composing triggers and buttons
- `nativeButton={false}` is required when the rendered trigger is not a native `button`
- `Select.onValueChange` receives `string | null`
- `CommandInput` uses `onValueChange`, not `onChange`
- `CommandItem` uses `onSelect`, not `onClick`

Tooltip special case:

- [`src/components/ui/tooltip.tsx`](./src/components/ui/tooltip.tsx) includes a compatibility wrapper that accepts `asChild`
- Internally it rewrites `asChild` to Base UI `render` so existing call sites do not create nested `button` elements
- If you touch tooltip composition, guard against `button > button` hydration errors

## Shell and Override Gotchas

- [`src/core/studio/layout/Layout.tsx`](./src/core/studio/layout/Layout.tsx) is desktop-first and hidden on very small screens via `max-sm:hidden`
- [`src/core/overrides/layout/EditorDrawer.tsx`](./src/core/overrides/layout/EditorDrawer.tsx) flattens Puck's drawer markup with `display: contents`; seemingly harmless wrapper changes can break the grid
- [`src/core/overrides/canvas/ComponentOverlay.tsx`](./src/core/overrides/canvas/ComponentOverlay.tsx) must remain `pointer-events-none`
- [`src/core/overrides/canvas/CanvasPreview.tsx`](./src/core/overrides/canvas/CanvasPreview.tsx) is intentionally lightweight
- [`app/page.tsx`](./app/page.tsx) is the live showcase for the recommended `Studio` integration path; keep its seeded/paged image modes, paged copy data, and draft/publish handlers rich enough to exercise search, drag behavior, copy grouping, and shell wiring
- [`src/core/studio/layout/sidebar/library/ImageLibrary.tsx`](./src/core/studio/layout/sidebar/library/ImageLibrary.tsx) and [`src/core/studio/layout/sidebar/library/CopyLibrary.tsx`](./src/core/studio/layout/sidebar/library/CopyLibrary.tsx) are local tooling, not external data integrations

## Known Gaps In The Current Implementation

Be careful not to document or rely on these as finished features:

- `StudioProps.ui` and `StudioProps.onAction` are declared in [`src/core/studio/Studio.tsx`](./src/core/studio/Studio.tsx) but are not currently used
- The built-in share dialog and collaborators popover are shell conveniences, not real-time collaboration or permission-management features

If you change any of the above, update both docs and type tests.

## Build, Test, and Lint

```bash
pnpm dev
pnpm lint
pnpm test
pnpm test:types
pnpm build
```

To run a single test file or pattern:

```bash
pnpm test src/features/library-dnd/replace-props.test.ts
```

Command meanings:

- `pnpm dev`: runs the Next.js demo app
- `pnpm lint`: `tsc --noEmit && eslint src`
- `pnpm test`: Vitest runtime tests
- `pnpm test:types`: `tsd` checks for the public API
- `pnpm build`: `tsup` build for root, legacy, overrides, and CSS entries

Build notes:

- `src/` is what matters for the published package
- `app/` is excluded from the library TypeScript build
- `tsup` currently emits ESM `.js`, CJS `.cjs`, CSS, and `.d.ts` files into `dist/`
- Keep `package.json` export paths aligned with the actual `dist/` filenames

## Contributor Conventions

- Import shared consumer-facing types through [`src/types/public.ts`](./src/types/public.ts)
- Respect the ESLint guardrails in [`eslint.config.mjs`](./eslint.config.mjs)
- Use the `@/` alias inside `src/`
- Keep `src/index.ts` as the canonical public surface
- When changing i18n or persistence behavior, think about migration and backwards compatibility
- Keep docs, examples, and public type tests in sync whenever library props, demo wiring, or exported types change
