import React from "react";
import ReactMarkdown from "react-markdown";
import rehypeRaw from "rehype-raw";
import remarkGfm from "remark-gfm";

interface ContentProps {
  content: string;
}

export function MarkdownContent({ content }: ContentProps) {
  return (
    <div className="max-w-4xl mx-auto">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeRaw]}
        components={{
          // Headers
          h1: ({ children }) => <h1 className="text-4xl font-bold mt-10 mb-6">{children}</h1>,
          h2: ({ children }) => <h2 className="text-3xl font-semibold mt-8 mb-4">{children}</h2>,
          h3: ({ children }) => <h3 className="text-2xl font-semibold mt-6 mb-3">{children}</h3>,

          // Tables
          table: ({ children }) => (
            <div className="my-6 w-full">
              <table className="min-w-full border border-gray-200 divide-y divide-gray-200">
                {children}
              </table>
            </div>
          ),
          thead: ({ children }) => <thead className="bg-gray-50">{children}</thead>,
          th: ({ children }) => (
            <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">{children}</th>
          ),
          td: ({ children }) => (
            <td className="px-6 py-4 text-sm text-gray-500 border-t border-gray-200">{children}</td>
          ),

          // Lists
          ul: ({ children }) => <ul className="list-disc pl-8 mt-4 mb-6 space-y-2">{children}</ul>,
          ol: ({ children }) => <ol className="list-decimal pl-8 mt-4 mb-6 space-y-2">{children}</ol>,
          li: ({ children }) => <li className="text-gray-700">{children}</li>,

          // Paragraphs
          p: ({ children }) => <p className="text-gray-700 leading-relaxed mb-4">{children}</p>,
          strong: ({ children }) => <strong className="font-semibold">{children}</strong>,
          em: ({ children }) => <em className="italic">{children}</em>,

          // Dividers
          hr: () => <hr className="my-8 border-t border-gray-200" />,

          // Code blocks (🔹 Fixed the inline TypeScript issue)
          code: ({
            inline = false,
            className,
            children,
            ...props
          }: {
            inline?: boolean;
            className?: string;
            children?: React.ReactNode;
          }) => {
            const match = /language-(\w+)/.exec(className || "");
            return !inline ? (
              <pre className="bg-gray-50 rounded-lg p-4 my-4 overflow-x-auto">
                <code className={className} {...props}>
                  {children}
                </code>
              </pre>
            ) : (
              <code className="bg-gray-100 rounded px-1.5 py-0.5 text-sm font-mono" {...props}>
                {children}
              </code>
            );
          },
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}