"use client";

import { useState } from "react";
import { SearchCategory } from "@/config/stockSites";
import { Image, Video, Sparkles } from "lucide-react";

interface Props {
  onScrape: (url: string) => void;
  loading: boolean;
  selectedCategory: SearchCategory;
  onSelectCategory: (cat: SearchCategory) => void;
  compact?: boolean;
}

export default function ScraperInput({
  onScrape,
  loading,
  selectedCategory,
  onSelectCategory,
  compact = false,
}: Props) {
  const [url, setUrl] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
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
      <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 to-cyan-500 rounded-2xl blur opacity-25 group-focus-within:opacity-50 transition duration-1000"></div>
      <div className={`relative flex items-center bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden w-full ${
        compact ? "p-1" : "p-1.5"
      }`}>
        {/* Category Dropdown Select */}
        <div className={`relative flex items-center border-r border-zinc-800/80 ${
          compact ? "pl-3 pr-1.5" : "pl-4 pr-2"
        }`}>
          <span className="mr-1.5 flex-shrink-0">{getCategoryIcon(selectedCategory)}</span>
          <select
            value={selectedCategory}
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
        </div>

        {/* Search Input Field */}
        <input
          type="text"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="Enter website URL or search keyword..."
          className={`flex-1 bg-transparent border-none outline-none text-white placeholder-zinc-505 ${
            compact ? "px-4 py-2 text-sm" : "px-6 py-4 text-base"
          }`}
          required
        />

        {/* Scrape Button */}
        <button
          type="submit"
          disabled={loading}
          className={`bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white rounded-xl font-bold transition-all flex items-center shadow-lg shadow-blue-900/20 active:scale-[0.98] ${
            compact ? "px-5 py-2.5 text-xs" : "px-8 py-3.5 text-sm"
          }`}
        >
          {loading ? "Analyzing..." : "Scrape Now"}
          {!loading && (
            <svg className={`ml-1.5 ${compact ? "w-3.5 h-3.5" : "w-4 h-4"}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          )}
        </button>
      </div>
    </form>
  );
}
