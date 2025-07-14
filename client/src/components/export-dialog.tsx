import { useState } from "react";
import { Download, Loader2, Image as ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { useToast } from "@/hooks/use-toast";
import html2canvas from "html2canvas";
import type { LinkPreview, PreviewStyle } from "@shared/schema";

interface ExportDialogProps {
  preview: LinkPreview;
  style?: PreviewStyle | null;
}

export function ExportDialog({ preview, style }: ExportDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [format, setFormat] = useState<"png" | "jpeg" | "webp">("png");
  const [width, setWidth] = useState([800]);
  const [height, setHeight] = useState([400]);
  const [quality, setQuality] = useState([0.9]);
  const [isExporting, setIsExporting] = useState(false);
  const { toast } = useToast();

  const handleExport = async () => {
    setIsExporting(true);
    
    try {
      // Create a temporary preview element for export
      const exportElement = await createExportElement();
      
      // Capture the element as canvas
      const canvas = await html2canvas(exportElement, {
        width: width[0],
        height: height[0],
        backgroundColor: style?.backgroundColor || '#ffffff',
        scale: 2, // For better quality
        useCORS: true,
        allowTaint: true,
      });
      
      // Convert canvas to blob
      const blob = await new Promise<Blob>((resolve) => {
        canvas.toBlob((blob) => {
          resolve(blob!);
        }, `image/${format}`, format === 'jpeg' ? quality[0] : undefined);
      });
      
      // Download the image
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `preview.${format}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      // Clean up
      document.body.removeChild(exportElement);
      
      toast({
        title: "Export successful!",
        description: "Your preview image has been downloaded.",
      });
      setIsOpen(false);
    } catch (error) {
      console.error('Export error:', error);
      toast({
        title: "Export failed",
        description: "Failed to generate image. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsExporting(false);
    }
  };

  const createExportElement = async (): Promise<HTMLElement> => {
    // Create a temporary container
    const container = document.createElement('div');
    container.style.position = 'fixed';
    container.style.top = '-9999px';
    container.style.left = '-9999px';
    container.style.width = `${width[0]}px`;
    container.style.height = `${height[0]}px`;
    container.style.padding = '20px';
    container.style.backgroundColor = '#f9fafb';
    container.style.fontFamily = '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
    
    // Create the preview card
    const cardElement = document.createElement('div');
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
    
    cardElement.style.borderRadius = cardStyle.borderRadius!;
    cardElement.style.border = `1px solid ${cardStyle.borderColor}`;
    cardElement.style.backgroundColor = cardStyle.backgroundColor!;
    cardElement.style.color = cardStyle.textColor!;
    cardElement.style.overflow = 'hidden';
    cardElement.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1)';
    cardElement.style.maxWidth = `${width[0] - 40}px`;
    cardElement.style.margin = 'auto';
    
    // Build the card content based on layout
    const getCleanUrl = (url: string) => {
      try {
        const urlObj = new URL(url);
        return urlObj.hostname.replace('www.', '');
      } catch {
        return url;
      }
    };
    
    if (cardStyle.layout === 'vertical') {
      cardElement.innerHTML = `
        ${cardStyle.showImage && preview.image ? 
          `<div style="aspect-ratio: 2/1; background: #f3f4f6; position: relative; overflow: hidden;">
             <img src="${preview.image}" alt="Preview" style="width: 100%; height: 100%; object-fit: cover;" onerror="this.style.display='none'" />
           </div>` : 
          cardStyle.showImage ? 
            '<div style="aspect-ratio: 2/1; background: #f3f4f6; display: flex; align-items: center; justify-content: center; font-size: 24px; color: #9ca3af;">🌐</div>' : 
            ''
        }
        <div style="padding: 16px;">
          <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 12px; font-size: 12px; opacity: 0.6;">
            ${cardStyle.showFavicon && preview.favicon ? 
              `<img src="${preview.favicon}" alt="Favicon" style="width: 16px; height: 16px; border-radius: 2px;" onerror="this.textContent='🌐'; this.style.width='auto'" />` : 
              cardStyle.showFavicon ? '🌐' : ''
            }
            <span>${getCleanUrl(preview.url)}</span>
          </div>
          <h2 style="font-size: 18px; font-weight: 600; margin-bottom: 8px; line-height: 1.3;">
            ${preview.title || 'No title available'}
          </h2>
          ${preview.description ? 
            `<p style="font-size: 14px; opacity: 0.75; line-height: 1.4; display: -webkit-box; -webkit-line-clamp: 3; -webkit-box-orient: vertical; overflow: hidden;">
               ${preview.description}
             </p>` : 
            ''
          }
        </div>
      `;
    } else {
      // Horizontal layout (default)
      cardElement.innerHTML = `
        <div style="display: flex;">
          ${cardStyle.showImage ? 
            `<div style="width: 192px; flex-shrink: 0;">
               ${preview.image ? 
                 `<img src="${preview.image}" alt="Preview" style="width: 100%; height: 100%; object-fit: cover; background: #f3f4f6;" onerror="this.style.display='none'; this.parentElement.innerHTML='<div style=\"height: 100%; background: #f3f4f6; display: flex; align-items: center; justify-content: center; font-size: 24px; color: #9ca3af;\">🌐</div>'" />` :
                 '<div style="height: 100%; background: #f3f4f6; display: flex; align-items: center; justify-content: center; font-size: 24px; color: #9ca3af;">🌐</div>'
               }
             </div>` : 
            ''
          }
          <div style="flex: 1; padding: 16px;">
            <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 12px; font-size: 12px; opacity: 0.6;">
              ${cardStyle.showFavicon && preview.favicon ? 
                `<img src="${preview.favicon}" alt="Favicon" style="width: 16px; height: 16px; border-radius: 2px;" onerror="this.textContent='🌐'; this.style.width='auto'" />` : 
                cardStyle.showFavicon ? '🌐' : ''
              }
              <span>${getCleanUrl(preview.url)}</span>
            </div>
            <h2 style="font-size: 18px; font-weight: 600; margin-bottom: 8px; line-height: 1.3;">
              ${preview.title || 'No title available'}
            </h2>
            ${preview.description ? 
              `<p style="font-size: 14px; opacity: 0.75; line-height: 1.4; display: -webkit-box; -webkit-line-clamp: 3; -webkit-box-orient: vertical; overflow: hidden;">
                 ${preview.description}
               </p>` : 
              ''
            }
          </div>
        </div>
      `;
    }
    
    container.appendChild(cardElement);
    document.body.appendChild(container);
    
    // Wait for images to load
    const images = container.querySelectorAll('img');
    await Promise.allSettled(Array.from(images).map(img => {
      return new Promise((resolve) => {
        if (img.complete) {
          resolve(null);
        } else {
          img.onload = () => resolve(null);
          img.onerror = () => resolve(null);
          setTimeout(() => resolve(null), 3000); // Timeout after 3 seconds
        }
      });
    }));
    
    return container;
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="text-gray-500 hover:text-primary">
          <Download className="w-4 h-4 mr-2" />
          Export Image
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ImageIcon className="w-5 h-5" />
            Export Preview
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Format Selection */}
          <div className="space-y-2">
            <Label htmlFor="format">Image Format</Label>
            <Select value={format} onValueChange={(value: any) => setFormat(value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="png">PNG (Lossless)</SelectItem>
                <SelectItem value="jpeg">JPEG (Compressed)</SelectItem>
                <SelectItem value="webp">WebP (Modern)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Dimensions */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Width: {width[0]}px</Label>
              <Slider
                value={width}
                onValueChange={setWidth}
                min={200}
                max={2000}
                step={50}
                className="w-full"
              />
            </div>
            <div className="space-y-2">
              <Label>Height: {height[0]}px</Label>
              <Slider
                value={height}
                onValueChange={setHeight}
                min={100}
                max={1000}
                step={25}
                className="w-full"
              />
            </div>
          </div>

          {/* Quality (for JPEG) */}
          {format === 'jpeg' && (
            <div className="space-y-2">
              <Label>Quality: {Math.round(quality[0] * 100)}%</Label>
              <Slider
                value={quality}
                onValueChange={setQuality}
                min={0.1}
                max={1}
                step={0.1}
                className="w-full"
              />
            </div>
          )}

          {/* Preview Info */}
          <div className="bg-gray-50 rounded-lg p-3 text-sm">
            <div className="font-medium text-gray-900 mb-1">Preview Details</div>
            <div className="text-gray-600 space-y-1">
              <div>Size: {width[0]} × {height[0]}px</div>
              <div>Format: {format.toUpperCase()}</div>
              {format === 'jpeg' && <div>Quality: {Math.round(quality[0] * 100)}%</div>}
            </div>
          </div>

          {/* Export Button */}
          <Button 
            onClick={handleExport} 
            disabled={isExporting}
            className="w-full"
          >
            {isExporting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Exporting...
              </>
            ) : (
              <>
                <Download className="mr-2 h-4 w-4" />
                Export Image
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}