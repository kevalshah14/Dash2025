'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { memo, useMemo } from 'react';
import { useWindowSize } from 'usehooks-ts';

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
  const { width: windowWidth, height: windowHeight } = useWindowSize();
  const isMobile = windowWidth ? windowWidth < 768 : false;

  // De-duplicate sources by documentId, keeping the one with highest similarity
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

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div 
          className="flex flex-row h-dvh w-dvw fixed top-0 left-0 z-40 bg-transparent"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="fixed dark:bg-muted bg-background h-dvh flex flex-col overflow-y-scroll border-l dark:border-zinc-700 border-zinc-200"
            initial={
              isMobile
                ? { opacity: 0, x: windowWidth, width: windowWidth }
                : { opacity: 0, x: windowWidth - 400, width: 400 }
            }
            animate={
              isMobile
                ? { opacity: 1, x: 0, width: windowWidth }
                : { opacity: 1, x: windowWidth - 400, width: 400 }
            }
            exit={
              isMobile
                ? { opacity: 0, x: windowWidth }
                : { opacity: 0, x: windowWidth - 400 }
            }
          >
            <div className="p-4 border-b dark:border-zinc-700 border-zinc-200">
              <h2 className="text-lg font-medium">Related Sources</h2>
            </div>

            <div className="flex flex-col gap-4 p-4 overflow-y-auto">
              {uniqueSources.map((source) => (
                <motion.div
                  key={source.id}
                  className="rounded-lg border bg-card p-4"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                >
                  <div className="flex flex-col gap-2">
                    <div className="text-sm text-muted-foreground">
                      Similarity: {(source.similarity * 100).toFixed(1)}%
                    </div>
                    <div className="text-sm">{source.content}</div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export const Sources = memo(PureSources);
