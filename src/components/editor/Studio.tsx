"use client";
import * as React from "react";
import { Puck } from "@puckeditor/core";
import type { Config, Data, Overrides } from "@puckeditor/core";
import { createAiPlugin } from "@puckeditor/plugin-ai";
import "@puckeditor/plugin-ai/styles.css";
import { puckOverrides } from "../overrides/index";
import "@puckeditor/core/puck.css";
import { EditorLayout } from '../layout/Layout'

export interface StudioProps {
  // Required Puck props
  config: Config;
  data: Data;
  onPublish: (data: Data) => void;

  // Optional Puck pass-through props
  onChange?: (data: Data) => void;
  ui?: Record<string, unknown>;
  onAction?: (action: unknown, appState: unknown) => void;

  // Override escape hatches — consumer-provided keys win over defaults
  overrideExtensions?: Partial<Overrides>;

  // AI plugin — point at your /api/puck-ai endpoint
  aiHost?: string;

  // Studio shell customization
  headerSlot?: React.ReactNode;
  drawerHeaderSlot?: React.ReactNode;
  className?: string;
}

export function Studio({
  config,
  data,
  onPublish,
  onChange,
  overrideExtensions,
  aiHost,
  className,
}: StudioProps) {
  const aiPlugin = React.useMemo(
    () => createAiPlugin({ host: aiHost }),
    [aiHost]
  );

  // Merge: ai plugin preview override → puckOverrides defaults → consumer extensions win
  const mergedOverrides: Partial<Overrides> = React.useMemo(
    () => ({ ...aiPlugin.overrides, ...puckOverrides, ...overrideExtensions }),
    [aiPlugin.overrides, overrideExtensions]
  );

  return (
    <div className={className}>
      <Puck
        config={config}
        data={data}
        onPublish={onPublish}
        onChange={onChange}
        overrides={mergedOverrides}
        plugins={[aiPlugin]}
      >
        <EditorLayout aiPanel={aiPlugin.render()} />
      </Puck>
    </div>
  );
}
