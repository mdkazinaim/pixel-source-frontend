"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { Eye, ExternalLink, Check, X, ChevronLeft, ChevronRight, Download } from "lucide-react";
import { config } from "@/config";

interface Props {
  items: string[];
  type: "image" | "video";
  selectedItems: string[];
  onToggle: (item: string) => void;
}

interface ImageQuality {
  width: number;
  url: string;
}

interface GroupedImage {
  id: string;
  defaultUrl: string;
  selectedUrl: string;
  qualities: ImageQuality[];
}

const getUrlWidthAndBase = (urlStr: string) => {
  try {
    const url = new URL(urlStr);
    const params = new URLSearchParams(url.search);
    
    // Check for width parameter
    const widthVal = params.get("w") || params.get("width");
    let width = widthVal ? parseInt(widthVal, 10) : null;
    
    if (!width) {
      const match = url.pathname.match(/_(\d+)\.(jpg|png|webp|gif)/i);
      if (match) {
        width = parseInt(match[1], 10);
      }
    }
    
    // Create base URL (strip size/quality related parameters)
    const baseParams = new URLSearchParams(url.search);
    baseParams.delete("w");
    baseParams.delete("width");
    baseParams.delete("h");
    baseParams.delete("height");
    baseParams.delete("dpr");
    baseParams.delete("q");
    baseParams.delete("quality");
    
    const searchStr = baseParams.toString();
    const baseUrl = `${url.origin}${url.pathname}${searchStr ? `?${searchStr}` : ""}`;
    return { baseUrl, width: width || 0 };
  } catch {
    return { baseUrl: urlStr, width: 0 };
  }
};

const getSiteName = (url: string): string | null => {
  const lower = url.toLowerCase();
  if (lower.includes("unsplash")) return "Unsplash";
  if (lower.includes("freepik")) return "Freepik";
  if (lower.includes("pexels")) return "Pexels";
  if (lower.includes("pixabay")) return "Pixabay";
  if (lower.includes("vecteezy")) return "Vecteezy";
  if (lower.includes("adobe")) return "Adobe Stock";
  if (lower.includes("shutterstock")) return "Shutterstock";
  if (lower.includes("pinterest")) return "Pinterest";
  
  try {
    const parsed = new URL(url);
    const parts = parsed.hostname.split('.');
    const name = parts.length > 2 ? parts[1] : parts[0];
    return name.charAt(0).toUpperCase() + name.slice(1);
  } catch {
    return null;
  }
};

const groupImages = (images: string[]): GroupedImage[] => {
  const groups: { [base: string]: ImageQuality[] } = {};
  
  for (const url of images) {
    const { baseUrl, width } = getUrlWidthAndBase(url);
    if (!groups[baseUrl]) {
      groups[baseUrl] = [];
    }
    if (!groups[baseUrl].some(q => q.url === url)) {
      groups[baseUrl].push({ width, url });
    }
  }
  
  return Object.entries(groups).map(([baseUrl, qualities]) => {
    // Sort qualities descending by width (highest quality first)
    qualities.sort((a, b) => b.width - a.width);
    
    // Find a medium resolution for display (e.g. between 400px and 800px width)
    let displayItem = qualities.find(q => q.width >= 400 && q.width <= 800);
    if (!displayItem) {
      displayItem = qualities[qualities.length - 1]; // fallback to smallest
    }
    
    return {
      id: baseUrl,
      defaultUrl: displayItem?.url || baseUrl,
      selectedUrl: qualities[0]?.url || baseUrl, // Default selected is highest quality
      qualities
    };
  });
};

