import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { api, errorSchemas } from "@shared/routes";
import { z } from "zod";
import * as cheerio from "cheerio";

async function scrapeEndpoints() {
  const categories = [
    '/shortner', '/ai', '/download', '/search', '/islam', '/stalk', '/details', '/tools', '/converter', '/arab'
  ];
  
  await storage.clearEndpoints();
  let count = 0;
  
  for (const cat of categories) {
    try {
      const response = await fetch(`https://api.bk9.dev${cat}`);
      if (!response.ok) continue;
      const html = await response.text();
      const $ = cheerio.load(html);
      
      const promises: Promise<any>[] = [];
      $('tbody tr').each((_, el) => {
        const cols = $(el).find('td');
        if (cols.length >= 6) {
          const name = $(cols[0]).text().trim();
          const returnType = $(cols[1]).text().trim();
          const description = $(cols[2]).text().trim();
          const parameters = $(cols[3]).text().trim();
          const link = $(cols[5]).find('a').attr('href') || '';
          
          if (name && link) {
            promises.push(storage.insertEndpoint({
              category: cat.replace('/', ''),
              name,
              returnType,
              description,
              parameters,
              link
            }));
            count++;
          }
        }
      });
      await Promise.all(promises);
    } catch (e) {
      console.error(`Error scraping ${cat}:`, e);
    }
  }
  return count;
}

export async function registerRoutes(httpServer: Server, app: Express): Promise<Server> {
  app.get(api.endpoints.list.path, async (req, res) => {
    try {
      const search = req.query.search as string | undefined;
      const category = req.query.category as string | undefined;
      
      const results = await storage.getEndpoints(search, category);
      res.json(results);
    } catch (e) {
      res.status(500).json({ message: "Failed to fetch endpoints" });
    }
  });

  app.post(api.endpoints.scrape.path, async (req, res) => {
    try {
      const count = await scrapeEndpoints();
      res.json({ message: "Scraping completed", count });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: "Failed to scrape endpoints" });
    }
  });
  
  // Seed initially if empty
  storage.getEndpointCount().then(async count => {
    if (count === 0) {
      console.log("Database empty, starting initial scrape...");
      await scrapeEndpoints();
      console.log("Initial scrape complete.");
    }
  }).catch(console.error);

  return httpServer;
}
