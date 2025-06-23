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

  // Enhanced language detection
  const detectLanguage = (code, declaredLang) => {
    if (declaredLang) {
      return declaredLang.toLowerCase()
    }

    // Language detection patterns
    const patterns = {
      javascript: [
        /\b(const|let|var|function|=>|async|await|import|export|require)\b/,
        /\bconsole\.log\b/,
        /\b(React|useState|useEffect)\b/,
        /\.\w+\(/,
      ],
      typescript: [
        /\b(interface|type|enum|namespace)\b/,
        /:\s*(string|number|boolean|any|void)\b/,
        /\bimport.*from\b/,
        /<.*>/,
      ],
      python: [
        /\b(def|class|import|from|if __name__|print|len|range)\b/,
        /:\s*$/m,
        /\bself\b/,
        /\b(True|False|None)\b/,
      ],
      java: [
        /\b(public|private|protected|static|class|interface)\b/,
        /\bSystem\.out\.println\b/,
        /\b(String|int|boolean|void)\s+\w+\s*\(/,
        /\bpublic static void main\b/,
      ],
      csharp: [
        /\b(using|namespace|class|public|private|static)\b/,
        /\bConsole\.WriteLine\b/,
        /\b(string|int|bool|void)\s+\w+\s*\(/,
        /\[.*\]/,
      ],
      cpp: [
        /\b(#include|using namespace|cout|cin|endl)\b/,
        /\b(int|char|float|double|bool)\s+\w+/,
        /\bstd::/,
        /\bmain\s*$$\s*(void|int)?\s*$$/,
      ],
      html: [/<\/?[a-z][\s\S]*>/i, /<!DOCTYPE/i, /<(div|span|p|h[1-6]|a|img)/i],
      css: [/\{[\s\S]*\}/, /[.#][\w-]+\s*\{/, /:\s*[^;]+;/, /@(media|import|keyframes)/],
      sql: [
        /\b(SELECT|FROM|WHERE|INSERT|UPDATE|DELETE|CREATE|ALTER|DROP)\b/i,
        /\b(JOIN|INNER|LEFT|RIGHT|OUTER)\b/i,
        /\b(GROUP BY|ORDER BY|HAVING)\b/i,
      ],
      json: [/^\s*[{[]/, /:\s*["'\d{[]/, /^\s*\}/],
      bash: [/^\s*#!/, /\b(echo|cd|ls|mkdir|rm|cp|mv|grep|awk|sed)\b/, /\$\w+/, /\|\s*\w+/],
    }

    // Score each language
    const scores = {}
    for (const [lang, langPatterns] of Object.entries(patterns)) {
      scores[lang] = 0
      for (const pattern of langPatterns) {
        const matches = code.match(pattern)
        if (matches) {
          scores[lang] += matches.length
        }
      }
    }

    // Return the language with the highest score
    const bestMatch = Object.entries(scores).reduce((a, b) => (scores[a[0]] > scores[b[0]] ? a : b))
    return bestMatch[1] > 0 ? bestMatch[0] : "text"
  }

  // Syntax highlighting function
  const highlightCode = (code, language) => {
    if (!code) return code

    // Define token patterns for different languages
    const tokenPatterns = {
      javascript: {
        keyword:
          /\b(const|let|var|function|return|if|else|for|while|do|switch|case|break|continue|try|catch|finally|throw|async|await|import|export|from|default|class|extends|constructor|super|this|new|typeof|instanceof|in|of|delete|void|null|undefined|true|false)\b/g,
        string: /(["'`])(?:(?!\1)[^\\]|\\.)*\1/g,
        comment: /(\/\/.*$|\/\*[\s\S]*?\*\/)/gm,
        number: /\b\d+\.?\d*\b/g,
        function: /\b([a-zA-Z_$][a-zA-Z0-9_$]*)\s*(?=\()/g,
        property: /\.([a-zA-Z_$][a-zA-Z0-9_$]*)/g,
        operator: /[+\-*/%=<>!&|^~?:]/g,
        bracket: /[(){}[\]]/g,
      },
      typescript: {
        keyword:
          /\b(const|let|var|function|return|if|else|for|while|do|switch|case|break|continue|try|catch|finally|throw|async|await|import|export|from|default|class|extends|constructor|super|this|new|typeof|instanceof|in|of|delete|void|null|undefined|true|false|interface|type|enum|namespace|public|private|protected|readonly|static)\b/g,
        string: /(["'`])(?:(?!\1)[^\\]|\\.)*\1/g,
        comment: /(\/\/.*$|\/\*[\s\S]*?\*\/)/gm,
        number: /\b\d+\.?\d*\b/g,
        function: /\b([a-zA-Z_$][a-zA-Z0-9_$]*)\s*(?=\()/g,
        property: /\.([a-zA-Z_$][a-zA-Z0-9_$]*)/g,
        type: /:\s*([a-zA-Z_$][a-zA-Z0-9_$]*(?:\[\])?)/g,
        operator: /[+\-*/%=<>!&|^~?:]/g,
        bracket: /[(){}[\]]/g,
      },
      python: {
        keyword:
          /\b(def|class|if|elif|else|for|while|try|except|finally|with|as|import|from|return|yield|break|continue|pass|raise|assert|del|global|nonlocal|lambda|and|or|not|in|is|True|False|None)\b/g,
        string: /(["'])(?:(?!\1)[^\\]|\\.)*\1|"""[\s\S]*?"""|'''[\s\S]*?'''/g,
        comment: /#.*$/gm,
        number: /\b\d+\.?\d*\b/g,
        function: /\bdef\s+([a-zA-Z_][a-zA-Z0-9_]*)/g,
        builtin:
          /\b(print|len|range|str|int|float|list|dict|tuple|set|bool|type|isinstance|hasattr|getattr|setattr|enumerate|zip|map|filter|sorted|sum|min|max|abs|round|open|input)\b/g,
        operator: /[+\-*/%=<>!&|^~]/g,
        bracket: /[(){}[\]]/g,
      },
      java: {
        keyword:
          /\b(public|private|protected|static|final|abstract|class|interface|extends|implements|import|package|if|else|for|while|do|switch|case|break|continue|try|catch|finally|throw|throws|return|new|this|super|null|true|false|void|int|double|float|long|short|byte|char|boolean|String)\b/g,
        string: /(["'])(?:(?!\1)[^\\]|\\.)*\1/g,
        comment: /(\/\/.*$|\/\*[\s\S]*?\*\/)/gm,
        number: /\b\d+\.?\d*[fFdDlL]?\b/g,
        function: /\b([a-zA-Z_$][a-zA-Z0-9_$]*)\s*(?=\()/g,
        annotation: /@[a-zA-Z_$][a-zA-Z0-9_$]*/g,
        operator: /[+\-*/%=<>!&|^~?:]/g,
        bracket: /[(){}[\]]/g,
      },
      html: {
        tag: /<\/?[a-zA-Z][a-zA-Z0-9]*(?:\s[^>]*)?\/?>/g,
        attribute: /\s([a-zA-Z-]+)(?==)/g,
        string: /(["'])(?:(?!\1)[^\\]|\\.)*\1/g,
        comment: /<!--[\s\S]*?-->/g,
        doctype: /<!DOCTYPE[^>]*>/gi,
      },
      css: {
        selector: /[.#]?[a-zA-Z][a-zA-Z0-9_-]*(?=\s*\{)/g,
        property: /([a-zA-Z-]+)(?=\s*:)/g,
        value: /:\s*([^;]+)/g,
        string: /(["'])(?:(?!\1)[^\\]|\\.)*\1/g,
        comment: /\/\*[\s\S]*?\*\//g,
        important: /!important/g,
        unit: /\b\d+(?:px|em|rem|%|vh|vw|pt|pc|in|cm|mm|ex|ch|vmin|vmax|deg|rad|turn|s|ms|Hz|kHz|dpi|dpcm|dppx)\b/g,
      },
      sql: {
        keyword:
          /\b(SELECT|FROM|WHERE|INSERT|UPDATE|DELETE|CREATE|ALTER|DROP|TABLE|INDEX|VIEW|DATABASE|SCHEMA|JOIN|INNER|LEFT|RIGHT|OUTER|ON|GROUP|ORDER|BY|HAVING|LIMIT|OFFSET|UNION|ALL|DISTINCT|AS|AND|OR|NOT|NULL|TRUE|FALSE|LIKE|IN|BETWEEN|EXISTS|CASE|WHEN|THEN|ELSE|END)\b/gi,
        string: /(["'])(?:(?!\1)[^\\]|\\.)*\1/g,
        comment: /(--.*$|\/\*[\s\S]*?\*\/)/gm,
        number: /\b\d+\.?\d*\b/g,
        function: /\b([a-zA-Z_][a-zA-Z0-9_]*)\s*(?=\()/g,
        operator: /[+\-*/%=<>!]/g,
      },
    }

    const patterns = tokenPatterns[language] || tokenPatterns.javascript

    // Create a map to store all tokens with their positions
    const tokens = []

    // Extract all tokens
    Object.entries(patterns).forEach(([type, pattern]) => {
      let match
      while ((match = pattern.exec(code)) !== null) {
        tokens.push({
          type,
          start: match.index,
          end: match.index + match[0].length,
          text: match[0],
          capture: match[1] || match[0], // Use capture group if available
        })
      }
    })

    // Sort tokens by position
    tokens.sort((a, b) => a.start - b.start)

    // Remove overlapping tokens (keep the first one)
    const filteredTokens = []
    let lastEnd = 0
    tokens.forEach((token) => {
      if (token.start >= lastEnd) {
        filteredTokens.push(token)
        lastEnd = token.end
      }
    })

    // Build highlighted code
    const result = []
    let currentPos = 0

    filteredTokens.forEach((token, index) => {
      // Add text before token
      if (token.start > currentPos) {
        result.push(code.slice(currentPos, token.start))
      }

      // Add highlighted token
      const className = `syntax-${token.type}`
      result.push(
        <span key={`token-${index}`} className={className}>
          {token.text}
        </span>,
      )

      currentPos = token.end
    })

    // Add remaining text
    if (currentPos < code.length) {
      result.push(code.slice(currentPos))
    }

    return result
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
      const declaredLanguage = match[1] || ""
      const code = match[2].trim()
      const detectedLanguage = detectLanguage(code, declaredLanguage)
      const currentBlockId = blockId++

      parts.push(
        <div key={`code-${currentBlockId}`} className="code-block-container">
          <div className="code-block-header">
            <span className="code-language">{detectedLanguage || "code"}</span>
            <button onClick={() => copyToClipboard(code, currentBlockId)} className="copy-button" title="Copy code">
              {copiedBlocks.has(currentBlockId) ? <Check size={16} /> : <Copy size={16} />}
            </button>
          </div>
          <pre className="code-block">
            <code className={`language-${detectedLanguage}`}>{highlightCode(code, detectedLanguage)}</code>
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
          margin: 12px 0;
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
          color: #d4d4d4;
          font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', 'Consolas', monospace;
          font-size: 14px;
          line-height: 1.5;
          overflow-x: auto;
          white-space: pre-wrap;
        }

        /* Syntax highlighting styles - VS Code theme */
        .syntax-keyword {
          color: #569cd6; /* Blue for keywords */
          font-weight: bold;
        }

        .syntax-string {
          color: #ce9178; /* Orange for strings */
        }

        .syntax-comment {
          color: #6a9955; /* Green for comments */
          font-style: italic;
        }

        .syntax-number {
          color: #b5cea8; /* Light green for numbers */
        }

        .syntax-function {
          color: #dcdcaa; /* Yellow for functions */
        }

        .syntax-property {
          color: #9cdcfe; /* Light blue for properties */
        }

        .syntax-type {
          color: #4ec9b0; /* Teal for types */
        }

        .syntax-operator {
          color: #d4d4d4; /* White for operators */
        }

        .syntax-bracket {
          color: #ffd700; /* Gold for brackets */
        }

        .syntax-builtin {
          color: #4fc1ff; /* Bright blue for built-ins */
        }

        .syntax-tag {
          color: #569cd6; /* Blue for HTML tags */
        }

        .syntax-attribute {
          color: #92c5f8; /* Light blue for attributes */
        }

        .syntax-selector {
          color: #d7ba7d; /* Tan for CSS selectors */
        }

        .syntax-value {
          color: #ce9178; /* Orange for CSS values */
        }

        .syntax-important {
          color: #f44747; /* Red for !important */
          font-weight: bold;
        }

        .syntax-unit {
          color: #b5cea8; /* Light green for units */
        }

        .syntax-annotation {
          color: #4ec9b0; /* Teal for Java annotations */
        }

        .syntax-doctype {
          color: #808080; /* Gray for DOCTYPE */
        }

        .inline-code {
          background: rgba(255, 255, 255, 0.1);
          color: #e6e6e6;
          padding: 2px 6px;
          border-radius: 4px;
          font-family: 'Monaco', 'Menlo', 'Ubuntu Mono', 'Consolas', monospace;
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

        .message-line {
          margin-bottom: 8px;
          line-height: 1.6;
        }

        .message-line:last-child {
          margin-bottom: 0;
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

        /* Light theme syntax highlighting */
        .message-user .syntax-keyword {
          color: #0000ff; /* Blue for keywords */
        }

        .message-user .syntax-string {
          color: #a31515; /* Red for strings */
        }

        .message-user .syntax-comment {
          color: #008000; /* Green for comments */
        }

        .message-user .syntax-number {
          color: #098658; /* Dark green for numbers */
        }

        .message-user .syntax-function {
          color: #795e26; /* Brown for functions */
        }

        .message-user .syntax-property {
          color: #001080; /* Dark blue for properties */
        }

        .message-user .syntax-type {
          color: #267f99; /* Teal for types */
        }

        .message-user .syntax-operator {
          color: #000000; /* Black for operators */
        }

        .message-user .syntax-bracket {
          color: #000000; /* Black for brackets */
        }

        .message-user .syntax-builtin {
          color: #0000ff; /* Blue for built-ins */
        }

        .message-user .inline-code {
          background: rgba(175, 184, 193, 0.2);
          color: #24292f;
          border-color: rgba(175, 184, 193, 0.2);
        }

        .message-user .message-h1,
        .message-user .message-h2,
        .message-user .message-h3,
        .message-user .message-bold {
          color: white;
        }

        .message-user .message-h1 {
          border-bottom-color: rgba(255, 255, 255, 0.3);
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
