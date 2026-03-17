import { AnimatedAsana } from "./AnimatedAsana";
import * as React from "react";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft,
  Undo2,
  Redo2,
  Download,
  FileDown,
  Send,
  Sun,
  Moon,
} from "lucide-react";
import { usePuck } from "@puckeditor/core";
import { Separator } from "@/components/ui/separator";
import { Share } from "./Share";
import { CollaboratorsPopover } from "./CollaboratorsPopover";
import { useMsg, useTheme, useToggleTheme } from "@/store/hooks";
import { useThemeSync } from "@/features/theme/useThemeSync";
import { exportDataAsJson } from "@/features/export/export-json";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export const Header = () => {
  const { history, appState } = usePuck();
  const publish = useMsg("header.publish");
  const undo = useMsg("header.undo");
  const undoTooltip = useMsg("header.undo.tooltip");
  const redo = useMsg("header.redo");
  const redoTooltip = useMsg("header.redo.tooltip");
  const exportLabel = useMsg("header.export");
  const exportJson = useMsg("header.export.json");
  const theme = useTheme();
  const toggleTheme = useToggleTheme();
  const themeLightLabel = useMsg("header.theme.light");
  const themeDarkLabel = useMsg("header.theme.dark");
  const themeLabel = theme === "dark" ? themeLightLabel : themeDarkLabel;

  useThemeSync();

  return (
    <TooltipProvider>
      <header className="flex overflow-hidden transition-all duration-300 backdrop-blur-xl w-full border-b border-neutral-200 dark:border-neutral-800 items-center h-[54px] py-0">
        <div className="w-18 flex items-center justify-center h-full border-r border-neutral-200 dark:border-neutral-800/80">
          <div className="flex items-center justify-center w-10 h-10 bg-primary rounded-full">
            <AnimatedAsana className="text-white text-2xl" />
          </div>
        </div>
        <div className="relative flex flex-1 w-full px-2">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none text-sm font-medium">
            {appState?.data?.root?.props?.title || ""}
          </div>
          <div className="flex items-center justify-center gap-2 h-full ml-auto">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  disabled={!history.hasPast}
                  onClick={() => history.back()}
                  aria-label={undo}
                >
                  <Undo2 className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>{undoTooltip}</TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  disabled={!history.hasFuture}
                  onClick={() => history.forward()}
                  aria-label={redo}
                >
                  <Redo2 className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>{redoTooltip}</TooltipContent>
            </Tooltip>

            <Separator orientation="vertical" className="h-5 mx-1" />

            <CollaboratorsPopover />

            <Separator orientation="vertical" className="h-5 mx-1" />

            <Share />

            <Separator orientation="vertical" className="h-5 mx-1" />

            <DropdownMenu>
              <Tooltip>
                <TooltipTrigger asChild>
                  <DropdownMenuTrigger render={<Button variant="ghost" size="icon" aria-label={exportLabel} />}>
                    <Download className="h-4 w-4" />
                  </DropdownMenuTrigger>
                </TooltipTrigger>
                <TooltipContent>{exportLabel}</TooltipContent>
              </Tooltip>
              <DropdownMenuContent align="end">
                <DropdownMenuItem
                  onClick={() => {
                    exportDataAsJson(appState.data, {
                      filenameBase: appState.data.root?.props?.title,
                    });
                  }}
                >
                  <FileDown className="h-4 w-4" /> {exportJson}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <Separator orientation="vertical" className="h-5 mx-1" />

            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" onClick={toggleTheme} aria-label={themeLabel}>
                  {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
                </Button>
              </TooltipTrigger>
              <TooltipContent>{themeLabel}</TooltipContent>
            </Tooltip>

            <Separator orientation="vertical" className="h-5 mx-1" />

            <Tooltip>
              <TooltipTrigger asChild>
                <Button size="sm" aria-label={publish}>
                  <Send className="h-4 w-4" />
                  {publish}
                </Button>
              </TooltipTrigger>
              <TooltipContent>{publish}</TooltipContent>
            </Tooltip>
          </div>
        </div>
      </header>
    </TooltipProvider>
  );
};
