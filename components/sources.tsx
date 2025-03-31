'use client';

import { AnimatePresence, motion } from 'framer-motion';
import React, { memo, useMemo, useState, useEffect } from 'react';
import { useWindowSize } from 'usehooks-ts';
import ReactMarkdown from 'react-markdown';
import { ChevronDown, X } from 'lucide-react';

export interface Source {
  sourceId: string;
  documentId: string;
  content: string;
  chunkVector: number[];
  similarity: number;
}

interface SourcesProps {
  sources: Source[];
  isVisible: boolean;
  setSelectedSourceId: (sourceId: string | null) => void;
  selectedSourceId?: string;
}

function PureSources({ sources, isVisible, setSelectedSourceId, selectedSourceId }: SourcesProps) {
  const { width: windowWidth } = useWindowSize();
  const isMobile = windowWidth ? windowWidth < 768 : false;
  const [expandedSourceIds, setExpandedSourceIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    console.log({selectedSourceId});
  }, [selectedSourceId]);

  const displayedSources = useMemo(() => {
    // First deduplicate sources based on sourceId
    const deduplicatedSources = Array.from(new Set<Source>(sources.map(source => source)));

    if (!selectedSourceId) {
      // When no source is selected, show the best source per document
      const sourcesByDoc = new Map<string, Source>();
      deduplicatedSources.forEach(source => {
        const existing = sourcesByDoc.get(source.documentId);
        if (!existing || source.similarity > existing.similarity) {
          sourcesByDoc.set(source.documentId, source);
        }
      });
      return Array.from(sourcesByDoc.values());
    } else {
      // When a source is selected, show all sources from that document
      const selectedSource = deduplicatedSources.find(s => s.sourceId === selectedSourceId);
      if (!selectedSource) return [];
      
      // Get all sources from the same document
      const relatedSources = deduplicatedSources.filter(s => 
        s.documentId === selectedSource.documentId && 
        s.sourceId !== selectedSource.sourceId
      );
      
      return [selectedSource, ...relatedSources];
    }
  }, [sources, selectedSourceId]);

  // Reset expanded sources when selected source changes
  useEffect(() => {
    setExpandedSourceIds(new Set());
  }, [selectedSourceId]);

  const toggleSource = (sourceId: string) => {
    setExpandedSourceIds(prev => {
      const next = new Set(prev);
      if (next.has(sourceId)) {
        next.delete(sourceId);
      } else {
        next.add(sourceId);
      }
      return next;
    });
  };

  return (
    <AnimatePresence mode="wait">
      {isVisible && (
        <motion.aside
          className="fixed dark:bg-muted bg-background h-dvh w-[400px] flex flex-col overflow-hidden border-l dark:border-zinc-700 border-zinc-200 right-0 top-0"
          initial={{ opacity: 0, x: 400 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 400 }}
          transition={{ type: "spring", damping: 20 }}
        >
          <header className="p-4 border-b dark:border-zinc-700 border-zinc-200">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-medium">Related Sources</h2>
              {selectedSourceId && (
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">
                    Showing all sources from document
                  </span>
                  <button
                    onClick={() => setSelectedSourceId(null)}
                    className="hover:bg-muted rounded-full p-1"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              )}
            </div>
          </header>

          <main className="flex flex-col gap-4 p-4 overflow-y-auto">
            <AnimatePresence initial={false} mode="popLayout">
              {displayedSources.map((source, index) => (
                <React.Fragment key={source.sourceId}>
                  <motion.article
                    className={`rounded-lg border bg-card p-4 ${selectedSourceId === source.sourceId ? 'ring-2 ring-primary' : ''}`}
                    layout="position"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ 
                      duration: 0.2,
                      layout: { duration: 0.3 }
                    }}
                  >
                    <div 
                      className="flex items-center justify-between cursor-pointer"
                      onClick={() => toggleSource(source.sourceId)}
                    >
                      <div className="text-sm text-muted-foreground">
                        Similarity: {(source.similarity * 100).toFixed(1)}%
                      </div>
                      <motion.div
                        animate={{ rotate: expandedSourceIds.has(source.sourceId) ? 180 : 0 }}
                        transition={{ duration: 0.2 }}
                      >
                        <ChevronDown className="h-4 w-4" />
                      </motion.div>
                    </div>
                    <motion.div 
                      className="relative prose dark:prose-invert max-w-none text-sm mt-2 overflow-hidden"
                      initial={false}
                      animate={{ 
                        height: expandedSourceIds.has(source.sourceId) ? "auto" : "4.5em",
                        opacity: expandedSourceIds.has(source.sourceId) ? 1 : 0.7
                      }}
                      transition={{ 
                        height: { duration: 0.3 },
                        opacity: { duration: 0.2 }
                      }}
                    >
                      <ReactMarkdown>
                        {source.content}
                      </ReactMarkdown>
                      {!expandedSourceIds.has(source.sourceId) && (
                        <div 
                          className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-card to-transparent"
                        />
                      )}
                    </motion.div>
                  </motion.article>
                  
                  {selectedSourceId && index === 0 && displayedSources.length > 1 && (
                    <div className="text-sm text-muted-foreground mt-4 mb-2">
                      From the same document:
                    </div>
                  )}
                </React.Fragment>
              ))}
            </AnimatePresence>
          </main>
        </motion.aside>
      )}
    </AnimatePresence>
  );
}

export const Sources = memo(PureSources);
