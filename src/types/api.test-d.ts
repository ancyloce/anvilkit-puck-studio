/**
 * Type-level tests for the public API surface of @anvilkit/puck-studio.
 * Run with: pnpm tsd  (or: npx tsd)
 *
 * These tests lock the shape of every exported type so accidental removals
 * or renames are caught at CI time without needing a runtime test.
 */
import {
  expectType,
  expectAssignable,
  expectNotAssignable,
} from "tsd";
import type { MouseEventHandler } from "react";

import type {
  StudioProps,
  ImagesProps,
  ImageItem,
  CopywritingProps,
  CopywritingItem,
  EditorUiStore,
  EditorUiStoreApi,
  ActiveTab,
  EditorI18nStoreApi,
  Locale,
  Messages,
} from "../index";

// ─── StudioProps ─────────────────────────────────────────────────────────────
declare const studioProps: StudioProps;
expectType<string | undefined>(studioProps.storeId);
expectType<string | undefined>(studioProps.aiHost);
expectType<ImagesProps | undefined>(studioProps.images);
expectType<CopywritingProps | undefined>(studioProps.copywritings);
expectType<Locale | undefined>(studioProps.locale);
expectType<Messages | undefined>(studioProps.messages);
expectType<MouseEventHandler<HTMLButtonElement> | undefined>(studioProps.onBack);

// ─── ImageItem ───────────────────────────────────────────────────────────────
declare const imageItem: ImageItem;
expectType<string>(imageItem.id);
expectType<string>(imageItem.src);
expectType<string>(imageItem.alt);

declare const imagesProps: ImagesProps;
expectType<number | undefined>(imagesProps.pageSize);
expectType<ImagesProps["loadPage"] | undefined>(imagesProps.loadPage);

const imageLoadPage: NonNullable<ImagesProps["loadPage"]> = async (
  query,
  page,
  pageSize,
) => {
  expectType<string>(query);
  expectType<number>(page);
  expectType<number>(pageSize);

  return { items: [imageItem], hasMore: false };
};

expectAssignable<NonNullable<ImagesProps["loadPage"]>>(imageLoadPage);

// ─── CopywritingItem ─────────────────────────────────────────────────────────
declare const copyItem: CopywritingItem;
expectType<string>(copyItem.label);
expectType<string>(copyItem.text);
expectType<string>(copyItem.category);

// ─── ActiveTab union ─────────────────────────────────────────────────────────
expectAssignable<ActiveTab>("insert");
expectAssignable<ActiveTab>("layer");
expectAssignable<ActiveTab>("image");
expectAssignable<ActiveTab>("text");
expectAssignable<ActiveTab>("copilot");
expectNotAssignable<ActiveTab>("unknown-tab");

// ─── EditorUiStore shape ─────────────────────────────────────────────────────
declare const uiStore: EditorUiStore;
declare const uiStoreApi: EditorUiStoreApi;
declare const i18nStoreApi: EditorI18nStoreApi;
expectType<ActiveTab>(uiStore.activeTab);
expectType<"light" | "dark">(uiStore.theme);
expectType<string>(uiStore.drawerSearch);
expectType<EditorUiStore>(uiStoreApi.getState());
expectType<Locale>(i18nStoreApi.getState().locale);

// ─── Locale ──────────────────────────────────────────────────────────────────
expectAssignable<Locale>("en");
expectAssignable<Locale>("zh");
