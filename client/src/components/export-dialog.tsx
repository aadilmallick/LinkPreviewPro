import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Download, Loader2, Image as ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import type { LinkPreview, ExportRequest } from "@shared/schema";

interface ExportDialogProps {
  preview: LinkPreview;
}

export function ExportDialog({ preview }: ExportDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [format, setFormat] = useState<"png" | "jpeg" | "webp">("png");
  const [width, setWidth] = useState([800]);
  const [height, setHeight] = useState([400]);
  const [quality, setQuality] = useState([0.9]);
  const { toast } = useToast();

  const exportMutation = useMutation({
    mutationFn: async (data: ExportRequest) => {
      const response = await apiRequest('POST', '/api/export', data);
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Export failed');
      }
      return response.blob();
    },
    onSuccess: (blob: Blob) => {
      // Create download link
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `preview.${format}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
      
      toast({
        title: "Export successful!",
        description: "Your preview image has been downloaded.",
      });
      setIsOpen(false);
    },
    onError: (error: Error) => {
      toast({
        title: "Export failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleExport = () => {
    exportMutation.mutate({
      previewId: preview.id,
      format,
      width: width[0],
      height: height[0],
      quality: quality[0],
    });
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
            disabled={exportMutation.isPending}
            className="w-full"
          >
            {exportMutation.isPending ? (
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