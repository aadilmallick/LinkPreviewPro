import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { linkPreviewRequestSchema, previewStyleSchema, exportRequestSchema } from "@shared/schema";
import axios from "axios";
import * as cheerio from "cheerio";
import puppeteer from "puppeteer";

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
      const { url, forceRefresh } = linkPreviewRequestSchema.parse(req.body);

      // Check if we already have a cached preview (unless force refresh)
      if (!forceRefresh) {
        const existingPreview = await storage.getLinkPreview(url);
        if (existingPreview) {
          return res.json(existingPreview);
        }
      }

      // Extract metadata
      const metadata = await extractMetadata(url);
      
      // Create or update the preview
      const existingPreview = await storage.getLinkPreview(url);
      let preview;
      
      if (existingPreview && forceRefresh) {
        preview = await storage.updateLinkPreview(existingPreview.id, metadata);
      } else {
        preview = await storage.createLinkPreview({
          url,
          ...metadata,
        });
      }

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

  // Get all available styles
  app.get("/api/styles", async (req, res) => {
    try {
      const styles = await storage.getDefaultStyles();
      res.json(styles);
    } catch (error) {
      console.error('Error fetching styles:', error);
      res.status(500).json({ message: "Failed to fetch styles" });
    }
  });

  // Create custom style
  app.post("/api/styles", async (req, res) => {
    try {
      const styleData = previewStyleSchema.parse(req.body);
      const style = await storage.createPreviewStyle(styleData);
      res.json(style);
    } catch (error) {
      console.error('Error creating style:', error);
      res.status(400).json({ 
        message: error instanceof Error ? error.message : "Invalid style data" 
      });
    }
  });

  // Export preview as image
  app.post("/api/export", async (req, res) => {
    try {
      const { previewId, format, width, height, quality } = exportRequestSchema.parse(req.body);
      
      // Find the preview in storage
      const preview = Array.from((storage as any).linkPreviews.values()).find((p: any) => p.id === previewId);
      if (!preview) {
        return res.status(404).json({ message: "Preview not found" });
      }

      // Generate HTML for the preview card
      const html = generatePreviewHTML(preview, { width, height });
      
      // Launch puppeteer to render the image
      const browser = await puppeteer.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
      });
      
      const page = await browser.newPage();
      await page.setViewport({ width, height });
      await page.setContent(html, { waitUntil: 'networkidle0' });
      
      const imageBuffer = await page.screenshot({
        type: format as 'png' | 'jpeg' | 'webp',
        quality: format === 'jpeg' ? Math.round(quality * 100) : undefined,
        fullPage: false
      });
      
      await browser.close();
      
      // Set appropriate headers
      res.setHeader('Content-Type', `image/${format}`);
      res.setHeader('Content-Disposition', `attachment; filename="preview.${format}"`);
      res.send(imageBuffer);
    } catch (error) {
      console.error('Export error:', error);
      res.status(500).json({ 
        message: error instanceof Error ? error.message : "Export failed" 
      });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}

function generatePreviewHTML(preview: any, options: { width: number; height: number }) {
  const { width, height } = options;
  
  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { 
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background: #f9fafb;
            padding: 20px;
            width: ${width}px;
            height: ${height}px;
            display: flex;
            align-items: center;
            justify-content: center;
          }
          .preview-card {
            background: white;
            border-radius: 12px;
            border: 1px solid #e5e7eb;
            overflow: hidden;
            max-width: ${width - 40}px;
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
          }
          .preview-image {
            width: 100%;
            height: 200px;
            object-fit: cover;
            background: #f3f4f6;
            display: flex;
            align-items: center;
            justify-content: center;
            color: #9ca3af;
          }
          .preview-content {
            padding: 16px;
          }
          .preview-header {
            display: flex;
            align-items: center;
            gap: 8px;
            margin-bottom: 12px;
          }
          .favicon {
            width: 16px;
            height: 16px;
            border-radius: 2px;
          }
          .domain {
            font-size: 12px;
            color: #6b7280;
          }
          .title {
            font-size: 18px;
            font-weight: 600;
            color: #111827;
            margin-bottom: 8px;
            line-height: 1.3;
          }
          .description {
            font-size: 14px;
            color: #6b7280;
            line-height: 1.4;
          }
        </style>
      </head>
      <body>
        <div class="preview-card">
          ${preview.image ? `<img src="${preview.image}" alt="Preview" class="preview-image" />` : 
            '<div class="preview-image">🌐</div>'}
          <div class="preview-content">
            <div class="preview-header">
              ${preview.favicon ? `<img src="${preview.favicon}" alt="Favicon" class="favicon" />` : '🌐'}
              <span class="domain">${new URL(preview.url).hostname.replace('www.', '')}</span>
            </div>
            <div class="title">${preview.title || 'No title available'}</div>
            ${preview.description ? `<div class="description">${preview.description}</div>` : ''}
          </div>
        </div>
      </body>
    </html>
  `;
}
