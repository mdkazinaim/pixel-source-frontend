"use client";

import { useRef } from "react";
import { Check, ChevronLeft, ChevronRight, CheckSquare, Square } from "lucide-react";
import { STOCK_SITES, SearchCategory } from "@/config/stockSites";

interface Props {
  selectedCategory: SearchCategory;
  selectedSites: string[];
  onSelectSites: (sites: string[]) => void;
}

export default function SearchControls({
  selectedCategory,
  selectedSites,
  onSelectSites,
}: Props) {
  const scrollRef = useRef<HTMLDivElement>(null);

  // Filter stock sites relevant to active category
  const activeSites = STOCK_SITES.filter((site) =>
    site.categories.includes(selectedCategory)
  );

  const activeSiteIds = activeSites.map((s) => s.id);
  const areAllSelected = activeSiteIds.length > 0 && activeSiteIds.every((id) => selectedSites.includes(id));

  const handleSelectAll = () => {
    if (areAllSelected) {
      // Remove all active sites from selection
      onSelectSites(selectedSites.filter((id) => !activeSiteIds.includes(id)));
    } else {
      // Add all active sites to selection (deduplicated)
      onSelectSites(Array.from(new Set([...selectedSites, ...activeSiteIds])));
    }
  };

  const handleToggleSite = (siteId: string) => {
    onSelectSites(
      selectedSites.includes(siteId)
        ? selectedSites.filter((id) => id !== siteId)
        : [...selectedSites, siteId]
    );
  };

  const scroll = (direction: "left" | "right") => {
    if (scrollRef.current) {
      const scrollAmount = 240;
      scrollRef.current.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      });
    }
  };

  return (
    <div className="w-full flex items-center space-x-2">
      {/* Select All Button */}

      {/* Left Navigation Arrow */}
      <button
        type="button"
        onClick={() => scroll("left")}
        className="p-2.5 rounded-lg border border-zinc-800 bg-zinc-900 hover:bg-zinc-850 text-zinc-400 hover:text-white transition-all flex-shrink-0 active:scale-95"
        >
        <ChevronLeft className="w-4 h-4" />
      </button>
      <button
        type="button"
        onClick={handleSelectAll}
        className={`flex items-center space-x-1.5 px-4 py-2.5 rounded-lg border text-xs font-bold transition-all flex-shrink-0 active:scale-[0.98] ${
          areAllSelected
            ? "bg-blue-600/10 border-blue-500/50 text-blue-400"
            : "bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-white"
        }`}
      >
      <span>All</span>
        {areAllSelected ? <CheckSquare className="w-3.5 h-3.5 text-blue-400" /> : <Square className="w-3.5 h-3.5 text-zinc-500" />}
      </button>

      {/* Scrollable list of sites */}
      <div
        ref={scrollRef}
        className="flex-1 flex items-center space-x-2 overflow-x-auto no-scrollbar scroll-smooth py-1"
      >
        {activeSites.map((site) => {
          const isSelected = selectedSites.includes(site.id);
          return (
            <button
              key={site.id}
              type="button"
              onClick={() => handleToggleSite(site.id)}
              className={`flex items-center space-x-2.5 px-4.5 py-2.5 rounded-lg border text-xs font-semibold transition-all flex-shrink-0 active:scale-[0.98] ${
                isSelected
                  ? "bg-zinc-800 border-blue-500/80 text-blue-400 shadow-md shadow-blue-500/5"
                  : "bg-zinc-900/40 border-zinc-800 text-zinc-400 hover:border-zinc-700 hover:text-zinc-300"
              }`}
            >
              <span className={`flex items-center justify-center w-4 h-4 rounded border transition-colors ${
                isSelected ? "border-blue-500 bg-blue-500/10" : "border-zinc-700"
              }`}>
                {isSelected && <Check className="w-3 h-3 text-blue-400" />}
              </span>
              <span>{site.icon}</span>
              <span>{site.name}</span>
            </button>
          );
        })}
      </div>

      {/* Right Navigation Arrow */}
      <button
        type="button"
        onClick={() => scroll("right")}
        className="p-2.5 rounded-lg border border-zinc-800 bg-zinc-900 hover:bg-zinc-850 text-zinc-400 hover:text-white transition-all flex-shrink-0 active:scale-95"
      >
        <ChevronRight className="w-4 h-4" />
      </button>
    </div>
  );
}
