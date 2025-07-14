import { useState } from "react";
import { Link } from "lucide-react";
import { LinkPreviewForm } from "@/components/link-preview-form";
import { StyledPreviewCard } from "@/components/styled-preview-card";
import { StyleSelector } from "@/components/style-selector";
import { CacheControls } from "@/components/cache-controls";
import { ExampleUrls } from "@/components/example-urls";
import { FeaturesSection } from "@/components/features-section";
import type { LinkPreview, PreviewStyle } from "@shared/schema";

export default function Home() {
  const [previewData, setPreviewData] = useState<LinkPreview | null>(null);
  const [selectedStyle, setSelectedStyle] = useState<PreviewStyle | null>(null);
  const [inputUrl, setInputUrl] = useState("");

  const handlePreviewGenerated = (preview: LinkPreview) => {
    setPreviewData(preview);
  };

  const handleExampleUrlSelect = (url: string) => {
    setInputUrl(url);
  };

  const handleStyleSelect = (style: PreviewStyle) => {
    setSelectedStyle(style);
  };

  const handlePreviewUpdated = (preview: LinkPreview) => {
    setPreviewData(preview);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
              <Link className="text-white" size={20} />
            </div>
            <div>
              <h1 className="text-2xl font-semibold text-gray-900">Link Preview Generator</h1>
              <p className="text-gray-600 text-sm">Generate beautiful preview cards for any URL</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* URL Input Form */}
        <LinkPreviewForm 
          onPreviewGenerated={handlePreviewGenerated}
          inputUrl={inputUrl}
          onInputUrlChange={setInputUrl}
        />

        {/* Style Selector */}
        <StyleSelector 
          selectedStyleId={selectedStyle?.id || null}
          onStyleSelect={handleStyleSelect}
        />

        {/* Cache Controls */}
        {previewData && (
          <CacheControls 
            preview={previewData}
            onPreviewUpdated={handlePreviewUpdated}
            currentUrl={inputUrl}
          />
        )}

        {/* Preview Card */}
        {previewData && (
          <div className="mb-8">
            <StyledPreviewCard 
              preview={previewData} 
              style={selectedStyle}
            />
          </div>
        )}

        {/* Example URLs */}
        <ExampleUrls onExampleSelect={handleExampleUrlSelect} />

        {/* Features Section */}
        <FeaturesSection />
      </div>

      {/* Footer */}
      <footer className="mt-16 bg-white border-t border-gray-200">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="text-center text-gray-500 text-sm">
            <p>Built with modern web technologies for fast and reliable link previews.</p>
            <div className="mt-2 flex items-center justify-center gap-4">
              <span className="flex items-center gap-1">
                <span className="text-xs">⚡</span>
                Open Source
              </span>
              <span className="flex items-center gap-1">
                <span className="text-xs">🚀</span>
                Fast API
              </span>
              <span className="flex items-center gap-1">
                <span className="text-xs">🔒</span>
                Secure
              </span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
