import { endpoints, type Endpoint, type InsertEndpoint } from "@shared/schema";
import { db } from "./db";
import { eq, ilike, and } from "drizzle-orm";

export interface IStorage {
  getEndpoints(search?: string, category?: string): Promise<Endpoint[]>;
  insertEndpoint(endpoint: InsertEndpoint): Promise<Endpoint>;
  clearEndpoints(): Promise<void>;
  getEndpointCount(): Promise<number>;
}

export class DatabaseStorage implements IStorage {
  async getEndpoints(search?: string, category?: string): Promise<Endpoint[]> {
    let query = db.select().from(endpoints).$dynamic();
    
    const conditions = [];
    if (search) {
      conditions.push(ilike(endpoints.name, `%${search}%`));
    }
    if (category) {
      conditions.push(eq(endpoints.category, category));
    }
    
    if (conditions.length > 0) {
      return await query.where(and(...conditions));
    }
    
    return await query;
  }

  async insertEndpoint(endpoint: InsertEndpoint): Promise<Endpoint> {
    const [inserted] = await db.insert(endpoints).values(endpoint).returning();
    return inserted;
  }
  
  async clearEndpoints(): Promise<void> {
    await db.delete(endpoints);
  }
  
  async getEndpointCount(): Promise<number> {
    const result = await db.select().from(endpoints);
    return result.length;
  }
}

export const storage = new DatabaseStorage();
