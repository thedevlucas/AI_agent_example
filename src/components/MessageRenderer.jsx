import { Copy, Check } from "lucide-react"
import { useState } from "react"

const MessageRenderer = ({ content }) => {
  const [copiedBlocks, setCopiedBlocks] = useState(new Set())

  const copyToClipboard = async (text, blockId) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopiedBlocks((prev) => new Set([...prev, blockId]))
      setTimeout(() => {
        setCopiedBlocks((prev) => {
          const newSet = new Set(prev)
          newSet.delete(blockId)
          return newSet
        })
      }, 2000)
    } catch (err) {
      console.error("Failed to copy text: ", err)
    }
  }

  const parseMessage = (text) => {
    const parts = []
    let currentIndex = 0
    let blockId = 0

    // Split by code blocks first (\`\`\`...\`\`\`)
    const codeBlockRegex = /```(\w+)?\n?([\s\S]*?)```/g
    let match

    while ((match = codeBlockRegex.exec(text)) !== null) {
      // Add text before code block
      if (match.index > currentIndex) {
        const beforeText = text.slice(currentIndex, match.index)
        parts.push(...parseInlineFormatting(beforeText))
      }

      // Add code block
      const language = match[1] || ""
      const code = match[2].trim()
      const currentBlockId = blockId++

      parts.push(
        <div key={`code-${currentBlockId}`} className="code-block-container">
          <div className="code-block-header">
            <span className="code-language">{language || "code"}</span>
            <button onClick={() => copyToClipboard(code, currentBlockId)} className="copy-button" title="Copy code">
              {copiedBlocks.has(currentBlockId) ? <Check size={16} /> : <Copy size={16} />}
            </button>
          </div>
          <pre className="code-block">
            <code>{code}</code>
          </pre>
        </div>,
      )

      currentIndex = match.index + match[0].length
    }

    // Add remaining text
    if (currentIndex < text.length) {
      const remainingText = text.slice(currentIndex)
      parts.push(...parseInlineFormatting(remainingText))
    }

    return parts
  }

  const parseInlineFormatting = (text) => {
    const parts = []
    const lines = text.split("\n")

    lines.forEach((line, lineIndex) => {
      // Skip empty lines but add spacing

      // Check for headers
      if (line.startsWith("### ")) {
        parts.push(
          <h3 key={`h3-${lineIndex}`} className="message-h3">
            {line.slice(4)}
          </h3>,
        )
      } else if (line.startsWith("## ")) {
        parts.push(
          <h2 key={`h2-${lineIndex}`} className="message-h2">
            {line.slice(3)}
          </h2>,
        )
      } else if (line.startsWith("# ")) {
        parts.push(
          <h1 key={`h1-${lineIndex}`} className="message-h1">
            {line.slice(2)}
          </h1>,
        )
      } else if (line.trim().startsWith("• ") || line.trim().startsWith("- ") || line.trim().startsWith("* ")) {
        // Handle bullet points
        const bulletContent = line.trim().replace(/^[•\-*]\s*/, "")
        parts.push(
          <div key={`list-${lineIndex}`} className="message-list-item">
            <span className="bullet">•</span>
            <span className="bullet-content">{parseInlineElements(bulletContent)}</span>
          </div>,
        )
      } else if (line.trim().match(/^\d+\.\s/)) {
        // Numbered list items
        parts.push(
          <div key={`numbered-${lineIndex}`} className="message-numbered-item">
            {parseInlineElements(line.trim())}
          </div>,
        )
      } else {
        // Regular text with inline formatting
        const parsedLine = parseInlineElements(line)
        if (parsedLine && parsedLine.length > 0) {
          parts.push(
            <div key={`text-${lineIndex}`} className="message-line">
              {parsedLine}
            </div>,
          )
        }
      }
    })

    return parts
  }

  const parseInlineElements = (text) => {
    if (!text) return []

    const parts = []
    let currentIndex = 0

    // First, handle inline code blocks to protect them from other parsing
    const codeMatches = []
    const inlineCodeRegex = /`([^`]+)`/g
    let codeMatch

    while ((codeMatch = inlineCodeRegex.exec(text)) !== null) {
      codeMatches.push({
        start: codeMatch.index,
        end: codeMatch.index + codeMatch[0].length,
        content: codeMatch[1],
        type: "code",
      })
    }

    // Then handle bold text
    const boldMatches = []
    const boldRegex = /\*\*([^*]+)\*\*/g
    let boldMatch

    while ((boldMatch = boldRegex.exec(text)) !== null) {
      // Check if this bold text overlaps with any code blocks
      const overlapsCode = codeMatches.some(
        (code) => boldMatch.index < code.end && boldMatch.index + boldMatch[0].length > code.start,
      )

      if (!overlapsCode) {
        boldMatches.push({
          start: boldMatch.index,
          end: boldMatch.index + boldMatch[0].length,
          content: boldMatch[1],
          type: "bold",
        })
      }
    }

    // Combine and sort all matches
    const allMatches = [...codeMatches, ...boldMatches].sort((a, b) => a.start - b.start)

    // Process the text with all matches
    allMatches.forEach((match, index) => {
      // Add text before this match
      if (match.start > currentIndex) {
        const beforeText = text.slice(currentIndex, match.start)
        if (beforeText) {
          parts.push(beforeText)
        }
      }

      // Add the formatted element
      if (match.type === "code") {
        parts.push(
          <code key={`inline-code-${index}`} className="inline-code">
            {match.content}
          </code>,
        )
      } else if (match.type === "bold") {
        parts.push(
          <strong key={`bold-${index}`} className="message-bold">
            {match.content}
          </strong>,
        )
      }

      currentIndex = match.end
    })

    // Add remaining text
    if (currentIndex < text.length) {
      const remainingText = text.slice(currentIndex)
      if (remainingText) {
        parts.push(remainingText)
      }
    }

    return parts.length > 0 ? parts : [text]
  }

  return (
    <div className="message-content-formatted">
      {parseMessage(content)}

      <style jsx>{`
        .message-content-formatted {
          line-height: 1.6;
        }

        .code-block-container {
          
          border-radius: 8px;
          overflow: hidden;
          background: #1e1e1e;
          border: 1px solid #333;
        }

        .code-block-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 8px 12px;
          background: #2d2d2d;
          border-bottom: 1px solid #333;
        }

        .code-language {
          font-size: 12px;
          color: #888;
          font-weight: 500;
          text-transform: uppercase;
        }

        .copy-button {
          background: transparent;
          border: none;
          color: #888;
          cursor: pointer;
          padding: 4px;
          border-radius: 4px;
          transition: all 0.2s ease;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .copy-button:hover {
          color: #fff;
          background: #404040;
        }

        .code-block {
          margin: 0;
          padding: 16px;
          background: #1e1e1e;
          color: #e6e6e6;
          font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
          font-size: 14px;
          line-height: 1.5;
          overflow-x: auto;
          white-space: pre-wrap;
        }

        .inline-code {
          background: rgba(255, 255, 255, 0.1);
          color: #e6e6e6;
          padding: 2px 6px;
          border-radius: 4px;
          font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', monospace;
          font-size: 0.9em;
          border: 1px solid rgba(255, 255, 255, 0.2);
        }

        .message-h1 {
          font-size: 1.5em;
          font-weight: 700;
          margin: 16px 0 8px 0;
          color: var(--text-primary);
          border-bottom: 2px solid var(--accent-blue);
          padding-bottom: 4px;
        }

        .message-h2 {
          font-size: 1.3em;
          font-weight: 600;
          margin: 14px 0 6px 0;
          color: var(--text-primary);
        }

        .message-h3 {
          font-size: 1.1em;
          font-weight: 600;
          margin: 12px 0 4px 0;
          color: var(--text-primary);
        }

        .message-bold {
          font-weight: 700;
          color: var(--text-primary);
        }

        .message-bold-line {
          font-weight: 700;
          color: var(--text-primary);
          margin: 8px 0;
          font-size: 1.1em;
        }

        .message-italic {
          font-style: italic;
          color: var(--text-secondary);
        }

        .message-list-item {
          margin: 4px 0;
          padding-left: 16px;
          color: var(--text-primary);
        }

        /* Dark theme adjustments for AI messages */
        .message-ai .code-block-container {
          background: #0d1117;
          border-color: #21262d;
        }

        .message-ai .code-block-header {
          background: #161b22;
          border-color: #21262d;
        }

        .message-ai .code-block {
          background: #0d1117;
          color: #c9d1d9;
        }

        .message-ai .inline-code {
          background: rgba(110, 118, 129, 0.4);
          color: #c9d1d9;
          border-color: rgba(110, 118, 129, 0.4);
        }

        /* Light theme adjustments for user messages */
        .message-user .code-block-container {
          background: #f6f8fa;
          border-color: #d0d7de;
        }

        .message-user .code-block-header {
          background: #f6f8fa;
          border-color: #d0d7de;
        }

        .message-user .code-language {
          color: #656d76;
        }

        .message-user .copy-button {
          color: #656d76;
        }

        .message-user .copy-button:hover {
          color: #24292f;
          background: #f3f4f6;
        }

        .message-user .code-block {
          background: #f6f8fa;
          color: #24292f;
        }

        .message-user .inline-code {
          background: rgba(175, 184, 193, 0.2);
          color: #24292f;
          border-color: rgba(175, 184, 193, 0.2);
        }

        .message-user .message-h1,
        .message-user .message-h2,
        .message-user .message-h3,
        .message-user .message-bold,
        .message-user .message-bold-line {
          color: white;
        }

        .message-user .message-h1 {
          border-bottom-color: rgba(255, 255, 255, 0.3);
        }

        .message-line {
          margin-bottom: 8px;
          line-height: 1.6;
        }

        .message-line:last-child {
          margin-bottom: 0;
        }

        .message-list-item {
          display: flex;
          align-items: flex-start;
          margin: 8px 0;
          padding-left: 0;
          line-height: 1.6;
        }

        .bullet {
          color: var(--accent-blue);
          font-weight: bold;
          margin-right: 12px;
          flex-shrink: 0;
          margin-top: 2px;
        }

        .bullet-content {
          flex: 1;
        }

        .message-numbered-item {
          margin: 8px 0;
          padding-left: 20px;
          line-height: 1.6;
        }

        .message-h1,
        .message-h2,
        .message-h3 {
          margin: 16px 0 8px 0;
          line-height: 1.3;
        }

        .message-h1:first-child,
        .message-h2:first-child,
        .message-h3:first-child {
          margin-top: 0;
        }
      `}</style>
    </div>
  )
}

export default MessageRenderer