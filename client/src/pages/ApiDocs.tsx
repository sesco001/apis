import { useMemo, useState } from "react";
import { Link } from "wouter";
import { ArrowLeft, Zap, Copy, Check, ChevronDown, ChevronRight, Globe, Code, Terminal } from "lucide-react";
import { useEndpoints } from "@/hooks/use-endpoints";
import type { Endpoint } from "@shared/schema";

function CodeBlock({ code, language = "bash" }: { code: string; language?: string }) {
  const [copied, setCopied] = useState(false);
  const handleCopy = async () => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <div className="relative rounded-xl bg-[#1a1a2e] dark:bg-[#0d0d1a] overflow-hidden border border-border/20">
      <div className="flex items-center justify-between px-3 sm:px-4 py-2 border-b border-white/5">
        <span className="text-xs text-white/40 font-mono">{language}</span>
        <button
          onClick={handleCopy}
          className="text-white/40 hover:text-white/80 transition-colors p-1.5 rounded"
          data-testid="button-copy-code"
        >
          {copied ? <Check className="h-3.5 w-3.5 text-green-400" /> : <Copy className="h-3.5 w-3.5" />}
        </button>
      </div>
      <pre className="p-3 sm:p-4 overflow-x-auto text-xs sm:text-sm">
        <code className="text-emerald-300 font-mono text-[12px] sm:text-[13px] leading-relaxed whitespace-pre">{code}</code>
      </pre>
    </div>
  );
}

