"use client";

export default function MediaSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full h-full min-h-0 overflow-y-auto no-scrollbar pr-1">
      {/* Block 1: Large Bento Item */}
      <div className="animate-pulse bg-zinc-900/40 border border-zinc-800/60 rounded-2xl md:col-span-2 md:row-span-2 h-[420px] relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-zinc-800/10 to-transparent -translate-x-full animate-[shimmer_2s_infinite]" />
        <div className="absolute bottom-4 left-4 w-32 h-4 bg-zinc-800/50 rounded" />
      </div>
      
      {/* Block 2: Small Item */}
      <div className="animate-pulse bg-zinc-900/40 border border-zinc-800/60 rounded-2xl h-[200px] relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-zinc-800/10 to-transparent -translate-x-full animate-[shimmer_2s_infinite]" />
        <div className="absolute bottom-4 left-4 w-20 h-4 bg-zinc-800/50 rounded" />
      </div>

      {/* Block 3: Small Item */}
      <div className="animate-pulse bg-zinc-900/40 border border-zinc-800/60 rounded-2xl h-[200px] relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-zinc-800/10 to-transparent -translate-x-full animate-[shimmer_2s_infinite]" />
        <div className="absolute bottom-4 left-4 w-24 h-4 bg-zinc-800/50 rounded" />
      </div>

      {/* Block 4: Small Item */}
      <div className="animate-pulse bg-zinc-900/40 border border-zinc-800/60 rounded-2xl h-[200px] relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-zinc-800/10 to-transparent -translate-x-full animate-[shimmer_2s_infinite]" />
        <div className="absolute bottom-4 left-4 w-16 h-4 bg-zinc-800/50 rounded" />
      </div>

      {/* Block 5: Medium Wide Item */}
      <div className="animate-pulse bg-zinc-900/40 border border-zinc-800/60 rounded-2xl md:col-span-2 h-[200px] relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-zinc-800/10 to-transparent -translate-x-full animate-[shimmer_2s_infinite]" />
        <div className="absolute bottom-4 left-4 w-40 h-4 bg-zinc-800/50 rounded" />
      </div>

      {/* Block 6: Small Item */}
      <div className="animate-pulse bg-zinc-900/40 border border-zinc-800/60 rounded-2xl h-[200px] relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-zinc-800/10 to-transparent -translate-x-full animate-[shimmer_2s_infinite]" />
        <div className="absolute bottom-4 left-4 w-28 h-4 bg-zinc-800/50 rounded" />
      </div>
    </div>
  );
}
