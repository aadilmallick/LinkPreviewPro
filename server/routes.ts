// @ts-types=@types/express
import type { Express } from "npm:express";
import { createServer, type Server } from "node:http";
import axios from "npm:axios";
import * as cheerio from "npm:cheerio";
import { z } from "npm:zod";

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

async function extractMetadata(url: string) {
  try {
    const response = await axios.get(url, {
      timeout: 10000,
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
      },
    });

    const $ = cheerio.load(response.data);

    // Extract metadata with fallbacks
    const title =
      $('meta[property="og:title"]').attr("content") ||
      $('meta[name="twitter:title"]').attr("content") ||
      $("title").text() ||
      "";

    const description =
      $('meta[property="og:description"]').attr("content") ||
      $('meta[name="twitter:description"]').attr("content") ||
      $('meta[name="description"]').attr("content") ||
      "";

    const image =
      $('meta[property="og:image"]').attr("content") ||
      $('meta[name="twitter:image"]').attr("content") ||
      "";

    const siteName = $('meta[property="og:site_name"]').attr("content") || "";

    // Extract favicon
    let favicon = "";
    const faviconSelectors = [
      'link[rel="icon"]',
      'link[rel="shortcut icon"]',
      'link[rel="apple-touch-icon"]',
    ];

    for (const selector of faviconSelectors) {
      const href = $(selector).attr("href");
      if (href) {
        favicon = href.startsWith("http") ? href : new URL(href, url).href;
        break;
      }
    }

    // Fallback to /favicon.ico
    if (!favicon) {
      try {
        const faviconUrl = new URL("/favicon.ico", url).href;
        await axios.head(faviconUrl, { timeout: 3000 });
        favicon = faviconUrl;
      } catch {
        // Favicon doesn't exist, leave empty
      }
    }

    // Make image URL absolute if relative
    const absoluteImage =
      image && !image.startsWith("http") ? new URL(image, url).href : image;

    return {
      title: title.trim(),
      description: description.trim(),
      image: absoluteImage,
      favicon,
      siteName: siteName.trim(),
    };
  } catch (error) {
    console.error("Error extracting metadata:", error);
    throw new Error("Failed to extract metadata from URL");
  }
}

const linkPreviewRequestSchema = z.object({
  url: z.string().url("Please enter a valid URL"),
  forceRefresh: z.boolean().optional(),
});
export function registerRoutes(app: Express): Express {
  app.post("/api/preview", async (req, res) => {
    try {
      const { url } = linkPreviewRequestSchema.parse(req.body);

      // Extract metadata
      const metadata = await extractMetadata(url);

      // Create or update the preview
      res.json(metadata);
    } catch (error) {
      console.error("Preview generation error:", error);

      if (
        error instanceof Error &&
        error.message === "Failed to extract metadata from URL"
      ) {
        return res.status(400).json({
          message:
            "Unable to generate preview for this URL. The site may be blocking requests or is temporarily unavailable.",
        });
      }

      res.status(400).json({
        message: error instanceof Error ? error.message : "Invalid request",
      });
    }
  });

  // Get all available styles
  app.get("/api/styles", (req, res) => {
    try {
      res.json(defaultStyles);
    } catch (error) {
      console.error("Error fetching styles:", error);
      res.status(500).json({ message: "Failed to fetch styles" });
    }
  });

  return app;
}