function CategorySection({ category, endpoints }: { category: string; endpoints: Endpoint[] }) {
  const [isOpen, setIsOpen] = useState(false);
  const baseUrl = typeof window !== "undefined" ? window.location.origin : "";

  return (
    <div className="border border-border/50 rounded-2xl overflow-hidden bg-card" data-testid={`docs-section-${category}`}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between gap-2 px-4 sm:px-6 py-4 text-left hover:bg-muted/50 transition-colors"
        data-testid={`docs-toggle-${category}`}
      >
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          <span className="inline-flex items-center shrink-0 rounded-full bg-gradient-to-r from-violet-100 to-indigo-100 dark:from-violet-900/30 dark:to-indigo-900/30 px-2.5 sm:px-3 py-1 text-[10px] sm:text-xs font-semibold tracking-wide text-violet-700 dark:text-violet-300 uppercase">
            {category}
          </span>
          <span className="text-xs sm:text-sm text-muted-foreground truncate">
            {endpoints.length} endpoint{endpoints.length !== 1 ? "s" : ""}
          </span>
        </div>
        {isOpen ? <ChevronDown className="h-5 w-5 text-muted-foreground shrink-0" /> : <ChevronRight className="h-5 w-5 text-muted-foreground shrink-0" />}
      </button>
      {isOpen && (
        <div className="border-t border-border/40 divide-y divide-border/30">
          {endpoints.map((ep) => (
            <div key={ep.id} className="px-4 sm:px-6 py-4 hover:bg-muted/30 transition-colors" data-testid={`doc-endpoint-${ep.id}`}>
              <div className="flex flex-col gap-1.5 mb-2">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="inline-flex items-center shrink-0 rounded-md bg-emerald-100 dark:bg-emerald-900/30 px-2 py-0.5 text-[10px] sm:text-xs font-bold text-emerald-700 dark:text-emerald-300 font-mono">
                    GET
                  </span>
                  <code className="text-xs sm:text-sm font-mono text-foreground break-all">
                    /makamesco{ep.link.split('?')[0]}
                  </code>
                </div>
              </div>
              <p className="text-xs sm:text-sm text-muted-foreground mb-3">{ep.description}</p>
              <div className="space-y-2">
                <div className="flex items-start gap-2 text-xs">
                  <span className="font-medium text-foreground shrink-0">Params:</span>
                  <div className="flex flex-wrap gap-1.5">
                    {ep.parameters.split(',').map((p) => {
                      const clean = p.trim();
                      if (!clean || clean === '-') return <span key="none" className="text-muted-foreground italic">none</span>;
                      return (
                        <code key={clean} className="rounded border border-border/50 bg-background px-1.5 py-0.5 font-mono text-[10px] sm:text-[11px]">
                          {clean}
                        </code>
                      );
                    })}
                  </div>
                </div>
                <div className="flex items-center gap-2 text-xs">
                  <span className="font-medium text-foreground">Returns:</span>
                  <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-[10px] sm:text-[11px] text-muted-foreground">{ep.returnType}</code>
                </div>
                <div className="mt-2">
                  <CodeBlock 
                    code={`curl "${baseUrl}/makamesco${ep.link}"`}
                    language="bash" 
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function ApiDocs() {
  const { data: endpoints = [], isLoading } = useEndpoints({});
  const baseUrl = typeof window !== "undefined" ? window.location.origin : "";

  const groupedEndpoints = useMemo(() => {
    const groups: Record<string, Endpoint[]> = {};
    endpoints.forEach((ep) => {
      if (!groups[ep.category]) groups[ep.category] = [];
      groups[ep.category].push(ep);
    });
    return Object.entries(groups).sort(([a], [b]) => a.localeCompare(b));
  }, [endpoints]);

  return (
    <div className="min-h-screen bg-[#FAFAFA] dark:bg-background pb-24 selection:bg-primary selection:text-primary-foreground">
      <header className="sticky top-0 z-50 glass-panel border-b border-border/40">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-14 sm:h-16 items-center justify-between">
            <Link href="/">
              <span className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors cursor-pointer" data-testid="link-back-home">
                <ArrowLeft className="h-4 w-4" />
                Back
              </span>
            </Link>
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="flex h-7 w-7 sm:h-8 sm:w-8 items-center justify-center rounded-lg bg-gradient-to-br from-violet-600 to-indigo-600 text-white shadow-sm">
                <Zap className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              </div>
              <span className="text-xs sm:text-sm font-semibold text-foreground">Makamesco Docs</span>
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 pt-8 sm:pt-12">
        <div className="mb-8 sm:mb-12">
          <h1 className="text-2xl sm:text-4xl font-bold tracking-tight text-foreground mb-3 sm:mb-4" data-testid="text-docs-title">
            API Documentation
          </h1>
          <p className="text-sm sm:text-lg text-muted-foreground max-w-2xl">
            The Makamesco API provides a unified gateway to access a wide range of services. All endpoints are accessible via a simple REST interface.
          </p>
        </div>

        <div className="mb-8 sm:mb-12 space-y-4 sm:space-y-6">
          <h2 className="text-xl sm:text-2xl font-semibold text-foreground flex items-center gap-2">
            <Globe className="h-5 w-5 text-violet-500" />
            Getting Started
          </h2>
          
          <div className="rounded-2xl border border-border/50 bg-card p-4 sm:p-6 space-y-4">
            <h3 className="font-semibold text-foreground text-sm sm:text-base">Base URL</h3>
            <CodeBlock code={`${baseUrl}/makamesco/`} language="url" />
          </div>

          <div className="rounded-2xl border border-border/50 bg-card p-4 sm:p-6 space-y-4">
            <h3 className="font-semibold text-foreground flex items-center gap-2 text-sm sm:text-base">
              <Code className="h-4 w-4 text-violet-500" />
              Quick Example
            </h3>
            <p className="text-xs sm:text-sm text-muted-foreground">Ask Gemini AI a question:</p>
            <CodeBlock 
              code={`curl "${baseUrl}/makamesco/ai/gemini?q=Hello"`}
              language="bash" 
            />
            <p className="text-xs sm:text-sm text-muted-foreground mt-2">Search Pinterest images:</p>
            <CodeBlock 
              code={`curl "${baseUrl}/makamesco/pinterest/search?q=nature"`}
              language="bash" 
            />
          </div>

          <div className="rounded-2xl border border-border/50 bg-card p-4 sm:p-6 space-y-4">
            <h3 className="font-semibold text-foreground flex items-center gap-2 text-sm sm:text-base">
              <Terminal className="h-4 w-4 text-violet-500" />
              JavaScript / Fetch Example
            </h3>
            <CodeBlock 
              code={`const response = await fetch(\n  "${baseUrl}/makamesco/ai/gemini?q=Hello"\n);\nconst data = await response.json();\nconsole.log(data);`}
              language="javascript" 
            />
          </div>

          <div className="rounded-2xl border border-border/50 bg-card p-4 sm:p-6 space-y-4">
            <h3 className="font-semibold text-foreground text-sm sm:text-base">Response Format</h3>
            <p className="text-xs sm:text-sm text-muted-foreground">Most endpoints return JSON. Some endpoints (like TTS or screenshots) return binary data (Buffer). Check the return type for each endpoint.</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-3">
              <div className="rounded-lg border border-border/40 bg-muted/30 p-3">
                <code className="text-xs font-mono font-semibold text-foreground">Json</code>
                <p className="text-xs text-muted-foreground mt-1">Returns a JSON object</p>
              </div>
              <div className="rounded-lg border border-border/40 bg-muted/30 p-3">
                <code className="text-xs font-mono font-semibold text-foreground">Buffer</code>
                <p className="text-xs text-muted-foreground mt-1">Returns binary data (audio, images, PDFs)</p>
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-4 sm:space-y-6">
          <h2 className="text-xl sm:text-2xl font-semibold text-foreground mb-4 sm:mb-6">
            Endpoints by Category
          </h2>
          
          {isLoading ? (
            <div className="space-y-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="h-14 sm:h-16 rounded-2xl bg-muted animate-pulse" />
              ))}
            </div>
          ) : (
            <div className="space-y-3 sm:space-y-4">
              {groupedEndpoints.map(([category, eps]) => (
                <CategorySection key={category} category={category} endpoints={eps} />
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
