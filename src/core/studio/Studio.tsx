"use client";
import * as React from "react";
import { Puck } from "@puckeditor/core";
import type { Config, Data, Overrides, UiState } from "@puckeditor/core";
import "@puckeditor/core/puck.css";

import { puckOverrides } from "@/core/overrides";
import {
  fullWidthPreviewViewports,
  mergeStudioUi,
} from "@/lib/studio/studio-ui";
import type {
  StudioActionHandler,
  StudioHeaderAction,
} from "@/lib/studio/studio-action.types";
import { EditorLayout } from "./layout/Layout";

import type { ImagesProps, CopywritingProps } from "@/types/public";
export type { ImagesProps, CopywritingProps };

import { createEditorUiStore, EditorUiStoreProvider } from "@/store/editor-ui";
import {
  createEditorI18nStore,
  defaultMessages,
  EditorI18nStoreProvider,
} from "@/store/editor-i18n";
import { StudioActionProvider } from "@/store/studio-actions";
import type { Locale, Messages } from "@/store/editor-i18n";

export interface StudioProps {
  // Required Puck props
  config: Config;
  data: Data;
  onPublish: StudioActionHandler;

  // Optional Puck pass-through props
  onChange?: (data: Data) => void;
  ui?: Partial<UiState>;
  onAction?: (action: unknown, appState: unknown) => void;

  // Override escape hatches — consumer-provided keys win over defaults
  overrideExtensions?: Partial<Overrides>;

  // AI plugin — point at your /api/puck-ai endpoint
  aiHost?: string;

  // Studio shell customization
  onBack?: React.MouseEventHandler<HTMLButtonElement>;
  onSaveDraft?: StudioActionHandler;
  isSavingDraft?: boolean;
  lastSavedAt?: string | Date | number;
  isPublishing?: boolean;
  onOpenShare?: StudioActionHandler;
  onOpenCollaborators?: StudioActionHandler;
  onExportJson?: StudioActionHandler;
  onHeaderAction?: (action: StudioHeaderAction) => void;
  className?: string;

  // Library data
  images?: ImagesProps;
  copywritings?: CopywritingProps;

  // Per-instance store ID — used to namespace localStorage keys
  storeId?: string;

  // i18n
  locale?: Locale;
  messages?: Messages;
}

export function Studio({
  config,
  data,
  onPublish,
  onChange,
  ui,
  onAction,
  overrideExtensions,
  aiHost,
  className,
  onBack,
  onSaveDraft,
  isSavingDraft,
  lastSavedAt,
  isPublishing,
  onOpenShare,
  onOpenCollaborators,
  onExportJson,
  onHeaderAction,
  images,
  copywritings,
  storeId,
  locale,
  messages,
}: StudioProps) {
  const uiStore = React.useRef(createEditorUiStore(storeId ?? "default")).current;
  const i18nStore = React.useRef(
    createEditorI18nStore({
      locale: locale ?? "zh",
      messages: messages ?? defaultMessages,
    }),
  ).current;
  const mergedUi = React.useMemo(() => mergeStudioUi(ui), [ui]);

  // Keep i18n store in sync when locale/messages props change after mount
  React.useEffect(() => {
    i18nStore.getState().setLocale(locale ?? "zh", messages ?? defaultMessages);
  }, [locale, messages, i18nStore]);

  type AiPlugin = Awaited<ReturnType<typeof import("@puckeditor/plugin-ai")["createAiPlugin"]>>;
  const [aiPlugin, setAiPlugin] = React.useState<AiPlugin | null>(null);

  React.useEffect(() => {
    if (!aiHost) return;
    let cancelled = false;
    import("@puckeditor/plugin-ai")
      .then(({ createAiPlugin }) => {
        if (cancelled) return;
        import("@puckeditor/plugin-ai/styles.css").catch(() => {});
        setAiPlugin(createAiPlugin({ host: aiHost }));
      })
      .catch(() => {
        // @puckeditor/plugin-ai is an optional dependency — ignore if not installed
      });
    return () => { cancelled = true; };
  }, [aiHost]);

  // Merge: ai plugin preview override → puckOverrides defaults → consumer extensions win
  const mergedOverrides: Partial<Overrides> = React.useMemo(
    () => ({ ...(aiPlugin?.overrides ?? {}), ...puckOverrides, ...overrideExtensions }),
    [aiPlugin, overrideExtensions],
  );

  return (
    <StudioActionProvider onHeaderAction={onHeaderAction}>
      <EditorUiStoreProvider value={uiStore}>
        <EditorI18nStoreProvider value={i18nStore}>
          <div className={className}>
            <Puck
              config={config}
              data={data}
              onPublish={onPublish}
              onChange={onChange}
              ui={mergedUi}
              onAction={onAction}
              overrides={mergedOverrides}
              plugins={aiPlugin ? [aiPlugin] : []}
              viewports={fullWidthPreviewViewports}
            >
              <EditorLayout
                aiPanel={aiPlugin?.render()}
                onBack={onBack}
                onSaveDraft={onSaveDraft}
                isSavingDraft={isSavingDraft}
                lastSavedAt={lastSavedAt}
                onPublish={onPublish}
                isPublishing={isPublishing}
                onOpenShare={onOpenShare}
                onOpenCollaborators={onOpenCollaborators}
                onExportJson={onExportJson}
                onHeaderAction={onHeaderAction}
                images={images}
                copywritings={copywritings}
              />
            </Puck>
          </div>
        </EditorI18nStoreProvider>
      </EditorUiStoreProvider>
    </StudioActionProvider>
  );
}
