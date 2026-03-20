import { AnimatedAsana } from "./AnimatedAsana";
import * as React from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import { CollaboratorsPopover } from "./CollaboratorsPopover";
import { SharePanel } from "./Share";
import {
  ArrowLeft,
  ChevronDown,
  Ellipsis,
  FileDown,
  Link2,
  LoaderCircle,
  Moon,
  Save,
  Send,
  Sun,
} from "lucide-react";
import { useLocale, useMsg, useTheme, useToggleTheme } from "@/store/hooks";
import { useThemeSync } from "@/features/theme/useThemeSync";
import { exportDataAsJson } from "@/features/export/export-json";
import { usePuckSelector } from "@/lib/use-puck-selector";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { StudioActionHandler, StudioHeaderAction } from "../../types";
import { useReportStudioAction } from "../../useReportStudioAction";

interface HeaderProps {
  onBack?: React.MouseEventHandler<HTMLButtonElement>;
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

function formatLastSavedAt(
  value: HeaderProps["lastSavedAt"],
  locale: string,
): string | null {
  if (value == null) return null;

  if (typeof value === "string") {
    const parsedValue = new Date(value);
    if (Number.isNaN(parsedValue.getTime())) {
      return value;
    }

    value = parsedValue;
  }

  const date = value instanceof Date ? value : new Date(value);

  if (Number.isNaN(date.getTime())) {
    return null;
  }

  const now = new Date();
  const isSameDay =
    now.getFullYear() === date.getFullYear() &&
    now.getMonth() === date.getMonth() &&
    now.getDate() === date.getDate();

  return new Intl.DateTimeFormat(
    locale,
    isSameDay
      ? {
          hour: "numeric",
          minute: "2-digit",
        }
      : {
          month: "short",
          day: "numeric",
          hour: "numeric",
          minute: "2-digit",
        },
  ).format(date);
}

export const Header = ({
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
}: HeaderProps) => {
  const pageTitle = usePuckSelector(
    (state) => state.appState?.data?.root?.props?.title,
  );
  const puckData = usePuckSelector((state) => state.appState.data);
  const reportStudioAction = useReportStudioAction();
  const locale = useLocale();
  const back = useMsg("header.back");
  const publish = useMsg("header.publish");
  const publishing = useMsg("header.publish.saving");
  const saveDraft = useMsg("header.saveDraft");
  const saveDraftSaving = useMsg("header.saveDraft.saving");
  const saveDraftSavedAt = useMsg("header.saveDraft.savedAt");
  const savePublish = useMsg("header.savePublish");
  const savePublishTooltip = useMsg("header.savePublish.tooltip");
  const exportLabel = useMsg("header.export");
  const exportJson = useMsg("header.export.json");
  const shareLabel = useMsg("header.share");
  const collaboratorsLabel = useMsg("header.collaborators");
  const moreLabel = useMsg("header.more");
  const theme = useTheme();
  const toggleTheme = useToggleTheme();
  const themeLightLabel = useMsg("header.theme.light");
  const themeDarkLabel = useMsg("header.theme.dark");
  const themeLabel = theme === "dark" ? themeLightLabel : themeDarkLabel;
  const shareTitle = useMsg("share.title");
  const [draftPending, setDraftPending] = React.useState(false);
  const [publishPending, setPublishPending] = React.useState(false);
  const [shareDialogOpen, setShareDialogOpen] = React.useState(false);
  const [draftSavedAt, setDraftSavedAt] =
    React.useState<HeaderProps["lastSavedAt"]>();
  const effectiveSavingDraft = isSavingDraft ?? draftPending;
  const effectivePublishing = isPublishing ?? publishPending;
  const isSaveActionPending = effectiveSavingDraft || effectivePublishing;
  const resolvedLastSavedAt = lastSavedAt ?? draftSavedAt;
  const formattedLastSavedAt = React.useMemo(
    () => formatLastSavedAt(resolvedLastSavedAt, locale),
    [resolvedLastSavedAt, locale],
  );
  const draftStatusLabel = effectiveSavingDraft
    ? saveDraftSaving
    : formattedLastSavedAt
      ? `${saveDraftSavedAt} ${formattedLastSavedAt}`
      : null;
  const canSaveDraft = Boolean(onSaveDraft || onHeaderAction);
  const canOpenCollaborators = Boolean(onOpenCollaborators || onHeaderAction);

  useThemeSync();

  const handleSaveDraft = React.useCallback(async () => {
    if (!canSaveDraft) return;

    setDraftPending(true);
    reportStudioAction("save-draft");

    try {
      await onSaveDraft?.(puckData);

      if (onSaveDraft && lastSavedAt === undefined) {
        setDraftSavedAt(Date.now());
      }
    } catch (error) {
      console.error(
        '[anvilkit-studio] Header action "save-draft" failed.',
        error,
      );
    } finally {
      setDraftPending(false);
    }
  }, [canSaveDraft, lastSavedAt, onSaveDraft, puckData, reportStudioAction]);

  const handlePublish = React.useCallback(async () => {
    setPublishPending(true);
    reportStudioAction("publish");

    try {
      await onPublish(puckData);
    } catch (error) {
      console.error('[anvilkit-studio] Header action "publish" failed.', error);
    } finally {
      setPublishPending(false);
    }
  }, [onPublish, puckData, reportStudioAction]);

  const handleOpenShare = React.useCallback(async () => {
    reportStudioAction("open-share");

    try {
      if (onOpenShare) {
        await onOpenShare(puckData);
        return;
      }

      setShareDialogOpen(true);
    } catch (error) {
      console.error(
        '[anvilkit-studio] Header action "open-share" failed.',
        error,
      );
    }
  }, [onOpenShare, puckData, reportStudioAction]);

  const handleOpenCollaborators = React.useCallback(async () => {
    if (!canOpenCollaborators) return;

    reportStudioAction("open-collaborators");

    try {
      await onOpenCollaborators?.(puckData);
    } catch (error) {
      console.error(
        '[anvilkit-studio] Header action "open-collaborators" failed.',
        error,
      );
    }
  }, [canOpenCollaborators, onOpenCollaborators, puckData, reportStudioAction]);

  const handleExportJson = React.useCallback(async () => {
    reportStudioAction("export-json");

    try {
      if (onExportJson) {
        await onExportJson(puckData);
        return;
      }

      exportDataAsJson(puckData, {
        filenameBase: puckData.root?.props?.title,
      });
    } catch (error) {
      console.error(
        '[anvilkit-studio] Header action "export-json" failed.',
        error,
      );
    }
  }, [onExportJson, puckData, reportStudioAction]);

  const handleToggleTheme = React.useCallback(() => {
    reportStudioAction("toggle-theme");
    toggleTheme();
  }, [reportStudioAction, toggleTheme]);

  return (
    <TooltipProvider>
      <header className="flex overflow-hidden transition-all duration-300 backdrop-blur-xl w-full border-b border-neutral-200 dark:border-neutral-800 items-center h-[54px] py-0">
        <div className="w-18 flex items-center justify-center h-full border-r border-neutral-200 dark:border-neutral-800/80">
          <div className="flex items-center justify-center w-10 h-10 bg-primary rounded-full">
            <AnimatedAsana className="text-white text-2xl" />
          </div>
        </div>
        <div className="relative flex flex-1 w-full px-2">
          {onBack ? (
            <Tooltip>
              <TooltipTrigger
                render={
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={onBack}
                    aria-label={back}
                  />
                }
              >
                <ArrowLeft className="h-4 w-4" />
              </TooltipTrigger>
              <TooltipContent>{back}</TooltipContent>
            </Tooltip>
          ) : null}
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none text-sm font-medium">
            {pageTitle || ""}
          </div>
          <div className="flex items-center gap-1 h-full ml-auto">
            <Tooltip>
              <TooltipTrigger
                render={
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleToggleTheme}
                    aria-label={themeLabel}
                  />
                }
              >
                {theme === "dark" ? (
                  <Sun className="h-4 w-4" />
                ) : (
                  <Moon className="h-4 w-4" />
                )}
              </TooltipTrigger>
              <TooltipContent>{themeLabel}</TooltipContent>
            </Tooltip>

            <Separator orientation="vertical" className="h-5 mx-1" />

            <CollaboratorsPopover
              onClick={
                canOpenCollaborators ? handleOpenCollaborators : undefined
              }
              ariaLabel={collaboratorsLabel}
            />

            <Separator orientation="vertical" className="h-5 mx-1" />

            {draftStatusLabel ? (
              <div className="hidden lg:flex min-w-[1rem] items-center justify-end text-xs text-muted-foreground px-1">
                {draftStatusLabel}
              </div>
            ) : null}

            <DropdownMenu>
              <Tooltip>
                <TooltipTrigger
                  render={
                    <DropdownMenuTrigger
                      render={
                        <Button
                          size="sm"
                          disabled={isSaveActionPending}
                          aria-label={savePublish}
                        />
                      }
                    />
                  }
                >
                  {isSaveActionPending ? (
                    <LoaderCircle className="h-4 w-4 animate-spin" />
                  ) : (
                    <Save className="h-4 w-4" />
                  )}
                  {effectiveSavingDraft
                    ? saveDraftSaving
                    : effectivePublishing
                      ? publishing
                      : savePublish}
                  <ChevronDown className="h-4 w-4 opacity-70" />
                </TooltipTrigger>
                <TooltipContent>
                  {draftStatusLabel
                    ? `${savePublishTooltip} (${draftStatusLabel})`
                    : savePublishTooltip}
                </TooltipContent>
              </Tooltip>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem
                  onClick={() => {
                    void handleSaveDraft();
                  }}
                  disabled={!canSaveDraft || effectiveSavingDraft}
                >
                  <Save className="h-4 w-4" />
                  {saveDraft}
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => {
                    void handlePublish();
                  }}
                  disabled={effectivePublishing}
                >
                  <Send className="h-4 w-4" />
                  {publish}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <DropdownMenu>
              <Tooltip>
                <TooltipTrigger
                  render={
                    <DropdownMenuTrigger
                      render={
                        <Button
                          variant="outline"
                          size="icon"
                          aria-label={moreLabel}
                        />
                      }
                    />
                  }
                >
                  <Ellipsis className="h-4 w-4" />
                </TooltipTrigger>
                <TooltipContent>{moreLabel}</TooltipContent>
              </Tooltip>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuItem
                  onClick={() => {
                    void handleOpenShare();
                  }}
                >
                  <Link2 className="h-4 w-4" />
                  {shareLabel}
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuGroup>
                  <DropdownMenuLabel>{exportLabel}</DropdownMenuLabel>
                  <DropdownMenuItem
                    onClick={() => {
                      void handleExportJson();
                    }}
                  >
                    <FileDown className="h-4 w-4" />
                    {exportJson}
                  </DropdownMenuItem>
                </DropdownMenuGroup>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>
      <Dialog open={shareDialogOpen} onOpenChange={setShareDialogOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader className="sr-only">
            <DialogTitle>{shareTitle}</DialogTitle>
          </DialogHeader>
          <SharePanel />
        </DialogContent>
      </Dialog>
    </TooltipProvider>
  );
};
