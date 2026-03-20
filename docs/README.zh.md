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
- 虚拟化的图片库和文案库，支持以 ghost-drag 的方式拖入 canvas
- 基于 `storeId` 的实例级持久化 UI 状态
- 持久化的 locale 状态，以及可覆盖的消息文案
- 主文档与 Puck iframe 之间的明暗主题同步
- 当提供 `aiHost` 时，可选启用 AI copilot 面板
- 通过 `@anvilkit/puck-studio/styles.css` 导出的编译后包样式

## 依赖要求

| Package | Version |
|---|---|
| `react` | `^19.2.4` |
| `react-dom` | `^19.2.4` |
| `@puckeditor/core` | `^0.21.1` |
| `@base-ui/react` | `^1.3.0` |

`next` 仅用于 [`../app/`](../app) 下的本地演示应用，不会被发布库中的 [`../src/`](../src) 代码直接引入。

样式说明:
根运行时入口现在会自动加载编译后的包样式。你仍然可以显式 `import "@anvilkit/puck-studio/styles.css"`，但 `import { Studio } from "@anvilkit/puck-studio"` 和 `import { puckOverrides } from "@anvilkit/puck-studio/overrides"` 已经会自动带上包样式。

## 安装

```bash
pnpm add @anvilkit/puck-studio
```

该包当前发布以下入口：

- 根入口：`@anvilkit/puck-studio`
- 仅 overrides 入口：`@anvilkit/puck-studio/overrides`
- 已废弃的兼容入口：`@anvilkit/puck-studio/legacy`
- 编译后包样式：`@anvilkit/puck-studio/styles.css`

## 推荐用法：`Studio`

`Studio` 是更高层的入口。它会挂载 `Puck`、注入 Puck 基础 CSS、创建 UI 和 i18n store、合并默认 overrides，并渲染自定义编辑器壳层。

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

### `Studio` 中最重要的 Props

| Prop | 作用 |
|---|---|
| `config`, `data`, `onPublish` | 标准 Puck 输入 |
| `onChange` | 可选的 Puck `onChange` 透传 |
| `onBack` | 可选的 header 返回按钮点击回调；提供后才会渲染返回按钮 |
| `onSaveDraft`, `isSavingDraft`, `lastSavedAt` | 把 header 中的草稿保存动作接入你的持久化流程，并允许 host 控制轻量保存状态 |
| `onOpenShare`, `onOpenCollaborators`, `onExportJson` | 允许 host 用真实的分享、协作者和导出流程替换内置次级动作 |
| `onHeaderAction` | 可选的统一编辑器壳层动作上报（`undo`、`redo`、`save-draft`、`publish`、`open-share`、`open-collaborators`、`export-json`、`toggle-theme`） |
| `isPublishing` | 发布按钮的可选加载状态 |
| `overrideExtensions` | 最后参与合并，因此你的 overrides 优先级高于包内默认值 |
| `images` | 为图片库配置 `items`、`seeds` 或分页加载 |
| `copywritings` | 为文案库配置 `items` 或分页加载 |
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

### 编辑器壳层动作

当前编辑器会把 viewport 切换和 undo/redo 放到预览区域上方的 canvas action bar 中。header 保留主题切换、协作者、保存/发布和 `More` 菜单。所有动作仍然会使用当前编辑器中的 Puck data，并且 `onHeaderAction` 仍会继续上报 undo/redo，只是它们现在位于 canvas chrome 中。

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

默认行为如下：

- `保存草稿`：如果提供了 `onSaveDraft`，则调用该回调
- `发布`：调用 `onPublish`
- `分享`：如果没有提供 `onOpenShare`，则打开内置分享弹窗
- `协作者`：如果没有提供 `onOpenCollaborators`，则打开内置协作者 popover
- `导出 JSON`：如果没有提供 `onExportJson`，则使用内置 JSON 导出逻辑

### Demo 页面覆盖范围

[`../app/page.tsx`](../app/page.tsx) 是当前 `Studio` 集成方式的实时演示页。它现在会把 `seededImageDemo`、`pagedImageDemo` 和 `pagedCopyDemo` 传给 `Studio`，同时还接入了示例 `onSaveDraft` 与 `onPublish`，因此本地页面会同时覆盖侧边栏库能力与 header 动作。

运行 `pnpm dev` 后，可以通过侧边栏验证：

- 在 seeded image 模式和 paged image 模式之间切换
- 两个库里的搜索行为
- 从 `ImageLibrary` 拖拽图片 ghost
- 从 `CopyLibrary` 拖拽文本 ghost
- `CopyLibrary` 的分类分组展示
- 在 `Studio` 中传入 `images` 与 `copywritings` 的推荐集成方式
- header 中草稿保存和发布的接线方式

## 库能力定制

### 图片库

`ImageLibrary` 现在基于 `@tanstack/react-virtual`，对现有双列网格采用按行虚拟化。无限加载统一走 `loadPage(query, page, pageSize)`，同时继续兼容原有的固定数据输入方式。

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

支持的模式：

- `items`：固定图片；会绕过内部分页逻辑，仍然是最简单的接入方式
- `seeds`：本地 demo 或轻量场景下的占位图回退方案
- `loadPage`：通过 `loadPage(query, page, pageSize)` 做分页加载
- `pageSize`：可选的内部分页大小

如果你只想提供占位图，可以传入 `seeds` 而不是 `items`：

```tsx
<Studio
  config={config}
  data={data}
  onPublish={save}
  images={{ seeds: ["brand", "product", "team", "office"] }}
/>
```

对于分页加载，建议让 loader 只负责返回当前搜索词下的一页图片。在生产环境里，通常还应该顺手做响应归一化，并在请求失败时直接抛错，这样组件可以自然显示内联错误状态：

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

`loadPage` 可以返回 `ImageItem[]`，也可以返回 `{ items, hasMore }`。如果省略 `hasMore`，组件会根据返回数量自动推断。

### 文案库

`CopyLibrary` 现在基于 `@tanstack/react-virtual` 做单列虚拟化。搜索模式会直接对扁平化后的过滤结果做虚拟化；非搜索模式会先把分类标题和文案项压平成一个渲染列表，再在保留分组展示的前提下做虚拟化。

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

支持的模式：

- `items`：固定文案片段；保持完全兼容
- `loadPage`：通过 `loadPage(query, page, pageSize)` 做分页加载
- `pageSize`：可选的内部分页大小

如果你省略 `copywritings`，则会使用内置文案片段库。

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

`loadPage` 可以返回 `CopywritingItem[]`，也可以返回 `{ items, hasMore }`。如果省略 `hasMore`，组件会根据返回数量自动推断。

### 共享滚动基础设施

[`../src/components/ui/scroll-area.tsx`](../src/components/ui/scroll-area.tsx) 现在暴露 `viewportRef`，这样虚拟列表可以绑定到真实的滚动容器，而不是外层包裹元素。这个 viewport ref 是两个侧边栏库实现虚拟化所必需的共享基础，因为它们的测量、overscan 和 load-more 判断都依赖真实的滚动容器。

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
- `drawerItem`
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

### 已废弃的兼容导出

`@anvilkit/puck-studio/legacy` 仅用于保留已废弃的单例 `uiStore` 和 `UIStore` 类型别名。

## 当前范围

- `Studio` 目前是桌面优先；在很小的屏幕上，[`EditorLayout`](../src/core/studio/layout/Layout.tsx) 会被隐藏
- 图片库和文案库是本地编辑器工具，不是资产管理后端
- 内置 share dialog 和 collaborators popover 属于壳层级便捷功能；它们可以被 host callback 替换，但并不是实时协作能力
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
