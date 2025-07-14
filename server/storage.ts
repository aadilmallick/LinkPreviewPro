import { linkPreviews, previewStyles, type LinkPreview, type InsertLinkPreview, type PreviewStyle, type InsertPreviewStyle } from "@shared/schema";

export interface IStorage {
  getUser(id: number): Promise<any | undefined>;
  getUserByUsername(username: string): Promise<any | undefined>;
  createUser(user: any): Promise<any>;
  getLinkPreview(url: string): Promise<LinkPreview | undefined>;
  createLinkPreview(preview: Omit<LinkPreview, 'id' | 'createdAt'>): Promise<LinkPreview>;
  updateLinkPreview(id: number, preview: Partial<Omit<LinkPreview, 'id' | 'createdAt'>>): Promise<LinkPreview | undefined>;
  getPreviewStyle(id: number): Promise<PreviewStyle | undefined>;
  createPreviewStyle(style: InsertPreviewStyle): Promise<PreviewStyle>;
  getDefaultStyles(): Promise<PreviewStyle[]>;
}

export class MemStorage implements IStorage {
  private users: Map<number, any>;
  private linkPreviews: Map<string, LinkPreview>;
  private previewStyles: Map<number, PreviewStyle>;
  currentId: number;
  currentPreviewId: number;
  currentStyleId: number;

  constructor() {
    this.users = new Map();
    this.linkPreviews = new Map();
    this.previewStyles = new Map();
    this.currentId = 1;
    this.currentPreviewId = 1;
    this.currentStyleId = 1;
    
    // Initialize default styles
    this.initializeDefaultStyles();
  }

  private initializeDefaultStyles() {
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
        layout: "horizontal"
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
        layout: "horizontal"
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
        layout: "compact"
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
        layout: "vertical"
      }
    ];

    defaultStyles.forEach(style => {
      const id = this.currentStyleId++;
      const previewStyle: PreviewStyle = {
        ...style,
        id,
        createdAt: new Date(),
      };
      this.previewStyles.set(id, previewStyle);
    });
  }

  async getUser(id: number): Promise<any | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<any | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: any): Promise<any> {
    const id = this.currentId++;
    const user: any = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  async getLinkPreview(url: string): Promise<LinkPreview | undefined> {
    return this.linkPreviews.get(url);
  }

  async createLinkPreview(preview: Omit<LinkPreview, 'id' | 'createdAt'>): Promise<LinkPreview> {
    const id = this.currentPreviewId++;
    const linkPreview: LinkPreview = {
      ...preview,
      id,
      createdAt: new Date(),
    };
    this.linkPreviews.set(preview.url, linkPreview);
    return linkPreview;
  }

  async updateLinkPreview(id: number, preview: Partial<Omit<LinkPreview, 'id' | 'createdAt'>>): Promise<LinkPreview | undefined> {
    const existing = Array.from(this.linkPreviews.values()).find(p => p.id === id);
    if (!existing) return undefined;
    
    const updated: LinkPreview = { ...existing, ...preview };
    this.linkPreviews.set(existing.url, updated);
    return updated;
  }

  async getPreviewStyle(id: number): Promise<PreviewStyle | undefined> {
    return this.previewStyles.get(id);
  }

  async createPreviewStyle(style: InsertPreviewStyle): Promise<PreviewStyle> {
    const id = this.currentStyleId++;
    const previewStyle: PreviewStyle = {
      ...style,
      id,
      createdAt: new Date(),
    };
    this.previewStyles.set(id, previewStyle);
    return previewStyle;
  }

  async getDefaultStyles(): Promise<PreviewStyle[]> {
    return Array.from(this.previewStyles.values());
  }
}

export const storage = new MemStorage();
