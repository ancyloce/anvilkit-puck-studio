"use client";
import * as React from "react";
import { Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

const MOCK_VALUES: Record<string, string[]> = {
  default: ["AI-generated content", "Smart suggestion", "Generated text"],
};

function getMock(instructions?: string): string {
  if (instructions?.toLowerCase().includes("caps")) {
    return "AI GENERATED TITLE";
  }
  const pool = MOCK_VALUES.default;
  return pool[Math.floor(Math.random() * pool.length)];
}

interface AiButtonProps {
  ai: { instructions?: string };
  onGenerate: (value: string) => void;
}

export function AiButton({ ai, onGenerate }: AiButtonProps) {
  const [loading, setLoading] = React.useState(false);

  const handleClick = () => {
    setLoading(true);
    setTimeout(() => {
      onGenerate(getMock(ai.instructions));
      setLoading(false);
    }, 600);
  };

  return (
    <Button
      type="button"
      variant="outline"
      size="icon"
      className="h-8 w-8 shrink-0 text-muted-foreground hover:text-primary"
      onClick={handleClick}
      disabled={loading}
      aria-label="Generate with AI"
    >
      <Sparkles className={`h-3.5 w-3.5 ${loading ? "animate-pulse" : ""}`} />
    </Button>
  );
}
