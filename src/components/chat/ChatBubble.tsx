import React from 'react';
import { User, Bot, RotateCw } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

interface ChatBubbleProps {
  message: string;
  isUser: boolean;
  timestamp: string;
  onReload?: () => void;
  isLatest?: boolean;
}

export default function ChatBubble({ message, isUser, timestamp, onReload, isLatest }: ChatBubbleProps) {
  return (
    <div
      className={`flex items-start space-x-3 p-2 sm:p-4 ${
        isUser ? 'flex-row-reverse space-x-reverse' : ''
      }`}
    >
      <div
        className={`w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center ${
          isUser ? 'bg-purple-500/20' : 'bg-gray-800'
        }`}
      >
        {isUser ? (
          <User className="h-5 w-5 sm:h-6 sm:w-6 text-purple-400" />
        ) : (
          <Bot className="h-5 w-5 sm:h-6 sm:w-6 text-gray-400" />
        )}
      </div>

      <div className={`relative max-w-[80%] sm:max-w-[70%] ${isUser ? 'bg-purple-500/10' : 'bg-gray-800/50'} rounded-lg px-4 py-2`}>
        <div className="text-sm text-gray-400 mb-1">
          {isUser ? 'You' : 'Pluto'} • {new Date(timestamp).toLocaleTimeString()}
        </div>
        <div className={`prose prose-invert max-w-none ${isUser ? 'text-purple-50' : 'text-gray-100'} markdown-content`}>
          <ReactMarkdown
            components={{
              p: ({ children }) => <p className="text-base my-2 font-light">{children}</p>,
              strong: ({ children }) => (
                <strong className="text-base font-bold">{children}</strong>
              ),
              h1: ({ children }) => <h1 className="text-2xl font-semibold my-3">{children}</h1>,
              h2: ({ children }) => <h2 className="text-xl font-semibold my-2.5">{children}</h2>,
              h3: ({ children }) => <h3 className="text-lg font-medium my-2">{children}</h3>,
              h4: ({ children }) => <h4 className="text-base font-medium my-2">{children}</h4>,
              ul: ({ children }) => <ul className="list-disc list-inside my-2 space-y-1 font-light">{children}</ul>,
              ol: ({ children }) => <ol className="list-decimal list-inside my-2 space-y-1 font-light">{children}</ol>,
              li: ({ children }) => <li className="text-base font-light">{children}</li>,
              a: ({ href, children }) => (
                <a 
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-purple-400 hover:text-purple-300 underline font-light"
                >
                  {children}
                </a>
              ),
              code: ({ inline, children }) =>
                inline ? (
                  <code className="bg-black/30 px-1.5 py-0.5 rounded text-sm font-mono font-light">
                    {children}
                  </code>
                ) : (
                  <pre className="bg-black/30 p-3 rounded-lg overflow-x-auto">
                    <code className="text-sm font-mono font-light">{children}</code>
                  </pre>
                ),
              blockquote: ({ children }) => (
                <blockquote className="border-l-4 border-purple-500/50 pl-4 my-2 italic font-light">
                  {children}
                </blockquote>
              ),
              table: ({ children }) => (
                <div className="overflow-x-auto my-4">
                  <table className="min-w-full border border-gray-700 rounded">
                    {children}
                  </table>
                </div>
              ),
              th: ({ children }) => (
                <th className="border border-gray-700 px-4 py-2 bg-black/20 font-medium">
                  {children}
                </th>
              ),
              td: ({ children }) => (
                <td className="border border-gray-700 px-4 py-2 font-light">
                  {children}
                </td>
              ),
              hr: () => <hr className="my-4 border-gray-700" />,
              img: ({ src, alt }) => (
                <img 
                  src={src} 
                  alt={alt} 
                  className="max-w-full h-auto rounded-lg my-2"
                  loading="lazy"
                />
              ),
            }}
          >
            {message}
          </ReactMarkdown>
        </div>
        {!isUser && isLatest && onReload && (
          <button
            onClick={onReload}
            className="absolute bottom-2 right-2 p-2 hover:bg-white/5 rounded-full transition-colors duration-200 opacity-0 group-hover:opacity-100"
            title="Regenerate response"
          >
            <RotateCw className="h-4 w-4 text-gray-400 hover:text-purple-400" />
          </button>
        )}
      </div>
    </div>
  );
}