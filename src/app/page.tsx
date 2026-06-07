"use client";

import { useState } from "react";
import ScraperInput from "@/components/ScraperInput";
import ResultsTabs from "@/components/ResultsTabs";
import MediaSkeleton from "@/components/MediaSkeleton";
import SearchControls from "@/components/SearchControls";
import FloatingDownload from "@/components/FloatingDownload";
import { STOCK_SITES, SearchCategory } from "@/config/stockSites";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { toggleItemSelection, clearSelection } from "@/store/slice/scraperSlice";
import { useScrapeUrlMutation } from "@/store/api/Scraper/Scraper.api";
import { ScrapedData } from "@/store/api/Scraper/Scraper.type";
import { Home as HomeIcon, ChevronLeft, ChevronRight, AlertCircle, X } from "lucide-react";

const isUrl = (str: string) => {
  try {
    const url = new URL(str);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
};

const getPageNumbers = (currentPage: number, totalPages: number) => {
  const pages: (number | string)[] = [];
  
  if (totalPages <= 15) {
    for (let i = 1; i <= totalPages; i++) pages.push(i);
  } else {
    pages.push(1);
    if (currentPage > 4) pages.push("...");
    
    const start = Math.max(2, currentPage - 2);
    const end = Math.min(totalPages - 1, currentPage + 2);
    
    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    
    if (currentPage < totalPages - 3) pages.push("...");
    pages.push(totalPages);
  }
  
  return pages;
};

export default function Home() {
  const dispatch = useAppDispatch();
  const { selectedItems } = useAppSelector((state) => state.scraper);
  const [scrapeUrl, { reset: resetScrape }] = useScrapeUrlMutation();

  // Local state for parallel scraping and combined results
  const [mergedData, setMergedData] = useState<ScrapedData | null>(null);
  const [isLocalLoading, setIsLocalLoading] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  // States for search categories and stock site filters
  const [selectedCategory, setSelectedCategory] = useState<SearchCategory>("images");
  const [selectedSites, setSelectedSites] = useState<string[]>(["unsplash", "freepik"]);

  // Active tab view selection state
  const [activeTab, setActiveTab] = useState<"images" | "videos" | "links">("images");

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPagesImages, setTotalPagesImages] = useState(1);
  const [totalPagesVideos, setTotalPagesVideos] = useState(1);
  const [totalPagesLinks, setTotalPagesLinks] = useState(1);
  const [lastQuery, setLastQuery] = useState<string | null>(null);

  const hasSearched = !!mergedData || isLocalLoading;

  const handleSelectCategory = (cat: SearchCategory) => {
    setSelectedCategory(cat);
    // Find all valid sites for this category
    const validSites = STOCK_SITES.filter((s) => s.categories.includes(cat)).map((s) => s.id);
    // Keep only valid sites in active selection
    const updated = selectedSites.filter((id) => validSites.includes(id));
    
    // Default to first available valid site if none of the previously selected sites are valid
    if (updated.length === 0 && validSites.length > 0) {
      setSelectedSites([validSites[0]]);
    } else {
      setSelectedSites(updated);
    }
  };

  const handleScrape = async (urlOrKeyword: string) => {
    setCurrentPage(1);
    setLastQuery(urlOrKeyword);
    
    // Auto sync active tab with selected search category initially
    const isUrlSearch = isUrl(urlOrKeyword);
    setActiveTab(!isUrlSearch
      ? (selectedCategory === "videos" ? "videos" : "images")
      : "images"
    );

    await executeScrape(urlOrKeyword, 1);
  };

  const [showErrorToast, setShowErrorToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");

  const handlePageChange = async (newPage: number) => {
    if (!lastQuery) return;
    setCurrentPage(newPage);
    await executeScrape(lastQuery, newPage);
  };

  const executeScrape = async (urlOrKeyword: string, page: number) => {
    dispatch(clearSelection());
    setIsLocalLoading(true);
    setMergedData(null);
    setLocalError(null);
    setShowErrorToast(false);
    setToastMessage("");

    let urls: string[] = [];

    try {
      if (isUrl(urlOrKeyword)) {
        urls = [urlOrKeyword];
      } else {
        const term = encodeURIComponent(urlOrKeyword.trim());
        if (selectedSites.length === 0) {
          throw new Error("Please select at least one stock image site.");
        }
        urls = selectedSites
          .map((siteId) => {
            const site = STOCK_SITES.find((s) => s.id === siteId);
            return site ? site.getUrl(term, selectedCategory) : "";
          })
          .filter(Boolean);
      }

      let completedCount = 0;
      let failedCount = 0;
      
      const currentCombined: ScrapedData = {
        images: [],
        videos: [],
        links: [],
        h1s: [],
      };
      
      let currentTotalImages = 0;
      let currentTotalVideos = 0;
      let currentTotalLinks = 0;

      const linkHrefs = new Set<string>();

      const scrapePromises = urls.map(async (url) => {
        try {
          const res = await scrapeUrl({ url, page, limit: 20 }).unwrap();
          
          if (res.data.images) currentCombined.images.push(...res.data.images);
          if (res.data.videos) currentCombined.videos.push(...res.data.videos);
          if (res.data.h1s) currentCombined.h1s.push(...res.data.h1s);
          if (res.data.links) {
            for (const link of res.data.links) {
              if (!linkHrefs.has(link.href)) {
                linkHrefs.add(link.href);
                currentCombined.links.push(link);
              }
            }
          }

          if (res.pagination) {
            currentTotalImages += res.pagination.totalImages;
            currentTotalVideos += res.pagination.totalVideos;
            currentTotalLinks += res.pagination.totalLinks;
          }

          // Deduplicate arrays
          const dedupedImages = Array.from(new Set(currentCombined.images));
          const dedupedVideos = Array.from(new Set(currentCombined.videos));
          const dedupedH1s = Array.from(new Set(currentCombined.h1s));

          setMergedData({
            images: dedupedImages,
            videos: dedupedVideos,
            links: [...currentCombined.links],
            h1s: dedupedH1s,
          });

          const activeUrlsCount = urls.length || 1;
          setTotalPagesImages(Math.ceil(currentTotalImages / (activeUrlsCount * 20)) || 1);
          setTotalPagesVideos(Math.ceil(currentTotalVideos / (activeUrlsCount * 20)) || 1);
          setTotalPagesLinks(Math.ceil(currentTotalLinks / (activeUrlsCount * 20)) || 1);

        } catch (error: any) {
          console.error(`Scrape failed for URL: ${url}`, error);
          failedCount++;
        } finally {
          completedCount++;
          if (completedCount === urls.length) {
            setIsLocalLoading(false);
            if (failedCount === urls.length) {
              setToastMessage("All scraping queries failed. Please check your query or sites availability.");
              setShowErrorToast(true);
            }
          }
        }
      });

      await Promise.all(scrapePromises);

    } catch (error: any) {
      console.error("Scrape failed", error);
      const errMsg = error?.data?.message || error?.message || "Failed to fetch data. Make sure backend is running.";
      setToastMessage(errMsg);
      setShowErrorToast(true);
      setIsLocalLoading(false);
    }
  };

  const handleToggleItemSelection = (item: string) => {
    dispatch(toggleItemSelection(item));
  };

  const handleGoHome = () => {
    resetScrape();
    setMergedData(null);
    setIsLocalLoading(false);
    setLocalError(null);
    setLastQuery(null);
    setCurrentPage(1);
    dispatch(clearSelection());
  };

  // Determine active total pages for floating pagination
  let activeTotalPages = 1;
  if (activeTab === "images") activeTotalPages = totalPagesImages;
  if (activeTab === "videos") activeTotalPages = totalPagesVideos;
  if (activeTab === "links") activeTotalPages = totalPagesLinks;

  return (
    <div className="min-h-screen flex flex-col w-full bg-black text-white pb-28">
      {/* Sticky Header Block (contains Navbar and SearchControls) */}
      {hasSearched && (
        <div className="sticky top-0 z-50 w-full bg-black/90 backdrop-blur-md border-b border-zinc-800/80 animate-slide-down flex flex-col">
          {/* Navbar */}
          <header className="w-full flex-shrink-0">
            <div className="w-full max-w-[1600px] mx-auto px-8 h-16 flex items-center justify-between gap-8">
              <div 
                onClick={handleGoHome} 
                className="flex items-center space-x-2 cursor-pointer group flex-shrink-0"
              >
                <span className="text-xl font-bold tracking-tight text-white group-hover:opacity-90 transition-opacity">
                  Pixel <span className="text-gradient">Source</span>
                </span>
              </div>

              {/* Compact Search Input inside the Navbar */}
              <div className="flex-1 max-w-xl">
                <ScraperInput 
                  onScrape={handleScrape} 
                  loading={isLocalLoading} 
                  selectedCategory={selectedCategory}
                  onSelectCategory={handleSelectCategory}
                  compact={true}
                />
              </div>
              
              <nav className="flex items-center space-x-4 flex-shrink-0">
                <button 
                  onClick={handleGoHome} 
                  className="flex items-center space-x-1.5 px-4 py-2 rounded-xl text-zinc-400 hover:text-white hover:bg-zinc-800/50 active:scale-[0.98] transition-all font-semibold text-sm"
                >
                  <HomeIcon className="w-4 h-4" />
                  <span>Home</span>
                </button>
              </nav>
            </div>
          </header>

          {/* Site Selector Controls Row - Pinned directly under Search bar */}
          <div className="w-full max-w-[1600px] mx-auto px-8 pb-4">
            <SearchControls
              selectedCategory={selectedCategory}
              selectedSites={selectedSites}
              onSelectSites={setSelectedSites}
            />
          </div>
        </div>
      )}

      {/* Content Area - scrolls normally beneath the sticky header wrapper */}
      <main className="flex-1 w-full max-w-[1600px] mx-auto px-8 py-8 flex flex-col items-center">
        {!hasSearched ? (
          /* Initial Hero Landing Screen */
          <div className="w-full flex flex-col items-center justify-center flex-1 py-12">
            <div className="w-full text-center mb-12 animate-fade-in">
              <h1 className="text-6xl font-bold mb-4 tracking-tight">
                Dynamic <span className="text-gradient">Scraper</span>
              </h1>
              <p className="text-gray-400 text-lg max-w-2xl mx-auto">
                Extract images, videos, links, and content from any URL with precision.
                Powerful Puppeteer-based analysis at your fingertips.
              </p>
            </div>

            <div className="w-full max-w-4xl animate-fade-in space-y-5">
              <ScraperInput 
                onScrape={handleScrape} 
                loading={isLocalLoading} 
                selectedCategory={selectedCategory}
                onSelectCategory={handleSelectCategory}
              />
              <SearchControls
                selectedCategory={selectedCategory}
                selectedSites={selectedSites}
                onSelectSites={setSelectedSites}
              />
            </div>
          </div>
        ) : (
          /* Search Results Screen */
          <div className="w-full flex flex-col items-center">
            {/* Progress indicator while loading background sources */}
            {isLocalLoading && mergedData && (
              <div className="w-full mb-6">
                <div className="w-full h-1 bg-zinc-900 overflow-hidden relative rounded-full">
                  <div className="h-full bg-blue-500 rounded-full animate-pulse w-full" />
                </div>
                <p className="text-xs text-zinc-500 font-semibold mt-2 text-center animate-pulse">
                  Fetching results from remaining sources...
                </p>
              </div>
            )}

            {/* Results Grid / Tabs */}
            {mergedData && (
              <div className="w-full animate-fade-in">
                <ResultsTabs
                  data={mergedData}
                  selectedItems={selectedItems}
                  toggleItemSelection={handleToggleItemSelection}
                  selectedCategory={selectedCategory}
                  isUrlSearch={lastQuery ? isUrl(lastQuery) : false}
                  activeTab={activeTab}
                  setActiveTab={setActiveTab}
                />
              </div>
            )}

            {/* Bento Skeleton Loader shown only at initial loading state */}
            {isLocalLoading && !mergedData && (
              <div className="w-full animate-fade-in">
                <MediaSkeleton />
              </div>
            )}
          </div>
        )}
      </main>

      {/* Fixed Pagination Footer - Rendered at root level to guarantee fixed viewport positioning */}
      {hasSearched && (
        <div className="fixed bottom-0 left-0 right-0 z-50 border-t border-zinc-800 bg-zinc-950/95 backdrop-blur-md shadow-2xl py-3.5 px-8 h-[68px] flex items-center">
          <div className="w-full max-w-[1600px] mx-auto flex items-center justify-between gap-4">
            {!isLocalLoading && activeTotalPages > 1 && (
              <>
                {/* Previous Button */}
                <button
                  disabled={currentPage <= 1}
                  onClick={() => handlePageChange(currentPage - 1)}
                  className="flex items-center space-x-1.5 px-4 py-2 rounded-full border border-zinc-850 bg-zinc-900/60 hover:bg-zinc-800 text-zinc-300 hover:text-white disabled:opacity-30 disabled:hover:bg-zinc-900/60 disabled:hover:text-zinc-300 transition-all font-semibold text-xs active:scale-[0.98]"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span>Previous</span>
                </button>

                {/* Circular Numbered Pagination Buttons */}
                <div className="flex items-center space-x-2">
                  {getPageNumbers(currentPage, activeTotalPages).map((p, idx) => {
                    if (p === "...") {
                      return (
                        <span key={`dots-${idx}`} className="w-8 h-8 text-zinc-500 flex items-center justify-center text-xs select-none font-bold">
                          ...
                        </span>
                      );
                    }
                    const isPageActive = p === currentPage;
                    return (
                      <button
                        key={`page-${p}`}
                        onClick={() => handlePageChange(p as number)}
                        className={`w-8 h-8 rounded-full transition-all font-bold text-xs flex items-center justify-center active:scale-[0.98] ${
                          isPageActive
                            ? "bg-blue-600 text-white shadow-md shadow-blue-500/30"
                            : "border border-zinc-800 bg-zinc-900/40 text-zinc-400 hover:text-white hover:bg-zinc-800"
                        }`}
                      >
                        {p}
                      </button>
                    );
                  })}
                </div>

                {/* Next Button */}
                <button
                  disabled={currentPage >= activeTotalPages}
                  onClick={() => handlePageChange(currentPage + 1)}
                  className="flex items-center space-x-1.5 px-4 py-2 rounded-full border border-zinc-850 bg-zinc-900/60 hover:bg-zinc-800 text-zinc-300 hover:text-white disabled:opacity-30 disabled:hover:bg-zinc-900/60 disabled:hover:text-zinc-300 transition-all font-semibold text-xs active:scale-[0.98]"
                >
                  <span>Next</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              </>
            )}
          </div>
        </div>
      )}

      {/* Floating Download Manager */}
      <FloatingDownload
        selectedItems={selectedItems}
        onToggle={handleToggleItemSelection}
        onClear={() => dispatch(clearSelection())}
      />

      {/* Floating Error Toast */}
      {showErrorToast && (
        <div className="fixed top-24 right-6 z-[1000] w-80 md:w-96 p-4 rounded-xl bg-zinc-950/95 border border-red-500/30 text-white shadow-2xl flex gap-3 animate-[slideLeft_0.3s_ease-out_forwards]">
          <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <h4 className="text-sm font-bold">Scraping Alert</h4>
            <p className="text-xs text-zinc-400 mt-1">{toastMessage}</p>
          </div>
          <button
            onClick={() => setShowErrorToast(false)}
            className="text-zinc-500 hover:text-zinc-300 self-start p-0.5 rounded-lg hover:bg-zinc-900 transition-all cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
}
