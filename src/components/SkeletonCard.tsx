import React from "react";

export default function SkeletonCard() {
  return (
    <div className="bg-bg-card rounded-2xl overflow-hidden border border-border-subtle shadow-lg animate-pulse">
      <div className="aspect-[16/10] bg-white/5" />
      <div className="p-4">
        <div className="h-4 bg-white/5 rounded w-3/4 mb-3" />
        <div className="flex gap-2">
          <div className="h-3 bg-white/5 rounded w-1/4" />
          <div className="h-3 bg-white/5 rounded w-1/4" />
        </div>
      </div>
    </div>
  );
}
