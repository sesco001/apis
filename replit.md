# Makamesco API

A full-stack API gateway platform that scrapes endpoints from `api.bk9.dev` and provides a branded proxy service under the "Makamesco" name.

## Architecture

- **Frontend**: React + Vite + TailwindCSS + Framer Motion
- **Backend**: Express.js with proxy middleware
- **Database**: PostgreSQL (Drizzle ORM)
- **Scraping**: Cheerio for HTML parsing

## Key Features

- Scrapes BK9 API documentation pages to extract all available endpoints
- Provides a proxy at `/makamesco/...` that forwards requests to `api.bk9.dev`
- Dashboard page showing all endpoints with search and category filtering
- API documentation page at `/docs` with curl examples and usage guides
- Copy-to-clipboard for endpoint URLs
- "Try It" buttons that test endpoints via the proxy

## Routes

- `/` - Dashboard with endpoint cards
- `/docs` - API documentation page
- `/api/endpoints` - List scraped endpoints (supports `?search=` and `?category=` query params)
- `/api/scrape` - POST to re-scrape BK9 and refresh the database
- `/makamesco/*` - Proxy route that forwards to `api.bk9.dev`

## Database Schema

- `endpoints` table: id, category, name, return_type, description, parameters, link, created_at

## Dependencies

- cheerio (HTML scraping)
- framer-motion (animations)
- lucide-react (icons)
- wouter (routing)
- @tanstack/react-query (data fetching)
- drizzle-orm + drizzle-zod (database)
