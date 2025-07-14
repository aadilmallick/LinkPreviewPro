import { pgTable, text, serial, integer, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const linkPreviews = pgTable("link_previews", {
  id: serial("id").primaryKey(),
  url: text("url").notNull(),
  title: text("title"),
  description: text("description"),
  image: text("image"),
  favicon: text("favicon"),
  siteName: text("site_name"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const previewStyles = pgTable("preview_styles", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  borderRadius: text("border_radius").default("12px"),
  borderColor: text("border_color").default("#e5e7eb"),
  backgroundColor: text("background_color").default("#ffffff"),
  textColor: text("text_color").default("#111827"),
  accentColor: text("accent_color").default("#3b82f6"),
  showImage: boolean("show_image").default(true),
  showFavicon: boolean("show_favicon").default(true),
  layout: text("layout").default("horizontal"), // horizontal, vertical, compact
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertLinkPreviewSchema = createInsertSchema(linkPreviews).pick({
  url: true,
});

export const linkPreviewRequestSchema = z.object({
  url: z.string().url("Please enter a valid URL"),
  forceRefresh: z.boolean().optional(),
});

export const previewStyleSchema = createInsertSchema(previewStyles).omit({
  id: true,
  createdAt: true,
});

export const exportRequestSchema = z.object({
  previewId: z.number(),
  format: z.enum(["png", "jpeg", "webp"]).default("png"),
  width: z.number().min(200).max(2000).default(800),
  height: z.number().min(100).max(1000).default(400),
  quality: z.number().min(0.1).max(1).default(0.9),
});

export type LinkPreview = typeof linkPreviews.$inferSelect;
export type InsertLinkPreview = z.infer<typeof insertLinkPreviewSchema>;
export type LinkPreviewRequest = z.infer<typeof linkPreviewRequestSchema>;
export type PreviewStyle = typeof previewStyles.$inferSelect;
export type InsertPreviewStyle = z.infer<typeof previewStyleSchema>;
export type ExportRequest = z.infer<typeof exportRequestSchema>;
