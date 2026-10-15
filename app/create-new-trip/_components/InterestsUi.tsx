"use client";

import React from "react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

type InterestsUiProps = {
  selected?: string[];
  onSelect: (values: string[]) => void;
};

const INTERESTS = [
  { id: "adventure", label: "Adventure", emoji: "🏔️" },
  { id: "sightseeing", label: "Sightseeing", emoji: "🏛️" },
  { id: "culture", label: "Culture", emoji: "🎭" },
  { id: "food", label: "Food", emoji: "🍜" },
  { id: "nightlife", label: "Nightlife", emoji: "🌃" },
  { id: "relaxation", label: "Relaxation", emoji: "🧘" },
  { id: "shopping", label: "Shopping", emoji: "🛍️" },
  { id: "beaches", label: "Beaches", emoji: "🏖️" },
  { id: "nature", label: "Nature", emoji: "🌿" },
  { id: "mountains", label: "Mountains", emoji: "⛰️" },
];

export default function InterestsUi({ selected = [], onSelect }: InterestsUiProps) {
  const [localSelected, setLocalSelected] = React.useState<string[]>(selected);

  const toggle = (id: string) => {
    setLocalSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return Array.from(next);
    });
  };

  const clearAll = () => setLocalSelected([]);

  const handleContinue = () => {
    onSelect(localSelected);
  }

  return (
    <div className="w-full max-w-xl rounded-2xl border border-gray-100 dark:border-zinc-800 bg-white dark:bg-zinc-900 p-4 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Choose interests</h3>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Pick one or more (you can select multiple)
          </p>
        </div>

        {localSelected.length > 0 && (
          <button
            onClick={clearAll}
            className="text-xs font-medium text-primary hover:underline"
          >
            Clear
          </button>
        )}
      </div>

      <div className="mt-3 flex flex-wrap gap-2">
        {INTERESTS.map((item) => {
          const active = localSelected.includes(item.id);

          return (
            <button
              key={item.id}
              onClick={() => toggle(item.id)}
              className={cn(
                "flex items-center gap-2 rounded-full border px-3 py-2 text-sm transition",
                "hover:bg-gray-50 dark:hover:bg-zinc-800",
                active
                  ? "border-primary bg-primary/10 dark:bg-primary/20 text-primary"
                  : "border-gray-200 dark:border-zinc-700 text-gray-700 dark:text-gray-200"
              )}
            >
              <span className="text-base">{item.emoji}</span>
              <span className="font-medium">{item.label}</span>
              {active && (
                <Badge className="ml-1 bg-primary text-white hover:bg-primary">
                  Selected
                </Badge>
              )}
            </button>
          );
        })}
      </div>

      <div className="mt-4 flex justify-between items-center">
        <div className="text-xs text-gray-500 dark:text-gray-400">
          Selected:{" "}
          <span className="font-medium text-gray-700 dark:text-gray-200">
            {localSelected.length > 0 ? localSelected.join(", ") : "None"}
          </span>
        </div>

        <button
          onClick={handleContinue}
          disabled={localSelected.length === 0}
          className={cn(
            "px-4 py-2 rounded-full text-sm font-semibold transition-all shadow-md",
            localSelected.length > 0
              ? "bg-primary text-white hover:bg-primary/90 hover:shadow-lg"
              : "bg-gray-200 dark:bg-zinc-800 text-gray-400 dark:text-gray-500 cursor-not-allowed"
          )}
        >
          Continue
        </button>
      </div>
    </div>
  );
}
