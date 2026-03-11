# @anvilkit/puck-overrides

[![npm](https://img.shields.io/npm/v/@anvilkit/puck-overrides)](https://www.npmjs.com/package/@anvilkit/puck-overrides)
[![license](https://img.shields.io/npm/l/@anvilkit/puck-overrides)](../LICENSE)
[![react](https://img.shields.io/badge/react-19-blue)](https://react.dev)
[![puck](https://img.shields.io/badge/puck-%5E0.20.2-purple)](https://puckeditor.com)

为 Puck Editor 全部 15 个覆写挂载点提供开箱即用的 Shadcn UI 替换方案，面向企业级场景，TypeScript 优先。

> English documentation: [README.md](../README.md)

---

## 简介

Puck Editor 自带的默认 UI 适合原型开发，但在企业级产品中存在明显不足：缺乏设计系统一致性、无障碍组件支持有限、也没有 Tailwind 集成。

`@anvilkit/puck-overrides` 通过一个即插即用的 `overrides` 对象解决上述问题，底层基于 Shadcn UI、Radix UI 原语和 Tailwind v4。全部 15 个覆写挂载点均已覆盖。组件已**打包**进本库，无需通过 Shadcn CLI 复制文件。

**核心价值：**

- 覆盖全部 15 个 Puck 覆写挂载点
- TypeScript 优先，完整类型推断
- 同时输出 ESM、CJS 和类型声明
- 运行时不依赖 Next.js，`next` 仅用于演示
- Radix UI 和 lucide-react 已打包，非对等依赖

---

## 安装

```bash
pnpm add @anvilkit/puck-overrides
```

> `next` 仅作为本地演示应用的开发依赖，不会出现在发布包中。

本包同时提供 ESM 和 CJS 构建产物，无需额外配置打包工具。

---

## 对等依赖

| 包 | 版本 |
|---|---|
| `react` | `>=19` |
| `react-dom` | `>=19` |
| `@puckeditor/core` | `^0.20.2` |
| `tailwindcss` | `^4` |

> Radix UI 原语和 `lucide-react` 已**打包进本库**，无需单独安装。

---

## 快速开始

### 导入样式

```ts
import "@anvilkit/puck-overrides/styles.css";
```

### 模式一：直接使用 overrides 对象

```tsx
import { puckOverrides } from "@anvilkit/puck-overrides";
import { Puck } from "@puckeditor/core";

export default function Editor({ config, data, onPublish }) {
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

### 模式二：Studio 便捷封装组件

```tsx
import { Studio } from "@anvilkit/puck-overrides";

export default function Editor({ config, data, onPublish }) {
  return (
    <Studio
      config={config}
      data={data}
      onPublish={onPublish}
    />
  );
}
```

`Studio` 是一个轻量封装，内部渲染 `<Puck overrides={puckOverrides} />`，并已自动应用正确的样式。

---

## 覆写挂载点

### 布局层

| 键名 | 组件 | 说明 |
|---|---|---|
| `header` | `EditorHeader` | 顶部工具栏外壳 |
| `headerActions` | `EditorHeader` | 注入顶部栏的操作按钮；**必须渲染 `children`** |
| `drawer` | `EditorDrawer` | 左侧面板组件列表容器 |
| `components` | `EditorDrawer` | 抽屉内的组件分组列表 |
| `outline` | `EditorOutline` | 图层树 / 页面大纲面板 |

### 画布层

| 键名 | 组件 | 说明 |
|---|---|---|
| `iframe` | `CanvasIframe` | 画布 iframe 包装器；注入 Tailwind 和 Shadcn CSS 变量 |
| `preview` | `CanvasPreview` | 拖拽预览幽灵元素 |
| `componentOverlay` | `ComponentOverlay` | 选中/悬停高亮遮罩；必须设置 `pointer-events-none` |
| `actionBar` | `ActionBar` | 每个组件的浮动操作栏（删除、复制、移动） |
| `drawerItem` | `DrawerItem` | 抽屉中的可拖拽组件卡片；**必须将所有拖拽 ref 和事件 props 转发到最外层 DOM 元素** |
| `componentItem` | `DrawerItem` | 组件条目的别名挂载点 |

### 检查器层

| 键名 | 组件 | 说明 |
|---|---|---|
| `fields` | `FieldWrapper` | 属性面板字段列表包装器 |
| `fieldLabel` | `FieldWrapper` | 单个字段标签和提示 |
| `fieldTypes` | `FieldTypesRegistry` | 全部 11 种字段类型渲染器的映射表 |
| `puckMenu` | `EditorHeader` | 顶部栏中的 Puck 菜单插槽 |

> **`headerActions` 注意事项：** 该挂载点通过 `children` 接收 Puck 内置的发布按钮。实现时必须渲染 `{children}`，否则发布按钮将消失（Puck 0.15+ 引入的行为变更）。

> **`drawerItem` 注意事项：** Puck 通过 props 传递拖拽 ref 和指针事件处理器。在根元素外额外包裹 `<div>` 会静默破坏拖拽功能。请将所有拖拽 props 直接展开到最外层 DOM 元素上。

---

## 贡献与构建

```bash
pnpm install        # 安装所有依赖
pnpm dev            # 启动 Next.js 演示应用
pnpm build          # 运行 tsup 构建到 dist/
```

构建产物位于 `dist/`：

| 文件 | 格式 |
|---|---|
| `index.js` | CJS |
| `index.mjs` | ESM |
| `index.d.ts` | TypeScript 类型声明 |

`next` 仅作为演示应用的开发依赖，不出现在 `src/` 中，也不会被打包进发布产物。

---

## 许可证

MIT
