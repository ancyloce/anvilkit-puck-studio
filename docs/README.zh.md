# @anvilkit/puck-studio

[![npm](https://img.shields.io/npm/v/@anvilkit/puck-studio)](https://www.npmjs.com/package/@anvilkit/puck-studio)
[![license](https://img.shields.io/npm/l/@anvilkit/puck-studio)](https://www.npmjs.com/package/@anvilkit/puck-studio)
[![react](https://img.shields.io/badge/react-19-blue)](https://react.dev)
[![puck](https://img.shields.io/badge/puck-%5E0.21.1-purple)](https://puckeditor.com)

这是一个基于 React 19、`@base-ui/react` 和 Tailwind v4 构建的、带有明确产品化取向的 Puck 编辑器外壳与覆盖层组件包。

> 英文版请见 [../README.md](../README.md)。英文 README 是当前实现的规范说明，并始终保持最新。

## 这个包提供了什么

- `Studio`：围绕 `<Puck />` 封装的桌面端编辑器壳层，包含自定义头部、左侧边栏、预览区和字段面板
- `puckOverrides`：一组打包好的 Puck overrides，覆盖 drawer、outline、preview、canvas 和 fields 等界面
- 图片库和文案库，支持以 ghost-drag 的方式拖入 canvas
- 基于 `storeId` 的实例级持久化 UI 状态
- 持久化的 locale 状态，以及可覆盖的消息文案
- 主文档与 Puck iframe 之间的明暗主题同步
- 当提供 `aiHost` 时，可选启用 AI copilot 面板
- 通过 `@anvilkit/puck-studio/styles.css` 导出的 CSS design tokens

## 依赖要求

| Package | Version |
|---|---|
| `react` | `^19.2.4` |
| `react-dom` | `^19.2.4` |
| `@puckeditor/core` | `^0.21.1` |
| `@base-ui/react` | `^1.3.0` |
| `tailwindcss` | `^4.2.1` |

`next` 仅用于 [`../app/`](../app) 下的本地演示应用，不会被发布库中的 [`../src/`](../src) 代码直接引入。

Tailwind 说明:
这个包导出的是设计 token 和 class name，并不是一份独立编译好的 utilities 样式包。你的应用仍然需要正确配置 Tailwind v4。如果当前 Tailwind 配置不会自动扫描依赖代码，请把本包加入 Tailwind 的扫描源中。

## 安装

```bash
pnpm add @anvilkit/puck-studio
```

该包当前发布以下入口：

- 根入口：`@anvilkit/puck-studio`
- 仅 overrides 入口：`@anvilkit/puck-studio/overrides`
- 已废弃的兼容入口：`@anvilkit/puck-studio/legacy`
- design tokens：`@anvilkit/puck-studio/styles.css`

## 推荐用法：`Studio`

`Studio` 是更高层的入口。它会挂载 `Puck`、注入 Puck 基础 CSS、创建 UI 和 i18n store、合并默认 overrides，并渲染自定义编辑器壳层。

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

### `Studio` 中最重要的 Props

| Prop | 作用 |
|---|---|
| `config`, `data`, `onPublish` | 标准 Puck 输入 |
| `onChange` | 可选的 Puck `onChange` 透传 |
| `overrideExtensions` | 最后参与合并，因此你的 overrides 优先级高于包内默认值 |
| `images` | 为图片库提供初始项或固定项 |
| `copywritings` | 为文案库提供固定片段 |
| `aiHost` | 懒加载 `@puckeditor/plugin-ai`，并在 copilot tab 中渲染其面板 |
| `storeId` | 将持久化 UI 状态命名为 `anvilkit-ui-${storeId}` |
| `locale` | 当前语言；默认是 `"zh"` |
| `messages` | 供壳层使用的普通 key/value 消息表 |
| `className` | 应用于 `Puck` 外层包裹元素 |

overrides 的合并顺序是：

```ts
{ ...(aiPlugin?.overrides ?? {}), ...puckOverrides, ...overrideExtensions }
```

这意味着 consumer 传入的 overrides 拥有最高优先级。

## 库能力定制

### 图片库

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

如果你只想提供占位图，可以传入 `seeds` 而不是 `items`：

```tsx
<Studio
  config={config}
  data={data}
  onPublish={save}
  images={{ seeds: ["brand", "product", "team", "office"] }}
/>
```

### 文案库

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

如果你省略 `copywritings`，则会使用内置文案片段库。

## 本地化

`Studio` 默认使用中文 UI 文案，因为 [`defaultMessages`](../src/store/i18n-defaults.ts) 直接 re-export 了中文消息目录。

你也可以切换 locale 并传入自定义消息表：

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

运行时如果某条消息缺失，会回退为它自身的 key 字符串。

## 直接使用原始 Overrides

如果你只想要带样式的 Puck 表面组件，而不需要完整的 `Studio` 壳层，可以直接使用 `puckOverrides`。

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

当前打包导出的 override 对象接入了这些 Puck key：

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

`Studio` 会在此基础上再加上 header、sidebar、image library、copy library 和 fields layout。

## 架构速览

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

拖拽库通过定义在 [`../src/features/library-dnd/drop-contract.ts`](../src/features/library-dnd/drop-contract.ts) 中的类型化 `window` 事件与 canvas 通信。iframe bridge 会监听这些事件，对当前 hover 的组件做 hit-test，然后派发 Puck `replace` action，并带上更新后的 props。

## 公共 API 摘要

### 运行时导出

- `Studio`
- `puckOverrides`
- `createEditorUiStore`
- `createEditorI18nStore`
- `EditorUiStoreProvider`
- `EditorI18nStoreProvider`
- `useEditorUiStoreApi`
- `useEditorI18nStoreApi`
- `defaultMessages`

### 公共类型

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

### 已废弃的兼容导出

`@anvilkit/puck-studio/legacy` 仅用于保留已废弃的单例 `uiStore` 和 `UIStore` 类型别名。

## 当前范围

- `Studio` 目前是桌面优先；在很小的屏幕上，[`EditorLayout`](../src/core/studio/layout/Layout.tsx) 会被隐藏
- 图片库和文案库是本地编辑器工具，不是资产管理后端
- header 中的 share 和 collaborators popover 只是展示型壳层 UI，不是实时协作功能
- 如果你需要完全自定义的 publish、share 或壳层级工作流，请直接基于 `puckOverrides` 构建，或者 fork `Studio`

## 开发

```bash
pnpm install
pnpm dev
pnpm lint
pnpm test
pnpm test:types
pnpm build
```

常用目录：

- [`../src/core/studio`](../src/core/studio)：`Studio` 及其壳层布局
- [`../src/core/overrides`](../src/core/overrides)：打包提供的 Puck overrides
- [`../src/features/library-dnd`](../src/features/library-dnd)：拖拽协议与 prop 替换辅助函数
- [`../src/store`](../src/store)：UI 和 i18n store、providers、hooks
- [`../app`](../app)：仅本地 Next.js 演示应用

构建产物会生成到 [`../dist/`](../dist)，包括 ESM `.js`、CJS `.cjs`、CSS 和类型声明文件。
