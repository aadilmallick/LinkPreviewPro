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

export const insertLinkPreviewSchema = createInsertSchema(linkPreviews).pick({
  url: true,
});

export const linkPreviewRequestSchema = z.object({
  url: z.string().url("Please enter a valid URL"),
});

export type LinkPreview = typeof linkPreviews.$inferSelect;
export type InsertLinkPreview = z.infer<typeof insertLinkPreviewSchema>;
export type LinkPreviewRequest = z.infer<typeof linkPreviewRequestSchema>;
