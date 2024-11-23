import ReactMarkdown from "react-markdown";

interface MarkdownProps {
  content: string;
}

export function Markdown({ content }: MarkdownProps) {
  return (
    <ReactMarkdown
      components={{
        h1: ({ children }) => (
          <h1 className="text-3xl font-bold mb-8 text-center text-foreground">
            {children}
          </h1>
        ),
        h2: ({ children }) => (
          <h2 className="text-xl font-semibold mb-3 text-foreground">
            {children}
          </h2>
        ),
        h3: ({ children }) => (
          <h3 className="text-lg font-medium mb-1.5 text-foreground">
            {children}
          </h3>
        ),
        p: ({ children }) => (
          <p className="text-muted-foreground mb-4">{children}</p>
        ),
        ul: ({ children }) => (
          <ul className="list-disc list-inside text-muted-foreground mb-4">
            {children}
          </ul>
        ),
      }}
    >
      {content}
    </ReactMarkdown>
  );
}
