import { motion } from "framer-motion";
import { ExternalLink, Code, Braces } from "lucide-react";
import type { EndpointResponse } from "@shared/routes";

interface EndpointCardProps {
  endpoint: EndpointResponse;
  index: number;
}

export function EndpointCard({ endpoint, index }: EndpointCardProps) {
  const testUrl = `https://api.bk9.dev${endpoint.link}`;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.05, ease: [0.21, 0.47, 0.32, 0.98] }}
      className="group relative flex flex-col justify-between rounded-2xl border border-border/60 bg-card p-6 shadow-sm transition-all duration-300 hover:border-border hover:shadow-md hover:-translate-y-1"
    >
      <div>
        <div className="mb-4 flex items-start justify-between gap-4">
          <div>
            <span className="mb-2 inline-flex items-center rounded-full bg-secondary px-2.5 py-0.5 text-xs font-medium tracking-wide text-secondary-foreground">
              {endpoint.category}
            </span>
            <h3 className="text-lg font-semibold leading-tight text-foreground line-clamp-1" title={endpoint.name}>
              {endpoint.name}
            </h3>
          </div>
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-muted/50 text-muted-foreground transition-colors group-hover:bg-primary/5 group-hover:text-primary">
            <Braces className="h-4 w-4" />
          </div>
        </div>

        <p className="mb-6 text-sm text-muted-foreground line-clamp-2" title={endpoint.description}>
          {endpoint.description}
        </p>

        <div className="mb-6 space-y-3">
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
                if (!cleanParam || cleanParam.toLowerCase() === 'none') {
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
      </div>

      <div className="pt-4 border-t border-border/40 mt-auto">
        <a
          href={testUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground shadow-sm transition-all duration-200 hover:bg-primary/90 hover:shadow minimal-focus active:scale-[0.98]"
        >
          <span>Test Endpoint</span>
          <ExternalLink className="h-3.5 w-3.5" />
        </a>
      </div>
    </motion.div>
  );
}
