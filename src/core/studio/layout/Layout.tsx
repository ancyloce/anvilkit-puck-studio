import { motion } from "motion/react";
import { Aside } from "./sidebar/Aside";
import { Puck } from "@puckeditor/core";
import { Header } from "./header/Header";
import { useActiveTab } from "@/store/hooks";
import { ImageLibrary } from "./sidebar/library/ImageLibrary";
import { CopyLibrary } from "./sidebar/library/CopyLibrary";
import { ViewportPreview } from "./ViewportPreview";
import type { ImagesProps, CopywritingProps } from "@/types/public";
import type { MouseEventHandler, ReactElement } from "react";
import type { StudioActionHandler, StudioHeaderAction } from "../types";

interface EditorLayoutProps {
  aiPanel?: ReactElement;
  images?: ImagesProps;
  copywritings?: CopywritingProps;
  onBack?: MouseEventHandler<HTMLButtonElement>;
  onSaveDraft?: StudioActionHandler;
  isSavingDraft?: boolean;
  lastSavedAt?: string | Date | number;
  onPublish: StudioActionHandler;
  isPublishing?: boolean;
  onOpenShare?: StudioActionHandler;
  onOpenCollaborators?: StudioActionHandler;
  onExportJson?: StudioActionHandler;
  onHeaderAction?: (action: StudioHeaderAction) => void;
}

export const EditorLayout = ({
  aiPanel,
  images,
  copywritings,
  onBack,
  onSaveDraft,
  isSavingDraft,
  lastSavedAt,
  onPublish,
  isPublishing,
  onOpenShare,
  onOpenCollaborators,
  onExportJson,
  onHeaderAction,
}: EditorLayoutProps) => {
  const activeTab = useActiveTab();

  return (
    <div className="max-sm:hidden overflow-hidden h-screen">
      <Header
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
      />
      <motion.div className="relative w-full flex border-r border-neutral-200 dark:border-neutral-800/80 bg-white/60 dark:bg-neutral-950/80 backdrop-blur-md ml-0 h-[calc(100vh-54px)]">
        <Aside></Aside>
        <div className="relative h-full flex flex-col overflow-x-hidden overflow-y-auto border-r border-neutral-200 dark:border-neutral-800/80 w-[240px]">
          {activeTab === "insert" && <Puck.Components />}
          {activeTab === "layer" && <Puck.Outline />}
          {activeTab === "image" && <ImageLibrary {...images} />}
          {activeTab === "text" && <CopyLibrary {...copywritings} />}
          {activeTab === "copilot" && aiPanel}
        </div>
        <ViewportPreview />
        <div className="border-l border-neutral-200 dark:border-neutral-800/80  w-[240px]">
          <Puck.Fields></Puck.Fields>
        </div>
      </motion.div>
    </div>
  );
};
