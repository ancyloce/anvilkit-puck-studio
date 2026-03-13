import { useStore } from "zustand";
import { uiStore } from "@/store";
import { Tabs, TabsList, TabsTab } from "@/components/animate-ui/components/base/tabs";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Plus, Image, Layers2, Type, Bot } from "lucide-react";

const tabs = [
    { value: "insert", icon: <Plus className="h-4 w-4" />, label: "Insert" },
    { value: "layer", icon: <Layers2 className="h-4 w-4" />, label: "Layers" },
    { value: "image", icon: <Image className="h-4 w-4" />, label: "Images" },
    { value: "text", icon: <Type className="h-4 w-4" />, label: "Text" },
    { value: "copilot", icon: <Bot className="h-4 w-4" />, label: "Ai Copilot"}
];

export function Aside() {
    const activeTab = useStore(uiStore, (s) => s.activeTab);
    const setActiveTab = useStore(uiStore, (s) => s.setActiveTab);

    return (
        <div className="w-18 h-full py-4 border-r border-neutral-200 dark:border-neutral-800/80">
            <TooltipProvider>
                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full flex items-center justify-center">
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
