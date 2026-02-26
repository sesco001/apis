import { useState } from "react";
import { motion } from "framer-motion";
import { ExternalLink, Copy, Check, Braces } from "lucide-react";
import type { EndpointResponse } from "@shared/routes";

interface EndpointCardProps {
  endpoint: EndpointResponse;
  index: number;
}

export function EndpointCard({ endpoint, index }: EndpointCardProps) {
  const [copied, setCopied] = useState(false);
  const makamescoPath = `/makamesco${endpoint.link}`;
  const makamescoUrl = `${window.location.origin}${makamescoPath}`;

  const handleCopy = async () => {
    await navigator.clipboard.writeText(makamescoUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.03, ease: [0.21, 0.47, 0.32, 0.98] }}
      className="group relative flex flex-col justify-between rounded-2xl border border-border/60 bg-card p-6 shadow-sm transition-all duration-300 hover:border-border hover:shadow-md hover:-translate-y-1"
      data-testid={`card-endpoint-${endpoint.id}`}
    >
      <div>
        <div className="mb-4 flex items-start justify-between gap-4">
          <div>
            <h3 className="text-lg font-semibold leading-tight text-foreground line-clamp-1" title={endpoint.name}>
              {endpoint.name}
            </h3>
          </div>
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-muted/50 text-muted-foreground transition-colors group-hover:bg-violet-50 group-hover:text-violet-600 dark:group-hover:bg-violet-900/20 dark:group-hover:text-violet-400">
            <Braces className="h-4 w-4" />
          </div>
        </div>

        <p className="mb-4 text-sm text-muted-foreground line-clamp-2" title={endpoint.description}>
          {endpoint.description}
        </p>

        <div className="mb-4 space-y-3">
          <div className="flex items-center gap-2 text-xs">
            <span className="font-medium text-foreground">Returns:</span>
            <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-[11px] text-muted-foreground">
              {endpoint.returnType}
            </code>
          </div>
          
          <div className="flex items-start gap-2 text-xs">
            <span className="mt-0.5 font-medium text-foreground shrink-0">Params:</span>
            <div className="flex flex-wrap gap-1.5">
              {endpoint.parameters.split(',').map((param) => {
                const cleanParam = param.trim();
                if (!cleanParam || cleanParam.toLowerCase() === 'none' || cleanParam === '-') {
                  return <span key="none" className="text-muted-foreground italic mt-0.5">none</span>;
                }
                return (
                  <code key={cleanParam} className="rounded border border-border/50 bg-background px-1.5 py-0.5 font-mono text-[11px] text-foreground shadow-sm">
                    {cleanParam}
                  </code>
                );
              })}
            </div>
          </div>
        </div>

        <div className="mb-4 rounded-lg bg-muted/50 p-2.5 border border-border/30">
          <div className="flex items-center justify-between gap-2">
            <code className="text-[11px] font-mono text-muted-foreground truncate flex-1" data-testid={`text-endpoint-url-${endpoint.id}`}>
              /makamesco{endpoint.link.split('?')[0]}
            </code>
            <button
              onClick={handleCopy}
              className="shrink-0 rounded-md p-1 text-muted-foreground hover:bg-background hover:text-foreground transition-colors"
              title="Copy full URL"
              data-testid={`button-copy-${endpoint.id}`}
            >
              {copied ? <Check className="h-3.5 w-3.5 text-green-500" /> : <Copy className="h-3.5 w-3.5" />}
            </button>
          </div>
        </div>
      </div>

      <div className="pt-4 border-t border-border/40 mt-auto flex gap-2">
        <a
          href={makamescoPath}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition-all duration-200 hover:opacity-90 active:scale-[0.98]"
          data-testid={`link-test-${endpoint.id}`}
        >
          <span>Try It</span>
          <ExternalLink className="h-3.5 w-3.5" />
        </a>
      </div>
    </motion.div>
  );
}
