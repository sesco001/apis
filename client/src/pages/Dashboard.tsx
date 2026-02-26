import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { Search, RefreshCcw, Database, AlertCircle, Zap, BookOpen, Bot, Download, Globe, Moon, Eye, Info, Wrench, Repeat, Flame, Link as LinkIcon } from "lucide-react";
import { useEndpoints, useScrapeEndpoints } from "@/hooks/use-endpoints";
import { EndpointCard } from "@/components/EndpointCard";
import { Skeleton } from "@/components/ui/Skeleton";
import { useToast } from "@/hooks/use-toast";
import { Link } from "wouter";
import type { Endpoint } from "@shared/schema";

const categoryMeta: Record<string, { label: string; icon: typeof Bot; color: string }> = {
  ai: { label: "AI", icon: Bot, color: "from-purple-500 to-violet-600" },
  download: { label: "Downloaders", icon: Download, color: "from-blue-500 to-cyan-600" },
  search: { label: "Search", icon: Globe, color: "from-emerald-500 to-teal-600" },
  islam: { label: "Islamic", icon: Moon, color: "from-amber-500 to-yellow-600" },
  stalk: { label: "Stalker", icon: Eye, color: "from-pink-500 to-rose-600" },
  details: { label: "Details", icon: Info, color: "from-sky-500 to-blue-600" },
  tools: { label: "Tools", icon: Wrench, color: "from-orange-500 to-red-500" },
  converter: { label: "Converters", icon: Repeat, color: "from-indigo-500 to-purple-600" },
  arab: { label: "Arab", icon: Flame, color: "from-red-500 to-orange-600" },
  shortner: { label: "Shortener", icon: LinkIcon, color: "from-teal-500 to-green-600" },
};

function getCategoryInfo(cat: string) {
  return categoryMeta[cat] || { label: cat, icon: Globe, color: "from-gray-500 to-gray-600" };
}

function CategoryGroup({ category, endpoints, startIndex }: { category: string; endpoints: Endpoint[]; startIndex: number }) {
  const info = getCategoryInfo(category);
  const Icon = info.icon;

  return (
    <section className="mb-8 sm:mb-12" data-testid={`section-${category}`}>
      <div className="flex items-center gap-2.5 sm:gap-3 mb-4 sm:mb-6">
        <div className={`flex h-8 w-8 sm:h-10 sm:w-10 items-center justify-center rounded-lg sm:rounded-xl bg-gradient-to-br ${info.color} text-white shadow-sm`}>
          <Icon className="h-4 w-4 sm:h-5 sm:w-5" />
        </div>
        <div>
          <h3 className="text-lg sm:text-xl font-semibold text-foreground" data-testid={`text-category-title-${category}`}>
            {info.label}
          </h3>
          <p className="text-[11px] sm:text-xs text-muted-foreground">
            {endpoints.length} endpoint{endpoints.length !== 1 ? "s" : ""}
          </p>
        </div>
      </div>
      <div className="grid grid-cols-1 gap-3 sm:gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {endpoints.map((endpoint, index) => (
          <EndpointCard key={endpoint.id} endpoint={endpoint} index={startIndex + index} />
        ))}
      </div>
    </section>
  );
}

