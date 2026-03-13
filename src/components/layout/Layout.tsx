import { motion } from "motion/react";
import { Aside } from "./sidebar/Aside";
import { Puck } from "@puckeditor/core";
import { Header } from "./header/Header";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useStore } from "zustand";
import { uiStore } from "@/store";
import type { ReactElement } from "react";

interface EditorLayoutProps {
    aiPanel?: ReactElement;
}

export const EditorLayout = ({ aiPanel }: EditorLayoutProps) => {
    const activeTab = useStore(uiStore, (s) => s.activeTab);

    return (
      <div className="max-sm:hidden overflow-hidden h-screen">
        <Header />
        <motion.div className="relative w-full flex border-r border-neutral-200 dark:border-neutral-800/80 bg-white/60 dark:bg-neutral-950/80 backdrop-blur-md ml-0 h-[calc(100vh-54px)]">
          <Aside></Aside>
          <div className="relative h-full flex flex-col overflow-x-hidden overflow-y-auto border-r border-neutral-200 dark:border-neutral-800/80 w-[240px]">
            {activeTab === "insert" && <Puck.Components />}
            {activeTab === "layer" && <Puck.Outline />}
            {activeTab === "copilot" && aiPanel}
          </div>
          <div className="flex-1 h-full overflow-hidden">
            <ScrollArea className="h-full">
              <Puck.Preview></Puck.Preview>
            </ScrollArea>
          </div>
          <div className="border-l border-neutral-200 dark:border-neutral-800/80  w-[240px]">
            <Puck.Fields></Puck.Fields>
          </div>
        </motion.div>
      </div>
    );
};
