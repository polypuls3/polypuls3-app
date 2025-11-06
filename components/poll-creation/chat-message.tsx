import { AIChatMessage } from '@/lib/ai/poll-types';
import { Bot, User, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ChatPollPreviewMessage } from './chat-poll-preview-message';
import { ChatActionButtons } from './chat-action-buttons';
import ReactMarkdown from 'react-markdown';

interface ChatMessageProps {
  message: AIChatMessage;
  onAction?: (action: string) => void;
}

export function ChatMessage({ message, onAction }: ChatMessageProps) {
  const isUser = message.role === 'user';
  const messageType = message.type || 'text';

  // Render status messages differently
  if (messageType === 'status' && !isUser) {
    const statusType = message.metadata?.statusType || 'loading';
    const statusIcons = {
      loading: <Loader2 className="h-4 w-4 text-muted-foreground animate-spin" />,
      success: <CheckCircle2 className="h-4 w-4 text-green-600" />,
      error: <AlertCircle className="h-4 w-4 text-destructive" />,
    };

    return (
      <div className="flex gap-3 mb-4">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-muted">
          {statusIcons[statusType]}
        </div>
        <div className="flex-1 overflow-hidden rounded-lg px-4 py-3 bg-muted text-foreground mr-12">
          <p className="text-sm leading-relaxed">{message.content}</p>
        </div>
      </div>
    );
  }

  return (
    <div className={cn('flex gap-3 mb-4', isUser && 'flex-row-reverse')}>
      <div
        className={cn(
          'flex h-8 w-8 shrink-0 items-center justify-center rounded-full',
          isUser ? 'bg-purple-600' : 'bg-muted'
        )}
      >
        {isUser ? (
          <User className="h-4 w-4 text-white" />
        ) : (
          <Bot className="h-4 w-4 text-muted-foreground" />
        )}
      </div>
      <div
        className={cn(
          'flex-1 space-y-3 overflow-hidden',
          isUser && 'ml-12',
          !isUser && 'mr-12'
        )}
      >
        {/* Text content */}
        {message.content && (
          <div
            className={cn(
              'rounded-lg px-4 py-3',
              isUser
                ? 'bg-purple-600 text-white'
                : 'bg-muted text-foreground'
            )}
          >
            {isUser ? (
              <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">
                {message.content}
              </p>
            ) : (
              <div className="text-sm leading-relaxed prose prose-sm max-w-none dark:prose-invert">
                <ReactMarkdown
                  components={{
                    p: ({ children }) => <p className="mb-2 last:mb-0">{children}</p>,
                    strong: ({ children }) => <strong className="font-bold">{children}</strong>,
                    em: ({ children }) => <em className="italic">{children}</em>,
                    code: ({ children }) => (
                      <code className="bg-black/10 dark:bg-white/10 px-1.5 py-0.5 rounded text-xs font-mono">
                        {children}
                      </code>
                    ),
                    pre: ({ children }) => (
                      <pre className="bg-black/10 dark:bg-white/10 p-3 rounded-md overflow-x-auto my-2">
                        {children}
                      </pre>
                    ),
                    ul: ({ children }) => <ul className="list-disc list-inside mb-2">{children}</ul>,
                    ol: ({ children }) => <ol className="list-decimal list-inside mb-2">{children}</ol>,
                    li: ({ children }) => <li className="mb-1">{children}</li>,
                    h1: ({ children }) => <h1 className="text-lg font-bold mb-2">{children}</h1>,
                    h2: ({ children }) => <h2 className="text-base font-bold mb-2">{children}</h2>,
                    h3: ({ children }) => <h3 className="text-sm font-bold mb-2">{children}</h3>,
                    blockquote: ({ children }) => (
                      <blockquote className="border-l-2 border-purple-600 pl-3 italic my-2">
                        {children}
                      </blockquote>
                    ),
                  }}
                >
                  {message.content}
                </ReactMarkdown>
              </div>
            )}
          </div>
        )}

        {/* Preview */}
        {messageType === 'preview' && message.metadata?.pollData && (
          <ChatPollPreviewMessage pollData={message.metadata.pollData} />
        )}

        {/* Action buttons */}
        {messageType === 'actions' && message.metadata?.actions && onAction && (
          <ChatActionButtons
            actions={message.metadata.actions}
            onAction={onAction}
          />
        )}
      </div>
    </div>
  );
}
