import { pgTable, text, serial, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const endpoints = pgTable("endpoints", {
  id: serial("id").primaryKey(),
  category: text("category").notNull(),
  name: text("name").notNull(),
  returnType: text("return_type").notNull(),
  description: text("description").notNull(),
  parameters: text("parameters").notNull(),
  link: text("link").notNull(),
  scrapedAt: timestamp("created_at").defaultNow(),
});

export const insertEndpointSchema = createInsertSchema(endpoints).omit({ id: true, scrapedAt: true });

export type Endpoint = typeof endpoints.$inferSelect;
export type InsertEndpoint = z.infer<typeof insertEndpointSchema>;
