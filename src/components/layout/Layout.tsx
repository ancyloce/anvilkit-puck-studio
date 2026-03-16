import { motion } from "motion/react";
import { Aside } from "./sidebar/Aside";
import { Puck } from "@puckeditor/core";
import { Header } from "./header/Header";
import { useActiveTab } from "@/store/hooks";
import { ImageLibrary } from "./sidebar/library/ImageLibrary";
import { CopyLibrary } from "./sidebar/library/CopyLibrary";
import type { ImagesProps } from "./sidebar/library/ImageLibrary";
import type { CopywritingProps } from "./sidebar/library/CopyLibrary";
import type { ReactElement } from "react";

interface EditorLayoutProps {
  aiPanel?: ReactElement;
  images?: ImagesProps;
  copywritings?: CopywritingProps;
}

export const EditorLayout = ({
  aiPanel,
  images,
  copywritings,
}: EditorLayoutProps) => {
  const activeTab = useActiveTab();

  return (
    <div className="max-sm:hidden overflow-hidden h-screen">
      <Header />
      <motion.div className="relative w-full flex border-r border-neutral-200 dark:border-neutral-800/80 bg-white/60 dark:bg-neutral-950/80 backdrop-blur-md ml-0 h-[calc(100vh-54px)]">
        <Aside></Aside>
        <div className="relative h-full flex flex-col overflow-x-hidden overflow-y-auto border-r border-neutral-200 dark:border-neutral-800/80 w-[240px]">
          {activeTab === "insert" && <Puck.Components />}
          {activeTab === "layer" && <Puck.Outline />}
          {activeTab === "image" && <ImageLibrary {...images} />}
          {activeTab === "text" && <CopyLibrary {...copywritings} />}
          {activeTab === "copilot" && aiPanel}
        </div>
        <div className="flex-1 h-full overflow-hidden">
          <Puck.Preview></Puck.Preview>
        </div>
        <div className="border-l border-neutral-200 dark:border-neutral-800/80  w-[240px]">
          <Puck.Fields></Puck.Fields>
        </div>
      </motion.div>
    </div>
  );
};
