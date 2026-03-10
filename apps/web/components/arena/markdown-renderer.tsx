import React from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { cn } from "@repo/ui/lib/utils";
export function MarkdownRenderer({ source }: { source: string }) {
  return (
    <div className="prose prose-sm dark:prose-invert max-w-none">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          h1: ({ node, ...props }) => <h1 className="text-2xl font-semibold mt-4 mb-2" {...props} />,
          h2: ({ node, ...props }) => <h2 className="text-xl font-semibold mt-4 mb-2" {...props} />,
          h3: ({ node, ...props }) => <h3 className="text-lg font-medium mt-3 mb-1" {...props} />,

          p: ({ node, ...props }) => <p className="leading-7 mb-2 text-sm" {...props} />,

          pre: ({ node, className, children, ...props }) => (
            <pre
              className={cn(
                "my-2 rounded-md overflow-auto p-3 text-sm font-mono bg-slate-100 dark:bg-slate-800",
                className
              )}
              {...props}
            >
              {children}
            </pre>
          ),
          code: ({ node, className, children, ...props }) => {
            // `react-markdown` versions differ on whether an `inline` flag is provided.
            // Heuristic: code blocks usually have a language class or contain newlines.
            const text = typeof children === "string" ? children : String(children ?? "");
            const isCodeBlock = Boolean(className) || text.includes("\n");

            return (
              <code
                className={cn(
                  isCodeBlock
                    ? "block font-mono text-sm whitespace-pre"
                    : "inline-flex items-center bg-muted/30 px-1 py-0.5 rounded font-mono text-xs",
                  className
                )}
                {...props}
              >
                {children}
              </code>
            );
          },

          ul: ({ node, ...props }) => <ul className="list-disc list-inside ml-4 space-y-1" {...props} />,
          ol: ({ node, ...props }) => <ol className="list-decimal list-inside ml-4 space-y-1" {...props} />,

          blockquote: ({ node, ...props }) => (
            <blockquote className="border-l-2 pl-3 italic text-muted-foreground my-2" {...props} />
          ),

          table: ({ node, ...props }) => (
            <div className="overflow-auto">
              <table className="min-w-full text-sm divide-y" {...props} />
            </div>
          ),
          th: ({ node, ...props }) => <th className="px-3 py-1 text-left font-medium" {...props} />,
          td: ({ node, ...props }) => <td className="px-3 py-1 align-top" {...props} />,

          hr: ({ node, ...props }) => <hr className="my-4 border-slate-200" {...props} />
        }}
      >
        {source}
      </ReactMarkdown>
    </div>
  );
}
