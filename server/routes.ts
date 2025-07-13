import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { linkPreviewRequestSchema } from "@shared/schema";
import axios from "axios";
import * as cheerio from "cheerio";

async function extractMetadata(url: string) {
  try {
    const response = await axios.get(url, {
      timeout: 10000,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    });

    const $ = cheerio.load(response.data);
    
    // Extract metadata with fallbacks
    const title = 
      $('meta[property="og:title"]').attr('content') ||
      $('meta[name="twitter:title"]').attr('content') ||
      $('title').text() ||
      '';

    const description = 
      $('meta[property="og:description"]').attr('content') ||
      $('meta[name="twitter:description"]').attr('content') ||
      $('meta[name="description"]').attr('content') ||
      '';

    const image = 
      $('meta[property="og:image"]').attr('content') ||
      $('meta[name="twitter:image"]').attr('content') ||
      '';

    const siteName = 
      $('meta[property="og:site_name"]').attr('content') ||
      '';

    // Extract favicon
    let favicon = '';
    const faviconSelectors = [
      'link[rel="icon"]',
      'link[rel="shortcut icon"]',
      'link[rel="apple-touch-icon"]'
    ];
    
    for (const selector of faviconSelectors) {
      const href = $(selector).attr('href');
      if (href) {
        favicon = href.startsWith('http') ? href : new URL(href, url).href;
        break;
      }
    }

    // Fallback to /favicon.ico
    if (!favicon) {
      try {
        const faviconUrl = new URL('/favicon.ico', url).href;
        await axios.head(faviconUrl, { timeout: 3000 });
        favicon = faviconUrl;
      } catch {
        // Favicon doesn't exist, leave empty
      }
    }

    // Make image URL absolute if relative
    const absoluteImage = image && !image.startsWith('http') 
      ? new URL(image, url).href 
      : image;

    return {
      title: title.trim(),
      description: description.trim(),
      image: absoluteImage,
      favicon,
      siteName: siteName.trim(),
    };
  } catch (error) {
    console.error('Error extracting metadata:', error);
    throw new Error('Failed to extract metadata from URL');
  }
}

export async function registerRoutes(app: Express): Promise<Server> {
  app.post("/api/preview", async (req, res) => {
    try {
      const { url } = linkPreviewRequestSchema.parse(req.body);

      // Check if we already have a cached preview
      const existingPreview = await storage.getLinkPreview(url);
      if (existingPreview) {
        return res.json(existingPreview);
      }

      // Extract metadata
      const metadata = await extractMetadata(url);
      
      // Create and store the preview
      const preview = await storage.createLinkPreview({
        url,
        ...metadata,
      });

      res.json(preview);
    } catch (error) {
      console.error('Preview generation error:', error);
      
      if (error instanceof Error && error.message === 'Failed to extract metadata from URL') {
        return res.status(400).json({ 
          message: "Unable to generate preview for this URL. The site may be blocking requests or is temporarily unavailable." 
        });
      }
      
      res.status(400).json({ 
        message: error instanceof Error ? error.message : "Invalid request" 
      });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
