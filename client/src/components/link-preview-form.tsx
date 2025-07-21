import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Search, CheckCircle, AlertCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import type { LinkPreview, LinkPreviewRequest } from "@/types";

interface LinkPreviewFormProps {
  onPreviewGenerated: (preview: LinkPreview) => void;
  inputUrl: string;
  onInputUrlChange: (url: string) => void;
}

export function LinkPreviewForm({
  onPreviewGenerated,
  inputUrl,
  onInputUrlChange,
}: LinkPreviewFormProps) {
  const [validationState, setValidationState] = useState<
    "idle" | "valid" | "invalid"
  >("idle");
  const { toast } = useToast();

  const urlPattern =
    /^https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/;

  const validateUrl = (url: string) => {
    if (!url) {
      setValidationState("idle");
      return;
    }
    setValidationState(urlPattern.test(url) ? "valid" : "invalid");
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const url = e.target.value;
    onInputUrlChange(url);
    validateUrl(url);
  };

  const generatePreviewMutation = useMutation({
    mutationFn: async (data: LinkPreviewRequest) => {
      const response = await apiRequest("POST", "/api/preview", data);
      return response.json();
    },
    onSuccess: (preview: LinkPreview) => {
      onPreviewGenerated(preview);
      toast({
        title: "Preview generated successfully!",
        description: "Scroll down to see your link preview.",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to generate preview",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validationState === "valid") {
      generatePreviewMutation.mutate({ url: inputUrl });
    }
  };

  const isValid = validationState === "valid";
  const isInvalid = validationState === "invalid";
  const isLoading = generatePreviewMutation.isPending;

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 mb-8">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label
            htmlFor="url-input"
            className="block text-sm font-medium text-gray-700 mb-2"
          >
            Enter URL to preview
          </Label>
          <div className="relative">
            <Input
              id="url-input"
              type="url"
              placeholder="https://example.com"
              value={inputUrl}
              onChange={handleInputChange}
              className="w-full pr-12"
            />
            <button
              type="submit"
              disabled={!isValid || isLoading}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-primary transition-colors duration-200 disabled:opacity-50"
            >
              <Search size={16} />
            </button>
          </div>

          {/* Validation States */}
          {isInvalid && (
            <div className="mt-2 text-sm text-destructive flex items-center gap-1">
              <AlertCircle size={14} />
              Please enter a valid URL
            </div>
          )}

          {isValid && !isLoading && (
            <div className="mt-2 text-sm text-green-600 flex items-center gap-1">
              <CheckCircle size={14} />
              Valid URL detected
            </div>
          )}
        </div>

        <Button
          type="submit"
          disabled={!isValid || isLoading}
          className="w-full"
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Generating...
            </>
          ) : (
            "Generate Preview"
          )}
        </Button>
      </form>
    </div>
  );
}
