export interface LinkPreview {
  id: number;
  url: string;
  title: string | null;
  description: string | null;
  image: string | null;
  favicon: string | null;
  siteName: string | null;
  createdAt: Date;
}

export interface LinkPreviewRequest {
  url: string;
  forceRefresh?: boolean;
}

export interface PreviewStyle {
  id: number;
  name: string;
  borderRadius: string;
  borderColor: string;
  backgroundColor: string;
  textColor: string;
  accentColor: string;
  showImage: boolean;
  showFavicon: boolean;
  layout: "horizontal" | "vertical" | "compact";
  createdAt: Date;
}
