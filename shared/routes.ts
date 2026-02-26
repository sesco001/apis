import { z } from 'zod';
import { insertEndpointSchema, endpoints } from './schema';

export const errorSchemas = {
  validation: z.object({
    message: z.string(),
    field: z.string().optional(),
  }),
  notFound: z.object({
    message: z.string(),
  }),
  internal: z.object({
    message: z.string(),
  }),
};

export const api = {
  endpoints: {
    list: {
      method: 'GET' as const,
      path: '/api/endpoints' as const,
      input: z.object({
        search: z.string().optional(),
        category: z.string().optional()
      }).optional(),
      responses: {
        200: z.array(z.custom<typeof endpoints.$inferSelect>()),
      },
    },
    scrape: {
      method: 'POST' as const,
      path: '/api/scrape' as const,
      responses: {
        200: z.object({ message: z.string(), count: z.number() }),
        500: errorSchemas.internal
      },
    },
  },
};

export function buildUrl(path: string, params?: Record<string, string | number>): string {
  let url = path;
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (url.includes(`:${key}`)) {
        url = url.replace(`:${key}`, String(value));
      }
    });
  }
  return url;
}

export type EndpointResponse = typeof endpoints.$inferSelect;
export type EndpointsListResponse = z.infer<typeof api.endpoints.list.responses[200]>;
