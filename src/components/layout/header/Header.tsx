import { AnimatedAsana } from "./AnimatedAsana";
import { Button } from "@/components/ui/button";
import {
  ArrowLeft,
  Undo2,
  Redo2,
  Download,
  FileDown,
  Send,
} from "lucide-react";
import { usePuck } from "@puckeditor/core";
import { Separator } from "@/components/ui/separator";
import { Share } from "./Share";
import { CollaboratorsPopover } from "./CollaboratorsPopover";
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

  return (
    <TooltipProvider>
      <header className="flex overflow-hidden transition-all duration-300 backdrop-blur-xl w-full border-b border-neutral-200 dark:border-neutral-800 items-center h-[54px] py-0">
        <div className="w-18 flex items-center justify-center h-full border-r border-neutral-200 dark:border-neutral-800/80">
          <div className="flex items-center justify-center w-10 h-10 bg-primary rounded-full">
            <AnimatedAsana className="text-white text-2xl" />
          </div>
        </div>
        <div className="flex flex-1 w-full px-2">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div className="flex items-center justify-center gap-1 flex-1">
            {appState?.data?.root?.props?.title || ""}
          </div>
          <div className="flex items-center justify-center gap-2 h-full">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  disabled={!history.hasPast}
                  onClick={() => history.back()}
                  aria-label="Undo"
                >
                  <Undo2 className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Undo (Ctrl+Z)</TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  disabled={!history.hasFuture}
                  onClick={() => history.forward()}
                  aria-label="Redo"
                >
                  <Redo2 className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Redo (Ctrl+Y)</TooltipContent>
            </Tooltip>

            <Separator orientation="vertical" className="h-5 mx-1" />

            <CollaboratorsPopover />

            <Separator orientation="vertical" className="h-5 mx-1" />

            <Share />

            <Separator orientation="vertical" className="h-5 mx-1" />

            <DropdownMenu>
              <Tooltip>
                <TooltipTrigger asChild>
                  <DropdownMenuTrigger>
                    <Button variant="ghost" size="icon" aria-label="Export">
                      <Download className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                </TooltipTrigger>
                <TooltipContent>Export</TooltipContent>
              </Tooltip>
              <DropdownMenuContent align="end">
                <DropdownMenuItem
                  onClick={() => {
                    const json = JSON.stringify(appState.data, null, 2);
                    const blob = new Blob([json], { type: "application/json" });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement("a");
                    a.href = url;
                    a.download = `${appState.data.root?.props?.title || "page"}.json`;
                    a.click();
                    URL.revokeObjectURL(url);
                  }}
                >
                  <FileDown className="h-4 w-4" /> Export JSON
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <Separator orientation="vertical" className="h-5 mx-1" />

            <Tooltip>
              <TooltipTrigger asChild>
                <Button size="sm" aria-label="Publish">
                  <Send className="h-4 w-4" />
                  Publish
                </Button>
              </TooltipTrigger>
              <TooltipContent>Publish</TooltipContent>
            </Tooltip>
          </div>
        </div>
      </header>
    </TooltipProvider>
  );
};
