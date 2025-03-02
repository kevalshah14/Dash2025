'use client';

import type { ChatRequestOptions, Message } from 'ai';
import cx from 'classnames';
import { AnimatePresence, motion } from 'framer-motion';
import { memo, useEffect, useMemo, useState } from 'react';

import type { Vote } from '@/lib/db/schema';

import { DocumentToolCall, DocumentToolResult } from './document';
import {
  ChevronDownIcon,
  LoaderIcon,
  PencilEditIcon,
  SparklesIcon,
} from './icons';
import { Markdown } from './markdown';
import { MessageActions } from './message-actions';
import { PreviewAttachment } from './preview-attachment';
import { Weather } from './weather';
import equal from 'fast-deep-equal';
import { cn } from '@/lib/utils';
import { Button } from './ui/button';
import { Tooltip, TooltipContent, TooltipTrigger } from './ui/tooltip';
import { MessageEditor } from './message-editor';
import { DocumentPreview } from './document-preview';
import { MessageReasoning } from './message-reasoning';
import { Source } from './sources';

interface SearchResult {
  sourceId: string;
  documentId: string;
  content: string;
  similarity: number;
}

interface FactCheckResult {
  claim: string;
  supported: boolean;
  evidence: string;
}

interface ResultMessage {
  messageId: string;
  type: 'search' | 'status' | 'perspectives' | 'perspective_analysis' | 'fact_check';
  results?: string;
  message?: string;
  critic?: string;
  optimist?: string;
  choice?: 'critic' | 'optimist';
  confidence?: number;
  reasoning?: string;
}

