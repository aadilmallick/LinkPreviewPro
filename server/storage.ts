import { linkPreviews, type LinkPreview, type InsertLinkPreview } from "@shared/schema";

export interface IStorage {
  getUser(id: number): Promise<any | undefined>;
  getUserByUsername(username: string): Promise<any | undefined>;
  createUser(user: any): Promise<any>;
  getLinkPreview(url: string): Promise<LinkPreview | undefined>;
  createLinkPreview(preview: Omit<LinkPreview, 'id' | 'createdAt'>): Promise<LinkPreview>;
}

export class MemStorage implements IStorage {
  private users: Map<number, any>;
  private linkPreviews: Map<string, LinkPreview>;
  currentId: number;
  currentPreviewId: number;

  constructor() {
    this.users = new Map();
    this.linkPreviews = new Map();
    this.currentId = 1;
    this.currentPreviewId = 1;
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
}

export const storage = new MemStorage();
