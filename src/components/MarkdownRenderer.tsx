/**
 * Renders Markdown content inside flashcards.
 * Uses react-markdown for rendering with custom styling.
 */
import ReactMarkdown from 'react-markdown';

interface MarkdownRendererProps {
  content: string;
  className?: string;
}

export default function MarkdownRenderer({ content, className = '' }: MarkdownRendererProps) {
  return (
    <div className={`prose prose-sm dark:prose-invert max-w-none
      prose-headings:mb-2 prose-headings:mt-3
      prose-p:my-1.5 prose-p:leading-relaxed
      prose-ul:my-1 prose-ol:my-1
      prose-li:my-0.5
      prose-code:bg-slate-100 prose-code:dark:bg-slate-700 
      prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded-md 
      prose-code:text-indigo-600 prose-code:dark:text-indigo-400
      prose-code:text-sm prose-code:font-mono
      prose-pre:bg-slate-100 prose-pre:dark:bg-slate-700 prose-pre:rounded-xl
      prose-strong:text-slate-800 prose-strong:dark:text-white
      prose-blockquote:border-indigo-400 prose-blockquote:text-slate-600 
      prose-blockquote:dark:text-slate-300
      ${className}`}>
      <ReactMarkdown>{content}</ReactMarkdown>
    </div>
  );
}