const PurePreviewMessage = ({
  chatId,
  message,
  vote,
  isLoading,
  setMessages,
  reload,
  isReadonly,
  setSelectedSourceId,
  results,
}: {
  chatId: string;
  message: Message & {
    sources?: Array<SearchResult>;
    factCheck?: Array<FactCheckResult>;
    confidence?: number;
    perspectiveReasoning?: string;
  };
  vote: Vote | undefined;
  isLoading: boolean;
  setMessages: (
    messages: Message[] | ((messages: Message[]) => Message[]),
  ) => void;
  reload: (
    chatRequestOptions?: ChatRequestOptions,
  ) => Promise<string | null | undefined>;
  isReadonly: boolean;
  setSelectedSourceId: (sourceId: string) => void;
  results: ResultMessage[];
}) => {
  const [mode, setMode] = useState<'view' | 'edit'>('view');
  const [expanded, setExpanded] = useState(false);

  // Get sources either from message or results
  const sources = useMemo(() => {
    const searchResult = results?.find(r => r.type === 'search' && r.messageId === message.id);
    if (message.sources) return message.sources;
    if (searchResult?.results) return JSON.parse(searchResult.results) as SearchResult[];
    return null;
  }, [message.sources, message.id, results]);

  // Get fact check results either from message or results
  const factCheck = useMemo(() => {
    const factCheckResult = results?.find(r => r.type === 'fact_check' && r.messageId === message.id);
    if (message.factCheck) return message.factCheck;
    if (factCheckResult?.results) return JSON.parse(factCheckResult.results) as FactCheckResult[];
    return null;
  }, [message.factCheck, message.id, results]);

  // Get perspectives and analysis
  const { confidence, perspectiveReasoning } = useMemo(() => {
    const analysis = results?.find(r => r.type === 'perspective_analysis' && r.messageId === message.id);
    return {
      confidence: message.confidence ?? analysis?.confidence,
      perspectiveReasoning: message.perspectiveReasoning ?? analysis?.reasoning
    };
  }, [message.confidence, message.perspectiveReasoning, message.id, results]);

  // Get perspectives
  const perspectives = useMemo(() => {
    return results?.find(r => r.type === 'perspectives' && r.messageId === message.id);
  }, [message.id, results]);

  return (
    <AnimatePresence>
      <motion.div
        className="w-full mx-auto max-w-3xl px-4 group/message"
        initial={{ y: 5, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        data-role={message.role}
      >
        <div
          className={cn(
            'flex gap-4 w-full group-data-[role=user]/message:ml-auto group-data-[role=user]/message:max-w-2xl',
            {
              'w-full': mode === 'edit',
              'group-data-[role=user]/message:w-fit': mode !== 'edit',
            },
          )}
        >
          {message.role === 'assistant' && (
            <div className="size-8 flex items-center rounded-full justify-center ring-1 shrink-0 ring-border bg-background">
              <div className="translate-y-px">
                <SparklesIcon size={14} />
              </div>
            </div>
          )}

          <div className="flex flex-col gap-4 w-full">
            {message.experimental_attachments && (
              <div className="flex flex-row justify-end gap-2">
                {message.experimental_attachments.map((attachment) => (
                  <PreviewAttachment
                    key={attachment.url}
                    attachment={attachment}
                  />
                ))}
              </div>
            )}

            {message.reasoning && (
              <MessageReasoning
                isLoading={isLoading}
                reasoning={message.reasoning}
              />
            )}

            {(message.content || message.reasoning) && mode === 'view' && (
              <div className="flex flex-row gap-2 items-start">
                {message.role === 'user' && !isReadonly && (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        className="px-2 h-fit rounded-full text-muted-foreground opacity-0 group-hover/message:opacity-100"
                        onClick={() => {
                          setMode('edit');
                        }}
                      >
                        <PencilEditIcon />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Edit message</TooltipContent>
                  </Tooltip>
                )}

                <div
                  className={cn('flex flex-col gap-4', {
                    'bg-primary text-primary-foreground px-3 py-2 rounded-xl':
                      message.role === 'user',
                  })}
                >
                  <Markdown setSelectedSourceId={setSelectedSourceId}>{message.content as string}</Markdown>
                </div>
              </div>
            )}

            {message.content && mode === 'edit' && (
              <div className="flex flex-row gap-2 items-start">
                <div className="size-8" />
                <MessageEditor
                  key={message.id}
                  message={message}
                  setMode={setMode}
                  setMessages={setMessages}
                  reload={reload}
                />
              </div>
            )}

            {/* Collapsible Analysis Section */}
            {(sources || factCheck || perspectives || confidence !== undefined || perspectiveReasoning) && (
              <div className="mt-2">
                <Button
                  variant="ghost"
                  className="w-full flex justify-between p-2 text-sm text-muted-foreground hover:bg-muted/50"
                  onClick={() => setExpanded(!expanded)}
                >
                  <span>Analysis & Sources</span>
                  <ChevronDownIcon className={`transform transition-transform ${expanded ? 'rotate-180' : ''}`} />
                </Button>
                
                {expanded && (
                  <div className="mt-2 space-y-2">
                    {perspectives && (
                      <div className="grid grid-cols-2 gap-2">
                        <div className="bg-red-500/10 dark:bg-red-900/20 p-3 rounded">
                          <h4 className="text-xs font-medium mb-1">Critical View</h4>
                          <p className="text-xs">{perspectives.critic}</p>
                        </div>
                        <div className="bg-green-500/10 dark:bg-green-900/20 p-3 rounded">
                          <h4 className="text-xs font-medium mb-1">Optimistic View</h4>
                          <p className="text-xs">{perspectives.optimist}</p>
                        </div>
                      </div>
                    )}

                    {(confidence !== undefined || perspectiveReasoning) && (
                      <div className="bg-blue-500/10 dark:bg-blue-900/20 p-3 rounded">
                        <h4 className="text-xs font-medium mb-1">Analysis</h4>
                        {confidence !== undefined && (
                          <p className="text-xs">Confidence: {(confidence * 100).toFixed(1)}%</p>
                        )}
                        {perspectiveReasoning && (
                          <p className="text-xs mt-1">{perspectiveReasoning}</p>
                        )}
                      </div>
                    )}

                    {factCheck && factCheck.length > 0 && (
                      <div className="bg-yellow-500/10 dark:bg-yellow-900/20 p-3 rounded">
                        <h4 className="text-xs font-medium mb-1">Fact Check</h4>
                        {factCheck.map((fact, i) => (
                          <div key={i} className="text-xs flex items-start gap-2 mb-1">
                            <span className={fact.supported ? "text-green-600" : "text-red-600"}>
                              {fact.supported ? "✓" : "✗"}
                            </span>
                            <div>
                              <p className="font-medium">{fact.claim}</p>
                              <p className="text-muted-foreground">{fact.evidence}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {sources && sources.length > 0 && (
                      <div className="bg-muted/50 p-3 rounded">
                        <h4 className="text-xs font-medium mb-1">Sources</h4>
                        {sources.map((source, i) => (
                          <div key={source.sourceId} className="text-xs mb-2">
                            <div className="flex justify-between">
                              <span className="font-medium">Source {i + 1}</span>
                              <span className="text-muted-foreground">
                                {(source.similarity * 100).toFixed(1)}%
                              </span>
                            </div>
                            <p className="text-muted-foreground">{source.content}</p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {message.toolInvocations && message.toolInvocations.length > 0 && (
              <div className="flex flex-col gap-4">
                {message.toolInvocations.map((toolInvocation) => {
                  const { toolName, toolCallId, state, args } = toolInvocation;

                  if (state === 'result') {
                    const { result } = toolInvocation;

                    return (
                      <div key={toolCallId}>
                        {toolName === 'getWeather' ? (
                          <Weather weatherAtLocation={result} />
                        ) : toolName === 'createDocument' ? (
                          <DocumentPreview
                            isReadonly={isReadonly}
                            result={result}
                          />
                        ) : toolName === 'updateDocument' ? (
                          <DocumentToolResult
                            type="update"
                            result={result}
                            isReadonly={isReadonly}
                          />
                        ) : toolName === 'requestSuggestions' ? (
                          <DocumentToolResult
                            type="request-suggestions"
                            result={result}
                            isReadonly={isReadonly}
                          />
                        ) : (
                          <pre>{JSON.stringify(result, null, 2)}</pre>
                        )}
                      </div>
                    );
                  }
                  return (
                    <div
                      key={toolCallId}
                      className={cx({
                        skeleton: ['getWeather'].includes(toolName),
                      })}
                    >
                      {toolName === 'getWeather' ? (
                        <Weather />
                      ) : toolName === 'createDocument' ? (
                        <DocumentPreview isReadonly={isReadonly} args={args} />
                      ) : toolName === 'updateDocument' ? (
                        <DocumentToolCall
                          type="update"
                          args={args}
                          isReadonly={isReadonly}
                        />
                      ) : toolName === 'requestSuggestions' ? (
                        <DocumentToolCall
                          type="request-suggestions"
                          args={args}
                          isReadonly={isReadonly}
                        />
                      ) : null}
                    </div>
                  );
                })}
              </div>
            )}

            {!isReadonly && (
              <MessageActions
                key={`action-${message.id}`}
                chatId={chatId}
                message={message}
                vote={vote}
                isLoading={isLoading}
              />
            )}
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export const PreviewMessage = memo(
  PurePreviewMessage,
  (prevProps, nextProps) => {
    if (prevProps.isLoading !== nextProps.isLoading) return false;
    if (prevProps.message.reasoning !== nextProps.message.reasoning)
      return false;
    if (prevProps.message.content !== nextProps.message.content) return false;
    if (
      !equal(
        prevProps.message.toolInvocations,
        nextProps.message.toolInvocations,
      )
    )
      return false;
    if (!equal(prevProps.vote, nextProps.vote)) return false;
    if (!equal(prevProps.setSelectedSourceId, nextProps.setSelectedSourceId)) return false;
    if (!equal(prevProps.message.sources, nextProps.message.sources)) return false;
    if (!equal(prevProps.message.factCheck, nextProps.message.factCheck)) return false;
    if (prevProps.message.confidence !== nextProps.message.confidence) return false;
    if (prevProps.message.perspectiveReasoning !== nextProps.message.perspectiveReasoning) return false;
    if (!equal(prevProps.results, nextProps.results)) return false;

    return true;
  },
);

export const ThinkingMessage = () => {
  const role = 'assistant';

  return (
    <motion.div
      className="w-full mx-auto max-w-3xl px-4 group/message "
      initial={{ y: 5, opacity: 0 }}
      animate={{ y: 0, opacity: 1, transition: { delay: 1 } }}
      data-role={role}
    >
      <div
        className={cx(
          'flex gap-4 group-data-[role=user]/message:px-3 w-full group-data-[role=user]/message:w-fit group-data-[role=user]/message:ml-auto group-data-[role=user]/message:max-w-2xl group-data-[role=user]/message:py-2 rounded-xl',
          {
            'group-data-[role=user]/message:bg-muted': true,
          },
        )}
      >
        <div className="size-8 flex items-center rounded-full justify-center ring-1 shrink-0 ring-border">
          <SparklesIcon size={14} />
        </div>

        <div className="flex flex-col gap-2 w-full">
          <div className="flex flex-col gap-4 text-muted-foreground">
            Thinking...
          </div>
        </div>
      </div>
    </motion.div>
  );
};