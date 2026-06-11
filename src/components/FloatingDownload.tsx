import { useState } from "react";
import { Download, X, Trash2, Loader2, Check, AlertCircle } from "lucide-react";
import { config } from "@/config";

interface Props {
  selectedItems: string[];
  onToggle: (item: string) => void;
  onClear: () => void;
}

export default function FloatingDownload({ selectedItems, onToggle, onClear }: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const [status, setStatus] = useState<"idle" | "downloading" | "success" | "error">("idle");
  const [progress, setProgress] = useState(0);

  // Auto-close drawer if selection becomes empty
  if (selectedItems.length === 0 && isOpen) {
    setIsOpen(false);
  }

  const handleDownload = async () => {
    if (selectedItems.length === 0) return;
    setStatus("downloading");
    setProgress(10);

    try {
      const interval = setInterval(() => {
        setProgress((prev) => (prev < 90 ? prev + 10 : prev));
      }, 300);

      const response = await fetch(`${config.API_BASE}/scraper/download`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ urls: selectedItems }),
      });

      clearInterval(interval);
      setProgress(100);

      if (!response.ok) throw new Error("Download failed");

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `scraped-media-${Date.now()}.zip`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      setStatus("success");
      setTimeout(() => {
        setStatus("idle");
        setProgress(0);
      }, 2000);
    } catch (error) {
      console.error(error);
      setStatus("error");
      setTimeout(() => {
        setStatus("idle");
        setProgress(0);
      }, 3000);
    }
  };

  const getFileName = (url: string) => {
    try {
      const parsedUrl = new URL(url);
      const pathname = parsedUrl.pathname;
      const lastSegment = pathname.substring(pathname.lastIndexOf("/") + 1);
      if (lastSegment && lastSegment.includes(".")) {
        return lastSegment;
      }
      return parsedUrl.hostname + parsedUrl.pathname.substring(0, 10) + "...";
    } catch {
      return url.substring(0, 25) + "...";
    }
  };

  const isVideo = (url: string) => {
    return (
      url.includes(".mp4") ||
      url.includes(".webm") ||
      url.includes(".ogg") ||
      url.includes("youtube.com") ||
      url.includes("player.vimeo.com")
    );
  };

  if (selectedItems.length === 0) return null;

  return (
    <>
      {/* Floating Trigger Circle Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-24 right-8 z-[999] w-16 h-16 rounded-full bg-blue-600 hover:bg-blue-500 text-white flex items-center justify-center shadow-lg shadow-blue-500/20 hover:scale-110 active:scale-95 transition-all cursor-pointer border border-blue-400/30 group"
        title={`View selected ${selectedItems.length} items`}
      >
        <Download className="w-7 h-7 transition-transform group-hover:translate-y-[1px]" />
        <span className="absolute -top-1.5 -right-1.5 bg-red-500 text-white text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center border-2 border-zinc-950 shadow-md">
          {selectedItems.length}
        </span>
      </button>

      {/* Slide-out Drawer Panel */}
      {isOpen && (
        <div className="fixed inset-0 z-[1000] flex justify-end">
          {/* Backdrop blur */}
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
            onClick={() => {
              if (status !== "downloading") setIsOpen(false);
            }}
          />

          {/* Panel Container */}
          <div className="relative w-full md:w-[420px] h-full bg-zinc-950 border-l border-zinc-900 shadow-2xl flex flex-col p-6 z-10 animate-[slideLeft_0.3s_ease-out_forwards]">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-zinc-900 pb-4 mb-4">
              <div>
                <h3 className="text-lg font-bold text-white">Selection Queue</h3>
                <p className="text-xs text-zinc-500 mt-0.5">
                  {selectedItems.length} item{selectedItems.length !== 1 && "s"} ready for ZIP download
                </p>
              </div>
              <button
                disabled={status === "downloading"}
                onClick={() => setIsOpen(false)}
                className="w-8 h-8 rounded-full bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white flex items-center justify-center transition-all cursor-pointer disabled:opacity-50"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Scrollable list of files */}
            <div className="flex-1 overflow-y-auto no-scrollbar space-y-3 pr-1">
              {selectedItems.map((url, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-3 p-3 bg-zinc-900/40 rounded-xl border border-zinc-900 hover:border-zinc-850 transition-all group"
                >
                  {/* Thumbnail Preview */}
                  <div className="w-14 h-11 bg-zinc-900 rounded-lg overflow-hidden flex-shrink-0 flex items-center justify-center relative">
                    {isVideo(url) ? (
                      <div className="w-full h-full flex items-center justify-center bg-blue-500/10">
                        <svg className="w-4 h-4 text-blue-500" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M8 5v14l11-7z" />
                        </svg>
                      </div>
                    ) : (
                      <img
                        src={url}
                        alt="Preview"
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.currentTarget.src = "https://via.placeholder.com/60?text=File";
                        }}
                      />
                    )}
                  </div>

                  {/* Title / Info */}
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-zinc-200 truncate">{getFileName(url)}</p>
                    <p className="text-[10px] text-zinc-500 mt-0.5 truncate">{url}</p>
                  </div>

                  {/* Remove Button */}
                  <button
                    disabled={status === "downloading"}
                    onClick={() => onToggle(url)}
                    className="w-8 h-8 rounded-full bg-zinc-900/30 hover:bg-red-500/10 text-zinc-500 hover:text-red-400 flex items-center justify-center transition-all cursor-pointer opacity-0 group-hover:opacity-100 focus:opacity-100 disabled:opacity-30"
                    title="Remove item"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>

            {/* Footer / Actions block */}
            <div className="mt-4 border-t border-zinc-900 pt-4 space-y-3 flex-shrink-0">
              {/* Progress bar / State messaging */}
              {status === "downloading" && (
                <div className="space-y-2">
                  <div className="flex justify-between text-xs font-semibold">
                    <span className="text-blue-400 flex items-center gap-1.5">
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      Creating ZIP archive...
                    </span>
                    <span className="text-zinc-400">{progress}%</span>
                  </div>
                  <div className="h-1.5 w-full bg-zinc-900 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-blue-500 transition-all duration-300"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>
              )}

              {status === "success" && (
                <div className="flex items-center gap-2 text-xs font-semibold text-green-400 bg-green-500/10 p-3 rounded-xl border border-green-500/20">
                  <Check className="w-4 h-4 flex-shrink-0" />
                  <span>ZIP downloaded successfully!</span>
                </div>
              )}

              {status === "error" && (
                <div className="flex items-center gap-2 text-xs font-semibold text-red-400 bg-red-500/10 p-3 rounded-xl border border-red-500/20">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>Download failed. Please try again.</span>
                </div>
              )}

              {/* Actions buttons */}
              {status === "idle" && (
                <div className="flex flex-col gap-2">
                  <button
                    onClick={handleDownload}
                    className="w-full py-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold flex items-center justify-center gap-2 shadow-lg shadow-blue-500/10 hover:scale-[1.01] active:scale-[0.99] transition-all cursor-pointer"
                  >
                    <Download className="w-5 h-5" />
                    <span>Download ZIP ({selectedItems.length})</span>
                  </button>

                  <button
                    onClick={onClear}
                    className="w-full py-3 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-400 hover:text-white font-semibold transition-all cursor-pointer"
                  >
                    Clear Selection
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
