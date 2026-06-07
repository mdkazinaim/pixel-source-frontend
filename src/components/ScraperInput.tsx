"use client";

import { useState, useEffect } from "react";
import { SearchCategory } from "@/config/stockSites";
import { Image, Video, Sparkles, Link as LinkIcon } from "lucide-react";

interface Props {
  onScrape: (url: string) => void;
  onCancel?: () => void;
  onTriggerShake?: () => void;
  loading: boolean;
  selectedCategory: SearchCategory;
  onSelectCategory: (cat: SearchCategory) => void;
  hasSitesSelected: boolean;
  compact?: boolean;
  defaultValue?: string;
}

const isUrl = (str: string) => {
  const trimmed = str.trim();
  if (!trimmed) return false;
  if (/^https?:\/\//i.test(trimmed)) return true;
  if (/^[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}(?:\/|$)/.test(trimmed) && !/\s/.test(trimmed)) return true;
  return false;
};

export default function ScraperInput({
  onScrape,
  onCancel,
  onTriggerShake,
  loading,
  selectedCategory,
  onSelectCategory,
  hasSitesSelected,
  compact = false,
  defaultValue = "",
}: Props) {
  const [url, setUrl] = useState(defaultValue);
  const [prevDefaultValue, setPrevDefaultValue] = useState(defaultValue);

  if (defaultValue !== prevDefaultValue) {
    setUrl(defaultValue);
    setPrevDefaultValue(defaultValue);
  }

  const isLink = isUrl(url.trim());
  const isKeyword = url.trim().length > 0 && !isLink;
  const isSubmitDisabled = loading;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) {
      if (onCancel) onCancel();
      return;
    }
    if (isKeyword && !hasSitesSelected) {
      if (onTriggerShake) onTriggerShake();
      return;
    }
    if (url) onScrape(url);
  };

  const getCategoryIcon = (cat: SearchCategory) => {
    switch (cat) {
      case "images":
        return <Image className="w-3.5 h-3.5 text-blue-400" />;
      case "videos":
        return <Video className="w-3.5 h-3.5 text-emerald-400" />;
      case "icons":
        return <Sparkles className="w-3.5 h-3.5 text-purple-400" />;
    }
  };

  return (
    <form onSubmit={handleSubmit} className="relative group w-full">
      <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-cyan-500 rounded-lg blur opacity-25 group-focus-within:opacity-50 transition duration-1000"></div>
      <div className={`relative flex items-center bg-zinc-900 border border-zinc-800 rounded-lg overflow-hidden w-full transition-colors duration-300 pr-2.5 ${
        loading ? "border-red-900/30" : ""
      } ${
        compact ? "p-1" : "p-1.5"
      }`}>
        {/* Category Dropdown Select or Link Icon */}
        <div className={`relative flex items-center border-r border-zinc-800/80 transition-all duration-300 ${
          isLink ? "opacity-60" : ""
        } ${
          compact ? "pl-3 pr-1.5" : "pl-4 pr-2"
        }`}>
          <span className="mr-1.5 flex-shrink-0">
            {isLink ? (
              <LinkIcon className="w-3.5 h-3.5 text-blue-400" />
            ) : (
              getCategoryIcon(selectedCategory)
            )}
          </span>
          {isLink ? (
            <span className={`text-zinc-400 font-bold select-none cursor-not-allowed ${
              compact ? "pr-5 pl-0.5 py-2 text-xs" : "pr-6 pl-1 py-3 text-sm"
            }`}>
              Link
            </span>
          ) : (
            <select
              value={selectedCategory}
              disabled={loading}
              onChange={(e) => onSelectCategory(e.target.value as SearchCategory)}
              className={`bg-transparent text-zinc-300 outline-none cursor-pointer font-bold appearance-none hover:text-white transition-colors ${
                compact ? "pr-5 pl-0.5 py-2 text-xs" : "pr-6 pl-1 py-3 text-sm"
              }`}
              style={{
                backgroundImage: `url("data:image/svg+xml;charset=utf-8,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3E%3Cpath stroke='%23888' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='m6 8 4 4 4-4'/%3E%3C/svg%3E")`,
                backgroundPosition: "right center",
                backgroundSize: "1.1em",
                backgroundRepeat: "no-repeat",
              }}
            >
              <option value="images" className="bg-zinc-950 text-white font-semibold">Images</option>
              <option value="videos" className="bg-zinc-950 text-white font-semibold">Videos</option>
              <option value="icons" className="bg-zinc-950 text-white font-semibold">Icons</option>
            </select>
          )}
        </div>

        {/* Search Input Field */}
        <input
          type="text"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="Enter website URL or search keyword..."
          disabled={loading}
          className={`flex-1 bg-transparent border-none outline-none text-white placeholder-zinc-500 disabled:opacity-60 disabled:cursor-not-allowed ${
            compact ? "px-4 py-2 text-sm" : "px-6 py-4 text-base"
          }`}
          required
        />

        {/* Scrape/Cancel Button */}
        <div className="relative flex items-center">
          <button
            type="submit"
            disabled={isSubmitDisabled}
            className={`text-white rounded-lg font-bold transition-all flex items-center shadow-lg active:scale-[0.98] ${
              loading 
                ? "bg-red-650 hover:bg-red-600 shadow-red-950/20" 
                : "bg-blue-600 hover:bg-blue-500 disabled:opacity-40 disabled:cursor-not-allowed shadow-blue-900/20"
            } ${
              compact ? "px-5 py-2.5 text-xs" : "px-8 py-3.5 text-sm"
            }`}
          >
            {loading ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                <span>Cancel</span>
              </>
            ) : (
              <>
                <span>Scrape Now</span>
                <svg className={`ml-1.5 ${compact ? "w-3.5 h-3.5" : "w-4 h-4"}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </>
            )}
          </button>
        </div>
      </div>
    </form>
  );
}
