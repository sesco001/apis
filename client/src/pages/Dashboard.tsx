import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, RefreshCcw, Database, AlertCircle, Terminal } from "lucide-react";
import { useEndpoints, useScrapeEndpoints } from "@/hooks/use-endpoints";
import { EndpointCard } from "@/components/EndpointCard";
import { Skeleton } from "@/components/ui/Skeleton";
import { useToast } from "@/hooks/use-toast";

export default function Dashboard() {
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const { toast } = useToast();

  const { data: endpoints = [], isLoading, isError, error } = useEndpoints({ 
    search: search.length > 2 ? search : undefined, // Only search if > 2 chars to avoid thrashing
    category: selectedCategory 
  });
  
  const scrapeMutation = useScrapeEndpoints();

  // Extract unique categories for the filter pill bar
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

  // Local filtering if API search isn't aggressive enough
  const filteredEndpoints = useMemo(() => {
    return endpoints.filter((ep) => {
      const matchesSearch = search === "" || 
        ep.name.toLowerCase().includes(search.toLowerCase()) || 
        ep.description.toLowerCase().includes(search.toLowerCase());
      const matchesCategory = selectedCategory === "All" || ep.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [endpoints, search, selectedCategory]);

  return (
    <div className="min-h-screen bg-[#FAFAFA] dark:bg-background pb-24 selection:bg-primary selection:text-primary-foreground">
      {/* Minimalist Header */}
      <header className="sticky top-0 z-50 glass-panel border-b border-border/40">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm">
                <Terminal className="h-5 w-5" />
              </div>
              <h1 className="text-xl font-semibold tracking-tight text-foreground">
                BK9 Explorer
              </h1>
            </div>
            
            <button
              onClick={handleScrape}
              disabled={scrapeMutation.isPending}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-border bg-background px-4 py-2 text-sm font-medium text-foreground shadow-sm transition-all hover:bg-muted focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <RefreshCcw className={`h-4 w-4 ${scrapeMutation.isPending ? "animate-spin text-muted-foreground" : "text-foreground"}`} />
              <span className="hidden sm:inline">{scrapeMutation.isPending ? "Syncing..." : "Sync Data"}</span>
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-12">
        {/* Controls Section */}
        <div className="mb-10 space-y-6">
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
              />
            </div>
            
            <div className="text-sm text-muted-foreground font-medium flex items-center gap-2 bg-card border border-border/50 px-3 py-1.5 rounded-full shadow-sm">
              <Database className="w-4 h-4" />
              {filteredEndpoints.length} Endpoints
            </div>
          </div>

          {/* Category Filter Pills */}
          <div className="flex flex-wrap gap-2">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`rounded-full px-4 py-1.5 text-sm font-medium transition-all duration-200 ease-out minimal-focus ${
                  selectedCategory === category
                    ? "bg-primary text-primary-foreground shadow-sm"
                    : "bg-card border border-border/50 text-muted-foreground hover:bg-muted hover:text-foreground"
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        {/* Content Section */}
        {isError ? (
          <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-destructive/20 bg-destructive/5 py-24 text-center">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10 text-destructive">
              <AlertCircle className="h-6 w-6" />
            </div>
            <h3 className="mb-1 text-lg font-semibold text-foreground">Failed to load data</h3>
            <p className="text-sm text-muted-foreground">{error?.message || "Something went wrong"}</p>
            <button 
              onClick={() => handleScrape()}
              className="mt-6 rounded-xl bg-primary px-5 py-2 text-sm font-medium text-primary-foreground shadow-sm hover:bg-primary/90 transition-colors"
            >
              Try Syncing Now
            </button>
          </div>
        ) : isLoading ? (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 9 }).map((_, i) => (
              <div key={i} className="flex h-[240px] flex-col rounded-2xl border border-border/40 bg-card p-6 shadow-sm">
                <div className="mb-4 flex items-center justify-between">
                  <div className="space-y-3 w-full">
                    <Skeleton className="h-5 w-16 rounded-full" />
                    <Skeleton className="h-6 w-3/4" />
                  </div>
                </div>
                <Skeleton className="mb-2 h-4 w-full" />
                <Skeleton className="mb-6 h-4 w-5/6" />
                <div className="mt-auto pt-4 border-t border-border/20">
                  <Skeleton className="h-10 w-full rounded-xl" />
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
               className="mt-6 rounded-xl bg-primary px-5 py-2 text-sm font-medium text-primary-foreground shadow-sm hover:bg-primary/90 transition-colors"
             >
               Sync Data
             </button>
            )}
          </motion.div>
        ) : (
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            <AnimatePresence mode="popLayout">
              {filteredEndpoints.map((endpoint, index) => (
                <EndpointCard key={endpoint.id} endpoint={endpoint} index={index} />
              ))}
            </AnimatePresence>
          </div>
        )}
      </main>
    </div>
  );
}
