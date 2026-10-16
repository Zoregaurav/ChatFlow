import { useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism";

function CodeBlock({ language, code }) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);

      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error("Failed to copy code:", error);
    }
  }

  return (
    <div className="code-block">
      <div className="code-block-header">
        <span className="code-language">{language || "CODE"}</span>

        <button
          type="button"
          className="copy-code-button"
          onClick={handleCopy}
          aria-label="Copy code"
        >
          {copied ? "✓ Copied!" : "Copy"}
        </button>
      </div>

      <SyntaxHighlighter
        language={language || "text"}
        style={oneDark}
        PreTag="div"
        customStyle={{
          margin: 0,
          borderRadius: "0 0 10px 10px",
          padding: "16px",
          background: "#1e1e1e",
          overflowX: "auto",
        }}
      >
        {code}
      </SyntaxHighlighter>
    </div>
  );
}

function MessageContent({ content }) {
  return (
    <div className="message-content">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          code({ className, children, ...props }) {
            const match = /language-(\w+)/.exec(className || "");

            const code = String(children).replace(/\n$/, "");

            if (match) {
              return <CodeBlock language={match[1]} code={code} />;
            }

            return (
              <code className={className} {...props}>
                {children}
              </code>
            );
          },
        }}
      >
        {content ?? ""}
      </ReactMarkdown>
    </div>
  );
}

export default MessageContent;
