import { useState, useRef } from "react";
import { Copy, ExternalLink, Globe } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { ExportDialog } from "./export-dialog";
import type { LinkPreview, PreviewStyle } from "@shared/schema";

interface StyledPreviewCardProps {
  preview: LinkPreview;
  style?: PreviewStyle | null;
}

export function StyledPreviewCard({ preview, style }: StyledPreviewCardProps) {
  const { toast } = useToast();
  const [imageError, setImageError] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

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
      return urlObj.hostname.replace('www.', '');
    } catch {
      return url;
    }
  };

  const handleImageError = () => {
    setImageError(true);
  };

  // Use default styling if no style provided
  const cardStyle = style || {
    borderRadius: "12px",
    borderColor: "#e5e7eb",
    backgroundColor: "#ffffff",
    textColor: "#111827",
    accentColor: "#3b82f6",
    showImage: true,
    showFavicon: true,
    layout: "horizontal"
  };

  const cardClasses = `overflow-hidden hover:shadow-md transition-shadow duration-200`;
  const cardInlineStyles = {
    borderRadius: cardStyle.borderRadius,
    border: `1px solid ${cardStyle.borderColor}`,
    backgroundColor: cardStyle.backgroundColor,
    color: cardStyle.textColor,
  };

  // Layout variations
  const isVertical = cardStyle.layout === "vertical";
  const isCompact = cardStyle.layout === "compact";

  if (isCompact) {
    return (
      <div className={cardClasses} style={cardInlineStyles} ref={cardRef}>
        <div className="p-4">
          {/* Header with favicon and URL */}
          <div className="flex items-center gap-3 mb-3">
            {cardStyle.showFavicon && (
              <div className="w-6 h-6 bg-gray-200 rounded flex-shrink-0 flex items-center justify-center">
                {preview.favicon ? (
                  <img
                    src={preview.favicon}
                    alt="Site favicon"
                    className="w-4 h-4"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                ) : (
                  <Globe className="w-3 h-3 text-gray-400" />
                )}
              </div>
            )}
            <span className="text-sm opacity-60 truncate">
              {getCleanUrl(preview.url)}
            </span>
          </div>

          {/* Title */}
          <h2 className="text-lg font-semibold mb-2 line-clamp-2">
            {preview.title || 'No title available'}
          </h2>

          {/* Description */}
          {preview.description && (
            <p className="text-sm opacity-75 leading-relaxed line-clamp-2 mb-4">
              {preview.description}
            </p>
          )}

          {/* Actions */}
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleCopyUrl}
              className="opacity-60 hover:opacity-100"
              style={{ color: cardStyle.textColor }}
            >
              <Copy className="w-4 h-4 mr-2" />
              Copy
            </Button>
            <div className="flex gap-2">
              <ExportDialog preview={preview} style={style} cardRef={cardRef} />
              <Button asChild size="sm" style={{ backgroundColor: cardStyle.accentColor }}>
                <a
                  href={preview.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-white"
                >
                  Visit
                  <ExternalLink className="w-3 h-3" />
                </a>
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (isVertical) {
    return (
      <div className={cardClasses} style={cardInlineStyles} ref={cardRef}>
        {/* Image */}
        {cardStyle.showImage && preview.image && !imageError ? (
          <div className="aspect-[2/1] bg-gray-100 relative overflow-hidden">
            <img
              src={preview.image}
              alt="Website preview"
              className="w-full h-full object-cover"
              onError={handleImageError}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
          </div>
        ) : cardStyle.showImage ? (
          <div className="aspect-[2/1] bg-gray-100 flex items-center justify-center">
            <Globe className="w-12 h-12 text-gray-400" />
          </div>
        ) : null}

        <div className="p-6">
          {/* Favicon and URL */}
          <div className="flex items-center gap-3 mb-4">
            {cardStyle.showFavicon && (
              <div className="w-6 h-6 bg-gray-200 rounded flex-shrink-0 flex items-center justify-center">
                {preview.favicon ? (
                  <img
                    src={preview.favicon}
                    alt="Site favicon"
                    className="w-4 h-4"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                ) : (
                  <Globe className="w-3 h-3 text-gray-400" />
                )}
              </div>
            )}
            <span className="text-sm opacity-60 truncate">
              {getCleanUrl(preview.url)}
            </span>
          </div>

          {/* Title */}
          <h2 className="text-xl font-semibold mb-3 line-clamp-2">
            {preview.title || 'No title available'}
          </h2>

          {/* Description */}
          {preview.description && (
            <p className="text-sm opacity-75 leading-relaxed line-clamp-3 mb-4">
              {preview.description}
            </p>
          )}

          {/* Actions */}
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleCopyUrl}
              className="opacity-60 hover:opacity-100"
              style={{ color: cardStyle.textColor }}
            >
              <Copy className="w-4 h-4 mr-2" />
              Copy URL
            </Button>
            <div className="flex gap-2">
              <ExportDialog preview={preview} style={style} cardRef={cardRef} />
              <Button asChild size="sm" style={{ backgroundColor: cardStyle.accentColor }}>
                <a
                  href={preview.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-white"
                >
                  Visit Site
                  <ExternalLink className="w-3 h-3" />
                </a>
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Default horizontal layout
  return (
    <div className={cardClasses} style={cardInlineStyles} ref={cardRef}>
      <div className="flex">
        {/* Image section */}
        {cardStyle.showImage && (
          <div className="w-48 flex-shrink-0">
            {preview.image && !imageError ? (
              <div className="h-full bg-gray-100 relative overflow-hidden">
                <img
                  src={preview.image}
                  alt="Website preview"
                  className="w-full h-full object-cover"
                  onError={handleImageError}
                />
                <div className="absolute inset-0 bg-gradient-to-r from-black/10 to-transparent" />
              </div>
            ) : (
              <div className="h-full bg-gray-100 flex items-center justify-center">
                <Globe className="w-8 h-8 text-gray-400" />
              </div>
            )}
          </div>
        )}

        {/* Content section */}
        <div className="flex-1 p-6">
          {/* Favicon and URL */}
          <div className="flex items-center gap-3 mb-4">
            {cardStyle.showFavicon && (
              <div className="w-6 h-6 bg-gray-200 rounded flex-shrink-0 flex items-center justify-center">
                {preview.favicon ? (
                  <img
                    src={preview.favicon}
                    alt="Site favicon"
                    className="w-4 h-4"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                ) : (
                  <Globe className="w-3 h-3 text-gray-400" />
                )}
              </div>
            )}
            <span className="text-sm opacity-60 truncate">
              {getCleanUrl(preview.url)}
            </span>
          </div>

          {/* Title */}
          <h2 className="text-xl font-semibold mb-3 line-clamp-2">
            {preview.title || 'No title available'}
          </h2>

          {/* Description */}
          {preview.description && (
            <p className="text-sm opacity-75 leading-relaxed line-clamp-3 mb-4">
              {preview.description}
            </p>
          )}

          {/* Actions */}
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleCopyUrl}
              className="opacity-60 hover:opacity-100"
              style={{ color: cardStyle.textColor }}
            >
              <Copy className="w-4 h-4 mr-2" />
              Copy URL
            </Button>
            <div className="flex gap-2">
              <ExportDialog preview={preview} style={style} cardRef={cardRef} />
              <Button asChild size="sm" style={{ backgroundColor: cardStyle.accentColor }}>
                <a
                  href={preview.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-white"
                >
                  Visit Site
                  <ExternalLink className="w-3 h-3" />
                </a>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}