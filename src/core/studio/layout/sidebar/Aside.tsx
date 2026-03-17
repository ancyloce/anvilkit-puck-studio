import * as React from "react";
import { useActiveTab, useSetActiveTab, useMsg } from "@/store/hooks";
import { Tabs, TabsList, TabsTab } from "@/components/animate-ui/components/base/tabs";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Plus, Image, Layers2, Type, Bot } from "lucide-react";
import { isActiveTab, type ActiveTab } from "@/store/ui";

export function Aside() {
  const activeTab = useActiveTab();
  const setActiveTab = useSetActiveTab();
  const tabs: { value: ActiveTab; icon: React.ReactElement; label: string }[] = [
    { value: "insert", icon: <Plus className="h-4 w-4" />, label: useMsg("aside.insert") },
    { value: "layer", icon: <Layers2 className="h-4 w-4" />, label: useMsg("aside.layer") },
    { value: "image", icon: <Image className="h-4 w-4" />, label: useMsg("aside.image") },
    { value: "text", icon: <Type className="h-4 w-4" />, label: useMsg("aside.text") },
    { value: "copilot", icon: <Bot className="h-4 w-4" />, label: useMsg("aside.copilot") },
  ];

  return (
    <div className="w-18 h-full py-4 border-r border-neutral-200 dark:border-neutral-800/80">
      <TooltipProvider>
        <Tabs
          value={activeTab}
          onValueChange={(value) => {
            if (isActiveTab(value)) {
              setActiveTab(value);
            }
          }}
          className="w-full flex items-center justify-center"
        >
          <TabsList className="flex-col h-auto bg-transparent gap-2">
            {tabs.map(({ value, icon, label }) => (
              <Tooltip key={value}>
                <TooltipTrigger asChild>
                  <span>
                    <TabsTab value={value} className="p-2">
                      {icon}
                    </TabsTab>
                  </span>
                </TooltipTrigger>
                <TooltipContent side="right">{label}</TooltipContent>
              </Tooltip>
            ))}
          </TabsList>
        </Tabs>
      </TooltipProvider>
    </div>
  );
}
