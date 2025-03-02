'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { memo, useMemo, useState } from 'react';
import { useWindowSize } from 'usehooks-ts';
import ReactMarkdown from 'react-markdown';
import { ChevronDown, ChevronUp } from 'lucide-react';

export interface Source {
  id: string;
  documentId: string;
  content: string;
  chunkVector: number[];
  similarity: number;
}

interface SourcesProps {
  sources: Source[];
  isVisible: boolean;
}

function PureSources({ sources, isVisible }: SourcesProps) {
  const { width: windowWidth } = useWindowSize();
  const isMobile = windowWidth ? windowWidth < 768 : false;
  const [expandedSources, setExpandedSources] = useState<Set<string>>(new Set());

  const uniqueSources = useMemo(() => {
    const sourcesByDoc = new Map<string, Source>();
    
    sources.forEach(source => {
      const existing = sourcesByDoc.get(source.documentId);
      if (!existing || source.similarity > existing.similarity) {
        sourcesByDoc.set(source.documentId, source);
      }
    });

    return Array.from(sourcesByDoc.values());
  }, [sources]);

  const toggleSource = (id: string) => {
    setExpandedSources(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.aside
          className="fixed dark:bg-muted bg-background h-dvh w-[400px] flex flex-col overflow-hidden border-l dark:border-zinc-700 border-zinc-200 right-0 top-0"
          initial={{ opacity: 0, x: 400 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 400 }}
          transition={{ type: "spring", damping: 20 }}
        >
          <header className="p-4 border-b dark:border-zinc-700 border-zinc-200">
            <h2 className="text-lg font-medium">Related Sources</h2>
          </header>

          <main className="flex flex-col gap-4 p-4 overflow-y-auto">
            <AnimatePresence mode="popLayout">
              {uniqueSources.map((source) => (
                <motion.article
                  key={source.id}
                  className="rounded-lg border bg-card p-4"
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.2 }}
                >
                  <div 
                    className="flex items-center justify-between cursor-pointer"
                    onClick={() => toggleSource(source.id)}
                  >
                    <div className="text-sm text-muted-foreground">
                      Similarity: {(source.similarity * 100).toFixed(1)}%
                    </div>
                    {expandedSources.has(source.id) ? (
                      <ChevronUp className="h-4 w-4" />
                    ) : (
                      <ChevronDown className="h-4 w-4" />
                    )}
                  </div>
                  <motion.div 
                    className="relative prose dark:prose-invert max-w-none text-sm mt-2"
                    initial={false}
                    animate={{ 
                      height: expandedSources.has(source.id) ? "auto" : "4.5em"
                    }}
                    transition={{ type: "spring", damping: 20 }}
                  >
                    <ReactMarkdown>
                      {source.content}
                    </ReactMarkdown>
                    {!expandedSources.has(source.id) && (
                      <div 
                        className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-card to-transparent"
                      />
                    )}
                  </motion.div>
                </motion.article>
              ))}
            </AnimatePresence>
          </main>
        </motion.aside>
      )}
    </AnimatePresence>
  );
}

export const Sources = memo(PureSources);
