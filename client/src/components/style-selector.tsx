import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Palette, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import type { PreviewStyle } from "@/types";
import { apiRequest } from "@/lib/queryClient";

interface StyleSelectorProps {
  selectedStyleId: number | null;
  onStyleSelect: (style: PreviewStyle) => void;
}

const defaultStyles = [
  {
    name: "Default",
    borderRadius: "12px",
    borderColor: "#e5e7eb",
    backgroundColor: "#ffffff",
    textColor: "#111827",
    accentColor: "#3b82f6",
    showImage: true,
    showFavicon: true,
    layout: "horizontal",
    id: 1,
  },
  {
    name: "Dark",
    borderRadius: "8px",
    borderColor: "#374151",
    backgroundColor: "#1f2937",
    textColor: "#f9fafb",
    accentColor: "#60a5fa",
    showImage: true,
    showFavicon: true,
    layout: "horizontal",
    id: 2,
  },
  {
    name: "Minimal",
    borderRadius: "4px",
    borderColor: "#d1d5db",
    backgroundColor: "#ffffff",
    textColor: "#374151",
    accentColor: "#6b7280",
    showImage: false,
    showFavicon: true,
    layout: "compact",
    id: 3,
  },
  {
    name: "Card",
    borderRadius: "16px",
    borderColor: "#e5e7eb",
    backgroundColor: "#f9fafb",
    textColor: "#111827",
    accentColor: "#10b981",
    showImage: true,
    showFavicon: true,
    layout: "vertical",
    id: 4,
  },
];

export function StyleSelector({
  selectedStyleId,
  onStyleSelect,
}: StyleSelectorProps) {
  // const { data: styles, isLoading } = useQuery({
  //   queryKey: ["/api/styles"],
  //   staleTime: 5 * 60 * 1000, // 5 minutes
  //   queryFn: async () => {
  //     const res = await apiRequest("GET", "/api/styles");
  //     return (await res.json()) as PreviewStyle[];
  //   },
  // });

  // if (isLoading || styles === undefined || styles.length === 0) {
  //   return (
  //     <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 mb-8">
  //       <div className="flex items-center gap-2 mb-4">
  //         <Palette className="w-5 h-5 text-primary" />
  //         <h3 className="text-lg font-medium text-gray-900">Choose Style</h3>
  //       </div>
  //       <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
  //         {[...Array(4)].map((_, i) => (
  //           <Skeleton key={i} className="h-20 rounded-lg" />
  //         ))}
  //       </div>
  //     </div>
  //   );
  // }
  const styles = defaultStyles as PreviewStyle[];

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 mb-8">
      <div className="flex items-center gap-2 mb-4">
        <Palette className="w-5 h-5 text-primary" />
        <h3 className="text-lg font-medium text-gray-900">Choose Style</h3>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {styles.map((style: PreviewStyle) => (
          <StylePreview
            key={style.id}
            style={style}
            isSelected={selectedStyleId === style.id}
            onSelect={() => onStyleSelect(style)}
          />
        ))}
      </div>
    </div>
  );
}

interface StylePreviewProps {
  style: PreviewStyle;
  isSelected: boolean;
  onSelect: () => void;
}

function StylePreview({ style, isSelected, onSelect }: StylePreviewProps) {
  return (
    <button
      onClick={onSelect}
      className={`relative text-left p-3 rounded-lg border-2 transition-all duration-200 hover:scale-105 ${
        isSelected
          ? "border-primary bg-blue-50"
          : "border-gray-200 hover:border-gray-300"
      }`}
    >
      {isSelected && (
        <div className="absolute -top-2 -right-2 w-6 h-6 bg-primary rounded-full flex items-center justify-center">
          <Check className="w-3 h-3 text-white" />
        </div>
      )}

      {/* Mini preview */}
      <div
        className="w-full h-12 rounded text-xs overflow-hidden mb-2"
        style={{
          backgroundColor: style.backgroundColor,
          borderRadius: style.borderRadius,
          border: `1px solid ${style.borderColor}`,
          color: style.textColor,
        }}
      >
        <div className="p-2">
          <div className="flex items-center gap-1 mb-1">
            {style.showFavicon && (
              <div className="w-2 h-2 bg-gray-400 rounded-sm" />
            )}
            <div className="text-[8px] opacity-60">example.com</div>
          </div>
          <div className="text-[9px] font-medium truncate">Sample Title</div>
        </div>
      </div>

      <div className="text-sm font-medium text-gray-900">{style.name}</div>
      <div className="text-xs text-gray-500 capitalize">{style.layout}</div>
    </button>
  );
}