export default function MediaGrid({ items, type, selectedItems, onToggle }: Props) {
  const [selectedQualities, setSelectedQualities] = useState<{ [baseId: string]: string }>({});
  
  // Preview Modal States
  const [previewIndex, setPreviewIndex] = useState<number | null>(null);
  const [selectedSitesFilter, setSelectedSitesFilter] = useState<string[]>([]);

  if (items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-zinc-500">
        <p>No {type}s found on this page.</p>
      </div>
    );
  }


  const availableSites = Array.from(new Set(items.map(item => getSiteName(item)))).filter(Boolean) as string[];

  const filteredItems = selectedSitesFilter.length > 0
    ? items.filter(item => {
        const name = getSiteName(item);
        return name && selectedSitesFilter.includes(name);
      })
    : items;

  const grouped = type === "image" ? groupImages(filteredItems) : [];

  // Handle preview index bounds
  const handlePrev = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (previewIndex === null) return;
    const length = type === "image" ? grouped.length : filteredItems.length;
    setPreviewIndex((prev) => (prev !== null && prev > 0 ? prev - 1 : length - 1));
  };

  const handleNext = (e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (previewIndex === null) return;
    const length = type === "image" ? grouped.length : filteredItems.length;
    setPreviewIndex((prev) => (prev !== null && prev < length - 1 ? prev + 1 : 0));
  };

  const handleDownloadSingle = (url: string) => {
    const downloadUrl = `${config.API_BASE}/scraper/download-single?url=${encodeURIComponent(url)}`;
    const a = document.createElement("a");
    a.href = downloadUrl;
    a.setAttribute("download", "");
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  if (type === "image") {

    return (
      <>
        {availableSites.length > 1 && (
          <div className="w-full flex flex-wrap items-center gap-2 mb-6 p-2 bg-zinc-900/10 rounded-xl border border-zinc-800/80 backdrop-blur-md">
            <span className="text-xs text-zinc-500 font-semibold px-2">Filter Source:</span>
            <button
              onClick={() => setSelectedSitesFilter([])}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                selectedSitesFilter.length === 0
                  ? "bg-blue-600 text-white shadow-md shadow-blue-500/20"
                  : "bg-zinc-900/50 text-zinc-400 hover:text-white hover:bg-zinc-800"
              }`}
            >
              All ({items.length})
            </button>
            {availableSites.map(site => {
              const isActive = selectedSitesFilter.includes(site);
              const count = items.filter(item => getSiteName(item) === site).length;
              return (
                <button
                  key={site}
                  onClick={() => {
                    setSelectedSitesFilter(prev => 
                      prev.includes(site)
                        ? prev.filter(s => s !== site)
                        : [...prev, site]
                    );
                  }}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                    isActive
                      ? "bg-blue-600/20 text-blue-400 border border-blue-500/30"
                      : "bg-zinc-900/50 text-zinc-400 hover:text-white hover:bg-zinc-850 border border-transparent"
                  }`}
                >
                  <span>{site}</span>
                  <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                    isActive ? "bg-blue-500/20 text-blue-300" : "bg-zinc-950/80 text-zinc-500"
                  }`}>{count}</span>
                </button>
              );
            })}
          </div>
        )}
        <div className="columns-1 md:columns-3 gap-4 space-y-4">
          {grouped.map((g, index) => {
            const currentUrl = selectedQualities[g.id] || g.selectedUrl;
            const isSelected = selectedItems.includes(currentUrl);
            const siteName = getSiteName(currentUrl);

            return (
              <div
                key={g.id}
                onClick={() => setPreviewIndex(index)}
                className={`relative break-inside-avoid mb-4 group cursor-pointer rounded-xl overflow-hidden border-2 transition-all ${
                  isSelected
                    ? "border-blue-500 shadow-lg shadow-blue-900/40"
                    : "border-zinc-800 hover:border-zinc-650"
                }`}
              >
                {/* Site badge */}
                {siteName && (
                  <span className="absolute top-2.5 left-2.5 z-10 px-2 py-0.5 rounded bg-black/75 backdrop-blur-md border border-zinc-800 text-[10px] font-bold text-zinc-300">
                    {siteName}
                  </span>
                )}

                {/* Selection Checkbox */}
                <div
                  onClick={(e) => {
                    e.stopPropagation();
                    onToggle(currentUrl);
                  }}
                  className={`absolute top-2 right-2 z-10 w-7 h-7 rounded-full flex items-center justify-center cursor-pointer transition-all ${
                    isSelected ? "bg-blue-500 scale-110" : "bg-black/60 hover:bg-black/80 opacity-0 group-hover:opacity-100"
                  }`}
                  title={isSelected ? "Deselect item" : "Select item"}
                >
                  <Check className="w-4 h-4 text-white" />
                </div>

                <img
                  src={g.defaultUrl}
                  alt={`Scraped ${index}`}
                  className="w-full h-auto bg-zinc-800 transition-transform duration-500 group-hover:scale-[1.03]"
                  onError={(e) => (e.currentTarget.src = "https://via.placeholder.com/150?text=Error")}
                />

                {/* Quality Selector Dropdown (Bottom Left) */}
                {g.qualities.length > 1 && (
                  <div className="absolute bottom-2.5 left-2.5 z-10">
                    <select
                      value={currentUrl}
                      onClick={(e) => e.stopPropagation()}
                      onChange={(e) => {
                        e.stopPropagation();
                        const oldUrl = currentUrl;
                        const newUrl = e.target.value;
                        setSelectedQualities((prev) => ({ ...prev, [g.id]: newUrl }));
                        if (selectedItems.includes(oldUrl)) {
                          onToggle(oldUrl); // Toggle off old
                          onToggle(newUrl); // Toggle on new
                        }
                      }}
                      className="bg-black/85 backdrop-blur-md text-white text-[9px] font-bold px-1.5 py-1 rounded border border-zinc-800 outline-none cursor-pointer max-w-[120px] transition-all hover:bg-black/95 active:scale-[0.98]"
                    >
                      {g.qualities.map((q) => (
                        <option key={q.url} value={q.url} className="bg-zinc-950 text-xs text-white">
                          {q.width ? `${q.width}w` : "Original"}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {/* Hover Actions Overlay */}
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center justify-center gap-4">
                  {/* Preview (Eye) Button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setPreviewIndex(index);
                    }}
                    className="w-12 h-12 rounded-full bg-blue-600 hover:bg-blue-500 text-white flex items-center justify-center transition-all hover:scale-110 active:scale-95 shadow-lg cursor-pointer"
                    title="Preview Image"
                  >
                    <Eye className="w-5 h-5" />
                  </button>

                  {/* Download Button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDownloadSingle(currentUrl);
                    }}
                    className="w-12 h-12 rounded-full bg-green-600 hover:bg-green-500 text-white flex items-center justify-center transition-all hover:scale-110 active:scale-95 shadow-lg cursor-pointer"
                    title="Download Image"
                  >
                    <Download className="w-5 h-5" />
                  </button>
                  
                  {/* Details (ExternalLink) Button */}
                  <a
                    href={currentUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={(e) => e.stopPropagation()}
                    className="w-12 h-12 rounded-full bg-zinc-900/90 hover:bg-zinc-800 text-white flex items-center justify-center transition-all hover:scale-110 active:scale-95 shadow-lg border border-zinc-850"
                    title="View Original Details"
                  >
                    <ExternalLink className="w-5 h-5" />
                  </a>
                </div>
              </div>
            );
          })}
        </div>

        {/* Preview Lightbox Modal */}
        {previewIndex !== null && grouped[previewIndex] && createPortal(
          <div 
            className="fixed inset-0 z-[9999] bg-black/95 backdrop-blur-md flex flex-col justify-between p-6 animate-fade-in overflow-hidden h-screen max-h-screen"
            onClick={() => setPreviewIndex(null)}
          >
            {/* Modal Header */}
            <div className="w-full flex items-center justify-between z-10">
              <span className="text-sm font-semibold text-zinc-400">
                Preview ({previewIndex + 1} of {grouped.length})
              </span>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => {
                    const currentUrl = selectedQualities[grouped[previewIndex].id] || grouped[previewIndex].selectedUrl;
                    handleDownloadSingle(currentUrl);
                  }}
                  className="px-4 py-2 rounded-xl bg-green-600 hover:bg-green-500 text-white flex items-center gap-2 font-semibold text-sm transition-all shadow-lg active:scale-95 cursor-pointer"
                  title="Download Image"
                >
                  <Download className="w-4 h-4" />
                  <span>Download</span>
                </button>
                <button
                  onClick={() => setPreviewIndex(null)}
                  className="w-10 h-10 rounded-full bg-zinc-900 hover:bg-zinc-800 text-white flex items-center justify-center border border-zinc-850 transition-all cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Modal Main Image and Nav Buttons */}
            <div className="flex-1 min-h-0 flex items-center justify-center relative my-4 overflow-hidden">
              {/* Prev Arrow */}
              <button
                onClick={handlePrev}
                className="absolute left-2 md:left-4 z-10 w-12 h-12 rounded-full bg-zinc-900/80 hover:bg-zinc-800 text-white flex items-center justify-center border border-zinc-800 transition-all cursor-pointer hover:scale-105 active:scale-95"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>

              <img
                src={selectedQualities[grouped[previewIndex].id] || grouped[previewIndex].selectedUrl}
                alt={`Preview active ${previewIndex}`}
                onClick={(e) => e.stopPropagation()}
                className="max-h-[65vh] max-w-full object-contain rounded-xl shadow-2xl border border-zinc-900 bg-zinc-950"
                onError={(e) => (e.currentTarget.src = "https://via.placeholder.com/150?text=Error")}
              />

              {/* Next Arrow */}
              <button
                onClick={handleNext}
                className="absolute right-2 md:right-4 z-10 w-12 h-12 rounded-full bg-zinc-900/80 hover:bg-zinc-800 text-white flex items-center justify-center border border-zinc-800 transition-all cursor-pointer hover:scale-105 active:scale-95"
              >
                <ChevronRight className="w-6 h-6" />
              </button>
            </div>

            {/* Modal Bottom Suggested Row */}
            <div className="w-full max-w-[1200px] mx-auto z-10 flex-shrink-0" onClick={(e) => e.stopPropagation()}>
              <p className="text-zinc-400 text-xs font-semibold mb-2">Suggested Images</p>
              <div className="flex space-x-3 overflow-x-auto no-scrollbar pb-2">
                {grouped.map((gItem, idx) => {
                  const isCurrent = idx === previewIndex;
                  return (
                    <img
                      key={gItem.id}
                      src={gItem.defaultUrl}
                      alt={`Thumb ${idx}`}
                      onClick={() => setPreviewIndex(idx)}
                      className={`w-20 h-14 object-cover rounded-lg cursor-pointer border-2 transition-all flex-shrink-0 ${
                        isCurrent ? "border-blue-500 scale-105" : "border-zinc-850 hover:border-zinc-700"
                      }`}
                      onError={(e) => (e.currentTarget.src = "https://via.placeholder.com/150?text=Error")}
                    />
                  );
                })}
              </div>
            </div>
          </div>,
          document.body
        )}
      </>
    );
  }

  return (
    <>
      {availableSites.length > 1 && (
        <div className="w-full flex flex-wrap items-center gap-2 mb-6 p-2 bg-zinc-900/10 rounded-xl border border-zinc-800/80 backdrop-blur-md">
          <span className="text-xs text-zinc-500 font-semibold px-2">Filter Source:</span>
          <button
            onClick={() => setSelectedSitesFilter([])}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              selectedSitesFilter.length === 0
                ? "bg-blue-600 text-white shadow-md shadow-blue-500/20"
                : "bg-zinc-900/50 text-zinc-400 hover:text-white hover:bg-zinc-800"
            }`}
          >
            All ({items.length})
          </button>
          {availableSites.map(site => {
            const isActive = selectedSitesFilter.includes(site);
            const count = items.filter(item => getSiteName(item) === site).length;
            return (
              <button
                key={site}
                onClick={() => {
                  setSelectedSitesFilter(prev => 
                    prev.includes(site)
                      ? prev.filter(s => s !== site)
                      : [...prev, site]
                  );
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                  isActive
                    ? "bg-blue-600/20 text-blue-400 border border-blue-500/30"
                    : "bg-zinc-900/50 text-zinc-400 hover:text-white hover:bg-zinc-850 border border-transparent"
                }`}
              >
                <span>{site}</span>
                <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                  isActive ? "bg-blue-500/20 text-blue-300" : "bg-zinc-950/80 text-zinc-500"
                }`}>{count}</span>
              </button>
            );
          })}
        </div>
      )}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {filteredItems.map((item, index) => {
          const isSelected = selectedItems.includes(item);
          const siteName = getSiteName(item);

        return (
          <div
            key={index}
            className={`relative group rounded-xl overflow-hidden border-2 transition-all ${
              isSelected
                ? "border-blue-500 shadow-lg shadow-blue-900/40"
                : "border-zinc-800 hover:border-zinc-650"
            }`}
          >
            {/* Site badge */}
            {siteName && (
              <span className="absolute top-2.5 left-2.5 z-10 px-2 py-0.5 rounded bg-black/75 backdrop-blur-md border border-zinc-800 text-[10px] font-bold text-zinc-300">
                {siteName}
              </span>
            )}

            {/* Selection Checkbox */}
            <div
              onClick={(e) => {
                e.stopPropagation();
                onToggle(item);
              }}
              className={`absolute top-2 right-2 z-10 w-7 h-7 rounded-full flex items-center justify-center cursor-pointer transition-all ${
                isSelected ? "bg-blue-500 scale-110" : "bg-black/60 hover:bg-black/80 opacity-0 group-hover:opacity-100"
              }`}
            >
              <Check className="w-4 h-4 text-white" />
            </div>

            <div className="w-full h-40 bg-zinc-900 relative group/vid overflow-hidden">
              {item.includes("youtube.com/embed") || item.includes("player.vimeo.com") ? (
                <iframe
                  src={item}
                  className="w-full h-full pointer-events-none"
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                />
              ) : item.includes(".mp4") || item.includes(".webm") || item.includes(".ogg") ? (
                <video
                  src={item}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  muted
                  onMouseOver={(e) => e.currentTarget.play()}
                  onMouseOut={(e) => {
                    e.currentTarget.pause();
                    e.currentTarget.currentTime = 0;
                  }}
                />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center p-4 text-center">
                  <div className="w-12 h-12 rounded-full bg-blue-500/10 flex items-center justify-center mb-2">
                    <svg className="w-6 h-6 text-blue-500" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M8 5v14l11-7z" />
                    </svg>
                  </div>
                  <p className="text-[10px] text-zinc-500 break-all line-clamp-2">{item}</p>
                </div>
              )}
            </div>

            {/* Video hover button overlay */}
            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center justify-center gap-4">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleDownloadSingle(item);
                }}
                className="w-12 h-12 rounded-full bg-green-600 hover:bg-green-500 text-white flex items-center justify-center transition-all hover:scale-110 active:scale-95 shadow-lg cursor-pointer"
                title="Download Video"
              >
                <Download className="w-5 h-5" />
              </button>

              <a
                href={item}
                target="_blank"
                rel="noopener noreferrer"
                className="w-12 h-12 rounded-full bg-zinc-900/90 hover:bg-zinc-800 text-white flex items-center justify-center transition-all hover:scale-110 active:scale-95 shadow-lg border border-zinc-850"
                title="View Original Details"
              >
                <ExternalLink className="w-5 h-5" />
              </a>
            </div>
          </div>
        );
      })}
    </div>
    </>
  );
}
