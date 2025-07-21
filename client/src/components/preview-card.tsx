import { useState } from "react";
import { Copy, ExternalLink, Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import type { LinkPreview } from "@/types";

interface PreviewCardProps {
  preview: LinkPreview;
  hideButtons?: boolean;
}

export function PreviewCard({ preview, hideButtons }: PreviewCardProps) {
  const { toast } = useToast();
  const [imageError, setImageError] = useState(false);

  const handleCopyUrl = async () => {
    try {
      await navigator.clipboard.writeText(preview.url);
      toast({
        title: "URL copied!",
        description: "The URL has been copied to your clipboard.",
      });
    } catch (error) {
      toast({
        title: "Failed to copy URL",
        description: "Please copy the URL manually.",
        variant: "destructive",
      });
    }
  };

  const getCleanUrl = (url: string) => {
    try {
      const urlObj = new URL(url);
      return urlObj.hostname.replace("www.", "");
    } catch {
      return url;
    }
  };

  const handleImageError = () => {
    setImageError(true);
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden hover:shadow-md transition-shadow duration-200">
      {/* Open Graph Image */}
      {preview.image && !imageError ? (
        <div className="aspect-[2/1] bg-gray-100 relative overflow-hidden">
          <img
            src={preview.image}
            alt="Website preview"
            className="w-full h-full object-cover"
            onError={handleImageError}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
        </div>
      ) : (
        <div className="aspect-[2/1] bg-gray-100 flex items-center justify-center">
          <Globe className="w-12 h-12 text-gray-400" />
        </div>
      )}

      <div className="p-6">
        {/* Favicon and URL */}
        <div className="flex items-center gap-3 mb-4">
          <div className="w-6 h-6 bg-gray-200 rounded flex-shrink-0 flex items-center justify-center">
            {preview.favicon ? (
              <img
                src={preview.favicon}
                alt="Site favicon"
                className="w-4 h-4"
                onError={(e) => {
                  e.currentTarget.style.display = "none";
                  e.currentTarget.nextElementSibling?.classList.remove(
                    "hidden"
                  );
                }}
              />
            ) : null}
            <Globe
              className="w-3 h-3 text-gray-400"
              style={{ display: preview.favicon ? "none" : "block" }}
            />
          </div>
          <span className="text-sm text-gray-500 truncate">
            {getCleanUrl(preview.url)}
          </span>
        </div>

        {/* Title */}
        <h2 className="text-xl font-semibold text-gray-900 mb-3 line-clamp-2">
          {preview.title || "No title available"}
        </h2>

        {/* Description */}
        {preview.description && (
          <p className="text-gray-600 text-sm leading-relaxed line-clamp-3 mb-4">
            {preview.description}
          </p>
        )}

        {/* Actions */}
        {!hideButtons && (
          <div className="flex items-center justify-between preview-card-actions-unstyled">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleCopyUrl}
              className="text-gray-500 hover:text-primary"
            >
              <Copy className="w-4 h-4 mr-2" />
              Copy URL
            </Button>
            <Button asChild size="sm">
              <a
                href={preview.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2"
              >
                Visit Site
                <ExternalLink className="w-3 h-3" />
              </a>
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
