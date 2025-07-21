import { useState, RefObject } from "react";
import { Download, Loader2, Image as ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { useToast } from "@/hooks/use-toast";
import html2canvas from "html2canvas";
import type { LinkPreview, PreviewStyle } from "@/types";

interface ExportDialogProps {
  preview: LinkPreview;
  style?: PreviewStyle | null;
  cardRef: RefObject<HTMLDivElement>;
}

export function ExportDialog({ preview, style, cardRef }: ExportDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [format, setFormat] = useState<"png" | "jpeg" | "webp">("png");
  const [quality, setQuality] = useState([0.9]);
  const [isExporting, setIsExporting] = useState(false);
  const { toast } = useToast();

  const handleExport = async () => {
    if (!cardRef.current) {
      toast({
        title: "Export failed",
        description: "Preview element not found.",
        variant: "destructive",
      });
      return;
    }

    setIsExporting(true);

    try {
      const elementToCapture = cardRef.current;
      // Wait for all images to load
      // await waitForImagesToLoad(elementToCapture);
      // // Wait for fonts to load (if custom fonts are used)
      // if (document.fonts && document.fonts.ready) {
      //   await document.fonts.ready;
      // }
      const canvas = await html2canvas(elementToCapture, {
        backgroundColor: null, // Use transparent background
        scale: 2, // For better quality
        useCORS: true,
        allowTaint: true,
        ignoreElements: (element) => {
          return (
            element.id === "copy-url-button" ||
            element.id === "export-button" ||
            element.classList.contains("preview-card-actions-styled") ||
            element.classList.contains("preview-card-actions-unstyled")
          );
        },
      });

      // Restore original styles
      // elementToCapture.style.transform = originalStyles.transform;
      // elementToCapture.style.boxShadow = originalStyles.boxShadow;

      // Convert canvas to blob
      const blob = await new Promise<Blob>((resolve) => {
        canvas.toBlob(
          (blob) => {
            resolve(blob!);
          },
          `image/${format}`,
          format === "jpeg" ? quality[0] : undefined
        );
      });

      // Download the image
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `link-preview.${format}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      toast({
        title: "Export Successful!",
        description: `Your preview image has been downloaded as link-preview.${format}`,
      });
      setIsOpen(false);
    } catch (error) {
      console.error("Export error:", error);
      toast({
        title: "Export Failed",
        description: "Could not generate image. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="text-gray-500 hover:text-primary"
          disabled={isExporting}
          id="export-button"
        >
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
            <Select
              value={format}
              onValueChange={(value: any) => setFormat(value)}
            >
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
          <div className="text-sm text-gray-500">
            Export the preview card as a high-quality image.
          </div>

          {/* Quality (for JPEG/WebP) */}
          {format !== "png" && (
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
