import * as React from "react";
import type { Overrides } from "@puckeditor/core";
import { EditorDrawer, EditorComponents } from "./layout/EditorDrawer";
import { DrawerItem } from "./layout/DrawerItem";
import { EditorOutline } from "./layout/EditorOutline";
import { CanvasIframe } from "./canvas/CanvasIframe";
import { CanvasPreview } from "./canvas/CanvasPreview";
import { ComponentOverlay } from "./canvas/ComponentOverlay";
import { ActionBar } from "./canvas/ActionBar";
import { FieldWrapper, FieldLabel } from "./fields/FieldWrapper";
import { fieldTypesRegistry } from "./fields/FieldTypesRegistry";

function PuckRoot({ children }: { children?: React.ReactNode }): React.ReactElement {
  return <>{children}</>;
}

export const puckOverrides: Partial<Overrides> = {
  drawer: EditorDrawer,
  components: EditorComponents,
  drawerItem: DrawerItem,
  componentItem: DrawerItem,
  outline: EditorOutline,
  iframe: CanvasIframe,
  preview: CanvasPreview,
  componentOverlay: ComponentOverlay,
  actionBar: ActionBar,
  fields: FieldWrapper,
  fieldTypes: fieldTypesRegistry as unknown as Overrides["fieldTypes"],
  puck: PuckRoot,
};

export {
  EditorDrawer,
  EditorComponents,
  DrawerItem,
  EditorOutline,
  CanvasIframe,
  CanvasPreview,
  ComponentOverlay,
  ActionBar,
  FieldWrapper,
  FieldLabel,
  fieldTypesRegistry,
};