export default function Dashboard() {
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const { toast } = useToast();

  const { data: endpoints = [], isLoading, isError, error } = useEndpoints({ 
    search: search.length > 2 ? search : undefined,
    category: selectedCategory 
  });
  
  const scrapeMutation = useScrapeEndpoints();

  const categories = useMemo(() => {
    if (!endpoints.length) return ["All"];
    const unique = new Set(endpoints.map((ep) => ep.category));
    return ["All", ...Array.from(unique)].sort();
  }, [endpoints]);

  const handleScrape = async () => {
    try {
      const result = await scrapeMutation.mutateAsync();
      toast({
        title: "Sync Complete",
        description: result.message || `Successfully synced ${result.count} endpoints.`,
      });
    } catch (err) {
      toast({
        title: "Sync Failed",
        description: err instanceof Error ? err.message : "An unknown error occurred",
        variant: "destructive",
      });
    }
  };

  const filteredEndpoints = useMemo(() => {
    return endpoints.filter((ep) => {
      const matchesSearch = search === "" || 
        ep.name.toLowerCase().includes(search.toLowerCase()) || 
        ep.description.toLowerCase().includes(search.toLowerCase());
      const matchesCategory = selectedCategory === "All" || ep.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [endpoints, search, selectedCategory]);

  const groupedEndpoints = useMemo(() => {
    const groups: Record<string, Endpoint[]> = {};
    const order = ["ai", "download", "search", "islam", "stalk", "details", "tools", "converter", "arab", "shortner"];
    
    filteredEndpoints.forEach((ep) => {
      if (!groups[ep.category]) groups[ep.category] = [];
      groups[ep.category].push(ep);
    });

    return order
      .filter((cat) => groups[cat])
      .map((cat) => ({ category: cat, endpoints: groups[cat] }))
      .concat(
        Object.keys(groups)
          .filter((cat) => !order.includes(cat))
          .map((cat) => ({ category: cat, endpoints: groups[cat] }))
      );
  }, [filteredEndpoints]);

  let runningIndex = 0;

  return (
    <div className="min-h-screen bg-[#FAFAFA] dark:bg-background pb-24 selection:bg-primary selection:text-primary-foreground">
      <header className="sticky top-0 z-50 glass-panel border-b border-border/40">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-14 sm:h-16 items-center justify-between gap-2 sm:gap-4">
            <div className="flex items-center gap-2 sm:gap-3 min-w-0">
              <div className="flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-lg sm:rounded-xl bg-gradient-to-br from-violet-600 to-indigo-600 text-white shadow-sm shrink-0">
                <Zap className="h-4 w-4 sm:h-5 sm:w-5" />
              </div>
              <h1 className="text-base sm:text-xl font-semibold tracking-tight text-foreground truncate" data-testid="text-brand-name">
                Makamesco API
              </h1>
            </div>
            
            <div className="flex items-center gap-2">
              <Link href="/docs">
                <span
                  className="inline-flex items-center justify-center gap-2 rounded-xl border border-border bg-background px-4 py-2 text-sm font-medium text-foreground shadow-sm transition-all hover:bg-muted cursor-pointer"
                  data-testid="link-api-docs"
                >
                  <BookOpen className="h-4 w-4" />
                  <span className="hidden sm:inline">API Docs</span>
                </span>
              </Link>
              <button
                onClick={handleScrape}
                disabled={scrapeMutation.isPending}
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-border bg-background px-4 py-2 text-sm font-medium text-foreground shadow-sm transition-all hover:bg-muted focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                data-testid="button-sync-data"
              >
                <RefreshCcw className={`h-4 w-4 ${scrapeMutation.isPending ? "animate-spin text-muted-foreground" : "text-foreground"}`} />
                <span className="hidden sm:inline">{scrapeMutation.isPending ? "Syncing..." : "Sync Data"}</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-6 sm:pt-12">
        <div className="mb-6 sm:mb-10 space-y-3 sm:space-y-4">
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground" data-testid="text-hero-title">
              Your API Gateway
            </h2>
            <p className="mt-1.5 sm:mt-2 text-sm sm:text-base text-muted-foreground max-w-2xl">
              Access all endpoints through <code className="rounded bg-muted px-1 sm:px-1.5 py-0.5 font-mono text-[11px] sm:text-xs text-foreground">/makamesco/</code> prefix. Full proxy with JSON and binary support.
            </p>
          </div>
        </div>

        <div className="mb-6 sm:mb-10 space-y-4 sm:space-y-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="relative max-w-md flex-1">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5">
                <Search className="h-4 w-4 text-muted-foreground" />
              </div>
              <input
                type="text"
                placeholder="Search endpoints, descriptions..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="block w-full rounded-2xl border border-border/60 bg-card py-3 pl-10 pr-4 text-sm text-foreground placeholder:text-muted-foreground shadow-sm transition-all focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                data-testid="input-search"
              />
            </div>
            
            <div className="text-sm text-muted-foreground font-medium flex items-center gap-2 bg-card border border-border/50 px-3 py-1.5 rounded-full shadow-sm" data-testid="text-endpoint-count">
              <Database className="w-4 h-4" />
              {filteredEndpoints.length} Endpoints
            </div>
          </div>

          <div className="flex flex-wrap gap-2" data-testid="filter-categories">
            {categories.map((category) => {
              const info = getCategoryInfo(category);
              return (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  data-testid={`button-category-${category}`}
                  className={`rounded-full px-4 py-1.5 text-sm font-medium transition-all duration-200 ease-out minimal-focus ${
                    selectedCategory === category
                      ? `bg-gradient-to-r ${category === "All" ? "from-violet-600 to-indigo-600" : info.color} text-white shadow-sm`
                      : "bg-card border border-border/50 text-muted-foreground hover:bg-muted hover:text-foreground"
                  }`}
                >
                  {category === "All" ? "All" : info.label}
                </button>
              );
            })}
          </div>
        </div>

        {isError ? (
          <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-destructive/20 bg-destructive/5 py-24 text-center">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10 text-destructive">
              <AlertCircle className="h-6 w-6" />
            </div>
            <h3 className="mb-1 text-lg font-semibold text-foreground">Failed to load data</h3>
            <p className="text-sm text-muted-foreground">{error?.message || "Something went wrong"}</p>
            <button 
              onClick={() => handleScrape()}
              className="mt-6 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 px-5 py-2 text-sm font-medium text-white shadow-sm hover:opacity-90 transition-colors"
              data-testid="button-retry-sync"
            >
              Try Syncing Now
            </button>
          </div>
        ) : isLoading ? (
          <div className="space-y-12">
            {Array.from({ length: 3 }).map((_, gi) => (
              <div key={gi}>
                <div className="flex items-center gap-3 mb-6">
                  <Skeleton className="h-10 w-10 rounded-xl" />
                  <div className="space-y-2">
                    <Skeleton className="h-5 w-24" />
                    <Skeleton className="h-3 w-16" />
                  </div>
                </div>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="flex h-[280px] flex-col rounded-2xl border border-border/40 bg-card p-6 shadow-sm">
                      <Skeleton className="h-5 w-16 rounded-full mb-3" />
                      <Skeleton className="h-6 w-3/4 mb-4" />
                      <Skeleton className="h-4 w-full mb-2" />
                      <Skeleton className="h-4 w-5/6 mb-6" />
                      <div className="mt-auto pt-4 border-t border-border/20">
                        <Skeleton className="h-10 w-full rounded-xl" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : filteredEndpoints.length === 0 ? (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-border py-24 text-center"
          >
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-muted text-muted-foreground">
              <Search className="h-6 w-6" />
            </div>
            <h3 className="mb-1 text-lg font-semibold text-foreground">No endpoints found</h3>
            <p className="text-sm text-muted-foreground max-w-sm">
              We couldn't find any endpoints matching your current filters. 
              {endpoints.length === 0 && " Try syncing data from the source."}
            </p>
            {endpoints.length === 0 && (
               <button 
               onClick={() => handleScrape()}
               className="mt-6 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 px-5 py-2 text-sm font-medium text-white shadow-sm hover:opacity-90 transition-colors"
               data-testid="button-sync-empty"
             >
               Sync Data
             </button>
            )}
          </motion.div>
        ) : (
          <div>
            {groupedEndpoints.map((group) => {
              const si = runningIndex;
              runningIndex += group.endpoints.length;
              return (
                <CategoryGroup
                  key={group.category}
                  category={group.category}
                  endpoints={group.endpoints}
                  startIndex={si}
                />
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
