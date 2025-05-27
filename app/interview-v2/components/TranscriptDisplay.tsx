'use client';

import { useEffect, useRef } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Bot, User } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { TranscriptEntry } from '@/src/genkit/schemas/types';

interface TranscriptDisplayProps {
  entries: TranscriptEntry[];
}

export default function TranscriptDisplay({ entries }: TranscriptDisplayProps) {
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const lastEntryRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Auto-scroll to the latest entry
    if (lastEntryRef.current) {
      lastEntryRef.current.scrollIntoView({ behavior: 'smooth', block: 'end' });
    }
  }, [entries]);

  if (entries.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        <p>No transcript yet. Start the interview to begin.</p>
      </div>
    );
  }

  return (
    <ScrollArea className="h-[400px] pr-4" ref={scrollAreaRef}>
      <div className="space-y-4">
        {entries.map((entry, index) => {
          const isUser = entry.role === 'user';
          const isLastEntry = index === entries.length - 1;

          return (
            <div
              key={entry.id}
              ref={isLastEntry ? lastEntryRef : null}
              className={cn(
                'flex gap-3',
                isUser ? 'flex-row-reverse' : 'flex-row'
              )}
            >
              <Avatar className="h-8 w-8 flex-shrink-0">
                <AvatarFallback className={isUser ? 'bg-blue-100' : 'bg-purple-100'}>
                  {isUser ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
                </AvatarFallback>
              </Avatar>

              <div
                className={cn(
                  'flex-1 space-y-1',
                  isUser ? 'text-right' : 'text-left'
                )}
              >
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <span className="font-medium">
                    {isUser ? 'You' : 'AI Interviewer'}
                  </span>
                  <span>
                    {new Date(entry.timestamp).toLocaleTimeString()}
                  </span>
                </div>

                <div
                  className={cn(
                    'inline-block px-4 py-2 rounded-lg text-sm',
                    isUser
                      ? 'bg-blue-100 text-blue-900 ml-auto'
                      : 'bg-gray-100 text-gray-900 mr-auto'
                  )}
                >
                  <p className="whitespace-pre-wrap">{entry.text}</p>
                </div>

                {entry.confidence !== undefined && (
                  <div className="text-xs text-gray-400">
                    Confidence: {Math.round(entry.confidence * 100)}%
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </ScrollArea>
  );
}