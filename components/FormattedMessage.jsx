import "katex/dist/katex.min.css";
import {
  BookOpen,
  Braces,
  Check,
  CheckCircle,
  Circle,
  Code,
  Copy,
  FileText,
  GitBranch,
  Hash,
  Link,
  Quote,
  Terminal,
} from "lucide-react";
import { useState } from "react";
import ReactMarkdown from "react-markdown";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism";
import rehypeKatex from "rehype-katex";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import McqCard from "./McqCard";

// Clean and normalize text - FIX for [object Object]
function normalizeText(text) {
  if (!text) return "";

  // Convert to string if it's not already
  let cleanText = typeof text === "string" ? text : String(text);

  // Fix [object Object] issues
  cleanText = cleanText.replace(/\[object Object\]/g, "");

  // Fix common JSON stringification issues
  cleanText = cleanText.replace(/\{.*?\}/g, (match) => {
    try {
      // Try to parse and stringify properly
      const parsed = JSON.parse(match);
      return JSON.stringify(parsed, null, 2);
    } catch {
      return match;
    }
  });

  // Insert spacing for consecutive bold headings
  cleanText = cleanText.replace(
    /(\*\*[^*]+\*\*)\s*(\*\*[^*]+\*\*)/g,
    "$1\n\n$2",
  );

  // Ensure bold headings are separated from following content
  cleanText = cleanText.replace(/(\*\*[^*]+\*\*)([A-Z])/g, "$1\n\n$2");

  // Fix missing newlines between sentences and common headings
  cleanText = cleanText.replace(/([a-zA-Z])There are/g, "$1\n\nThere are");
  cleanText = cleanText.replace(/([a-zA-Z])Here'?s/g, "$1\n\nHere's");
  cleanText = cleanText.replace(/([^\n])(\bExample:)/g, "$1\n\n$2");
  cleanText = cleanText.replace(/([^\n])(\bConclusion\b)/g, "$1\n\n$2");

  // Convert bold-only lines into headings
  cleanText = cleanText.replace(/^\*\*([^*]+)\*\*$/gm, "## $1");

  // Convert label-style lines into list items (avoid obvious headings)
  cleanText = cleanText.replace(
    /^(?!\s*[-*+]\s|\s*\d+[.)]\s|\s*#)([A-Za-z][A-Za-z0-9/+ .-]{1,40}:\s+.+)$/gm,
    (match) => {
      const lower = match.toLowerCase();
      if (
        lower.startsWith("example:") ||
        lower.startsWith("conclusion") ||
        lower.startsWith("types of")
      ) {
        return match;
      }
      return `- ${match}`;
    },
  );

  // Convert language label blocks into fenced code blocks
  cleanText = cleanText.replace(
    /(^|\n)(jsx|javascript|js|tsx|ts)\s*\n([\s\S]*?)(?=\n{2,}|$)/g,
    (match, lead, lang, code) => {
      if (/```/.test(code)) return match;
      const trimmed = code.replace(/\n+$/, "");
      const looksLikeCode =
        /^(?:import|const|function|class|export|return|<)/m.test(trimmed);
      if (!looksLikeCode) return match;
      return `${lead}\n\`\`\`${lang}\n${trimmed}\n\`\`\`\n`;
    },
  );

  // Clean up the text
  return cleanText
    .replace(/•/g, "-")
    .replace(/\*\*\s*/g, "**")
    .replace(/\n{3,}/g, "\n\n")
    .replace(/,{2,}/g, ",")
    .replace(/\.{2,}/g, ".")
    .trim();
}

// Detect code blocks and tutorials
function detectContentType(text) {
  const normalized = normalizeText(text);

  // Check if it's MCQ first to avoid tutorial misclassification
  if (/(?:question|प्रश्न)\s*\d+[:.]/i.test(normalized)) {
    return "quiz";
  }

  // Check if it's a tutorial/guide
  const hasSteps = /step\s+\d+|^\d+\./gim.test(normalized);
  const hasCommands = /\$ |npm |node |install |express/gim.test(normalized);
  const hasFileCreation = /create a (new )?file|app\.js|package\.json/gim.test(
    normalized,
  );

  if (hasSteps || hasCommands || hasFileCreation) {
    return "tutorial";
  }

  return "general";
}

// Parse tutorial steps
function parseTutorialSteps(text) {
  const clean = normalizeText(text);
  const steps = [];

  // Split by step markers
  const stepRegex = /(?:step|Stage|Phase|Part)\s+(\d+)[:.)]\s*([^\n]+)/gim;
  let match;

  while ((match = stepRegex.exec(clean)) !== null) {
    steps.push({
      number: parseInt(match[1]),
      title: match[2].trim(),
      content: extractStepContent(clean, match.index),
    });
  }

  // If no explicit steps found, try numbered list
  if (steps.length === 0) {
    const numberedRegex = /^\s*(\d+)[.)]\s+(.+)$/gim;
    while ((match = numberedRegex.exec(clean)) !== null) {
      steps.push({
        number: parseInt(match[1]),
        title: match[2].trim(),
        content: match[0],
      });
    }
  }

  return steps.length > 0 ? steps : null;
}

function extractStepContent(text, startIndex) {
  const nextStep = /(?:step|Stage|Phase|Part)\s+\d+/gi;
  nextStep.lastIndex = startIndex + 1;
  const nextMatch = nextStep.exec(text);

  if (nextMatch) {
    return text.substring(startIndex, nextMatch.index).trim();
  }
  return text.substring(startIndex).trim();
}

// Extract commands from text
function extractCommands(text) {
  const commands = [];
  const commandRegex =
    /(?:^\$ |^>\s*|```(?:bash|sh|shell|cmd|powershell)?\s*\n)([^\n]+(?:&&[^\n]+)*)/gim;
  let match;

  while ((match = commandRegex.exec(text)) !== null) {
    commands.push({
      command: match[1].trim(),
      fullMatch: match[0],
    });
  }

  return commands;
}

// Tutorial Step Component
function TutorialStep({ number, title, content }) {
  const [copied, setCopied] = useState(false);
  const commands = extractCommands(content);

  const copyAllCommands = async () => {
    const commandText = commands.map((c) => c.command).join("\n");
    await navigator.clipboard.writeText(commandText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="relative pl-12 pb-8 group">
      {/* Step Number Badge */}
      <div className="absolute left-0 top-0 w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center font-semibold text-white shadow-lg">
        {number}
      </div>

      {/* Connector Line */}
      <div className="absolute left-4 top-8 bottom-0 w-0.5 bg-gradient-to-b from-blue-500/50 to-transparent" />

      <div className="bg-[#1A1A1A] border border-gray-800 rounded-xl p-6 hover:border-gray-700 transition-all">
        {/* Step Title */}
        <h3 className="text-lg font-semibold text-gray-100 mb-4 flex items-center gap-2">
          <GitBranch className="w-5 h-5 text-blue-400" />
          {title}
        </h3>

        {/* Step Content */}
        <div className="prose prose-invert max-w-none mb-4">
          <ReactMarkdown
            remarkPlugins={[remarkGfm, remarkMath]}
            rehypePlugins={[rehypeKatex]}
            components={MarkdownComponents}
          >
            {content.replace(/^.*?:\s*/, "")}
          </ReactMarkdown>
        </div>

        {/* Commands Section */}
        {commands.length > 0 && (
          <div className="mt-4 space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-medium text-gray-400 flex items-center gap-2">
                <Terminal className="w-4 h-4" />
                Commands to execute:
              </h4>
              {commands.length > 1 && (
                <button
                  onClick={copyAllCommands}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-800 hover:bg-gray-700 rounded-lg text-xs text-gray-300 transition-colors"
                >
                  {copied ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-green-400" />
                      Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      Copy All
                    </>
                  )}
                </button>
              )}
            </div>
            {commands.map((cmd, idx) => (
              <CommandBlock key={idx} command={cmd.command} />
            ))}
          </div>
        )}

        {/* File Creation Indicator */}
        {content.includes("create a new file") ||
        content.includes("app.js") ||
        content.includes("package.json") ? (
          <div className="mt-4 flex items-center gap-2 text-sm text-green-400 bg-green-500/10 p-3 rounded-lg border border-green-500/20">
            <FileText className="w-4 h-4" />
            <span>File creation detected</span>
          </div>
        ) : null}
      </div>
    </div>
  );
}

// Command Block Component
function CommandBlock({ command }) {
  const [copied, setCopied] = useState(false);

  const copyCommand = async () => {
    await navigator.clipboard.writeText(command);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="relative group">
      <div className="bg-[#0D1117] rounded-lg border border-gray-800 font-mono text-sm overflow-hidden">
        <div className="flex items-center justify-between px-4 py-2 bg-gray-900/50 border-b border-gray-800">
          <div className="flex items-center gap-2">
            <Terminal className="w-3.5 h-3.5 text-gray-500" />
            <span className="text-xs text-gray-500">Terminal</span>
          </div>
          <button
            onClick={copyCommand}
            className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-gray-800 rounded"
          >
            {copied ? (
              <Check className="w-3.5 h-3.5 text-green-400" />
            ) : (
              <Copy className="w-3.5 h-3.5 text-gray-500" />
            )}
          </button>
        </div>
        <div className="px-4 py-3 flex items-center gap-2">
          <span className="text-green-400 select-none">$</span>
          <code className="text-gray-300">{command}</code>
        </div>
      </div>
    </div>
  );
}

// Code Block Component
function CodeBlock({ language, value }) {
  const [copied, setCopied] = useState(false);

  const copyCode = async () => {
    await navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getLanguageIcon = () => {
    switch (language) {
      case "javascript":
      case "js":
        return <Braces className="w-4 h-4" />;
      case "python":
        return <Braces className="w-4 h-4" />;
      case "bash":
      case "sh":
        return <Terminal className="w-4 h-4" />;
      case "json":
        return <Braces className="w-4 h-4" />;
      case "html":
        return <FileText className="w-4 h-4" />;
      case "css":
        return <FileText className="w-4 h-4" />;
      default:
        return <Code className="w-4 h-4" />;
    }
  };

  return (
    <div className="relative group my-6">
      <div className="absolute right-3 top-3 z-10">
        <button
          onClick={copyCode}
          className="opacity-0 group-hover:opacity-100 transition-opacity p-2 bg-gray-800 hover:bg-gray-700 rounded-lg border border-gray-700"
          title="Copy code"
        >
          {copied ? (
            <Check className="w-4 h-4 text-green-400" />
          ) : (
            <Copy className="w-4 h-4 text-gray-400" />
          )}
        </button>
      </div>
      <div className="rounded-lg overflow-hidden border border-gray-800">
        <div className="flex items-center gap-2 px-4 py-2 bg-gray-900/90 border-b border-gray-800">
          {getLanguageIcon()}
          <span className="text-xs font-mono text-gray-400">
            {language || "code"}
          </span>
        </div>
        <SyntaxHighlighter
          style={vscDarkPlus}
          language={language || "javascript"}
          PreTag="div"
          className="!mt-0 !rounded-none"
          showLineNumbers={value.split("\n").length > 5}
        >
          {value}
        </SyntaxHighlighter>
      </div>
    </div>
  );
}

// Markdown Components
const MarkdownComponents = {
  h1: ({ children }) => (
    <h1 className="text-2xl font-bold text-gray-100 mt-8 mb-4 pb-3 border-b border-gray-800">
      {children}
    </h1>
  ),
  h2: ({ children }) => (
    <h2 className="text-xl font-semibold text-gray-100 mt-6 mb-3 flex items-center gap-2">
      <Hash className="w-5 h-5 text-blue-400" />
      {children}
    </h2>
  ),
  h3: ({ children }) => (
    <h3 className="text-lg font-medium text-gray-200 mt-5 mb-2 flex items-center gap-2">
      <Circle className="w-2 h-2 text-blue-400" />
      {children}
    </h3>
  ),
  p: ({ children }) => {
    // Check if paragraph contains code
    const hasCode =
      typeof children === "string" &&
      (children.includes("npm") ||
        children.includes("node") ||
        children.includes("http://"));

    return (
      <p
        className={`text-gray-300 leading-relaxed mb-4 ${hasCode ? "font-mono text-sm bg-gray-900/30 p-2 rounded" : ""}`}
      >
        {children}
      </p>
    );
  },
  ul: ({ children }) => (
    <ul className="space-y-2 mb-4 list-none">{children}</ul>
  ),
  ol: ({ children }) => (
    <ol className="space-y-2 mb-4 list-decimal list-inside marker:text-blue-400">
      {children}
    </ol>
  ),
  li: ({ children }) => (
    <li className="flex items-start gap-2 text-gray-300">
      <Circle className="w-1.5 h-1.5 mt-2 text-blue-400/70 flex-shrink-0" />
      <span>{children}</span>
    </li>
  ),
  code({ inline, className, children, ...props }) {
    const match = /language-(\w+)/.exec(className || "");
    const value = String(children).replace(/\n$/, "");

    if (!inline && match) {
      return <CodeBlock language={match[1]} value={value} />;
    }

    // Inline code
    return (
      <code className="bg-gray-900/80 px-1.5 py-0.5 rounded-md text-sm text-blue-300 border border-gray-800 font-mono">
        {children}
      </code>
    );
  },
  blockquote: ({ children }) => (
    <blockquote className="border-l-4 border-blue-500/50 bg-blue-500/5 pl-4 py-3 my-4 rounded-r-lg">
      <div className="text-gray-400 italic flex items-start gap-2">
        <Quote className="w-4 h-4 text-blue-400/50 flex-shrink-0 mt-1" />
        <span>{children}</span>
      </div>
    </blockquote>
  ),
  a: ({ href, children }) => (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="text-blue-400 hover:text-blue-300 underline underline-offset-2 decoration-blue-500/30 transition-colors"
    >
      {children}
      <Link className="w-3.5 h-3.5 inline ml-1" />
    </a>
  ),
  hr: () => <hr className="my-8 border-t border-gray-800" />,
  table: ({ children }) => (
    <div className="overflow-x-auto my-4 rounded-lg border border-gray-800">
      <table className="w-full text-sm text-gray-300">{children}</table>
    </div>
  ),
  thead: ({ children }) => (
    <thead className="bg-gray-900/60 text-gray-200">{children}</thead>
  ),
  tbody: ({ children }) => (
    <tbody className="divide-y divide-gray-800">{children}</tbody>
  ),
  tr: ({ children }) => <tr className="align-top">{children}</tr>,
  th: ({ children }) => (
    <th className="px-3 py-2 text-left font-semibold">{children}</th>
  ),
  td: ({ children }) => <td className="px-3 py-2">{children}</td>,
};

// Main FormattedMessage Component
export default function FormattedMessage({ text, streaming }) {
  const [copiedAll, setCopiedAll] = useState(false);
  const contentType = detectContentType(text);
  const tutorialSteps =
    contentType === "tutorial" ? parseTutorialSteps(text) : null;
  const mcqs = contentType === "quiz" ? parseMCQs(text) : null;

  const rawText = typeof text === "string" ? text : String(text ?? "");
  const normalizedText = normalizeText(text);
  const renderText = normalizedText.trim() ? normalizedText : rawText;

  // Copy entire message
  const copyAllContent = async () => {
    await navigator.clipboard.writeText(renderText);
    setCopiedAll(true);
    setTimeout(() => setCopiedAll(false), 2000);
  };

  // Render MCQs
  if (mcqs) {
    return (
      <div className="space-y-4">
        {mcqs.map((mcq) => (
          <McqCard key={mcq.id} {...mcq} />
        ))}
      </div>
    );
  }

  // Render Tutorial with Steps
  if (tutorialSteps) {
    return (
      <div className="relative">
        {/* Tutorial Header */}
        <div className="mb-8 p-6 bg-gradient-to-br from-blue-500/10 to-purple-500/10 rounded-xl border border-blue-500/20">
          <div className="flex items-start justify-between">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                <BookOpen className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-100 mb-2">
                  Step-by-Step Tutorial
                </h2>
                <p className="text-gray-400 text-sm">
                  Follow these steps to complete the tutorial
                </p>
              </div>
            </div>
            <button
              onClick={copyAllContent}
              className="flex items-center gap-2 px-4 py-2 bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors"
            >
              {copiedAll ? (
                <>
                  <Check className="w-4 h-4 text-green-400" />
                  <span className="text-sm text-gray-300">Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4 text-gray-400" />
                  <span className="text-sm text-gray-300">Copy All</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Tutorial Steps */}
        <div className="space-y-0">
          {tutorialSteps.map((step, index) => (
            <TutorialStep key={index} {...step} />
          ))}
        </div>

        {/* Completion Message */}
        <div className="mt-8 p-6 bg-gradient-to-br from-green-500/10 to-emerald-500/10 rounded-xl border border-green-500/20">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-green-500/20 rounded-lg flex items-center justify-center">
              <CheckCircle className="w-5 h-5 text-green-400" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-green-400 mb-1">
                Tutorial Complete!
              </h3>
              <p className="text-sm text-gray-400">
                You've successfully completed all steps. Your Node.js app is now
                ready!
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Render General Content
  return (
    <div className="relative group">
      {streaming && (
        <div className="absolute -left-3 top-1/2 -translate-y-1/2">
          <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse" />
        </div>
      )}

      {/* Copy button for general content */}
      <div className="absolute -top-3 right-0 opacity-0 group-hover:opacity-100 transition-opacity z-10">
        <button
          onClick={copyAllContent}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-800 hover:bg-gray-700 rounded-lg border border-gray-700 shadow-lg"
        >
          {copiedAll ? (
            <>
              <Check className="w-3.5 h-3.5 text-green-400" />
              <span className="text-xs text-gray-300">Copied!</span>
            </>
          ) : (
            <>
              <Copy className="w-3.5 h-3.5 text-gray-400" />
              <span className="text-xs text-gray-300">Copy</span>
            </>
          )}
        </button>
      </div>

      <div className="prose prose-invert max-w-none">
        <ReactMarkdown
          remarkPlugins={[remarkGfm, remarkMath]}
          rehypePlugins={[rehypeKatex]}
          components={MarkdownComponents}
        >
          {renderText}
        </ReactMarkdown>
      </div>
    </div>
  );
}

// MCQ parsing function (moved here for completeness)
function parseMCQs(text) {
  const clean = normalizeText(text);

  const hasQuizFormat = /(?:question|प्रश्न)\s*\d+[:.]/i.test(clean);
  if (!hasQuizFormat) return null;

  // Extract the final "Correct Answers:" summary line if it exists
  const answerKeyMatch = clean.match(/correct\s+answers?\s*[:.\-]\s*([^\n]+)/i);
  let answerKeyMap = {};

  if (answerKeyMatch) {
    // Parse the answer key: "Q1-A, Q2-D, Q3-C, ..." or "1-A, 2-D, 3-C, ..."
    const answerString = answerKeyMatch[1];
    const answerPairs = answerString.match(/([QqQ]?\d+)\s*[-:]\s*([A-Da-d])/g);

    if (answerPairs) {
      answerPairs.forEach((pair) => {
        const match = pair.match(/([QqQ]?\d+)\s*[-:]\s*([A-Da-d])/);
        if (match) {
          const qNumber = match[1].replace(/[Qq]/i, "");
          const letter = match[2].toUpperCase();
          answerKeyMap[parseInt(qNumber)] = letter;
        }
      });
    }
  }

  const parts = clean.split(/(?:question|प्रश्न)\s*\d+[:.]/i);
  if (parts.length <= 1) return null;

  return parts.slice(1).map((block, index) => {
    const questionNumber = index + 1;
    const lines = block
      .split("\n")
      .map((l) => l.trim())
      .filter(Boolean);

    const question = lines[0];
    const options = lines.filter((l) => /^[A-Da-d]\s*[.)-]/.test(l));
    const answerLine = lines.find((l) =>
      /^(?:answer|उत्तर)\s*[:.\-]?/i.test(l),
    );
    const explanationLine = lines.find((l) =>
      /^(?:explanation|स्पष्टीकरण)\s*[:.]/i.test(l),
    );

    // First, try to use the answer from the final answer key
    let answer = answerKeyMap[questionNumber];

    // Fallback to per-question answer line if key not found
    if (!answer) {
      let answerText = answerLine?.replace(
        /^(?:answer|उत्तर)\s*[:.\-]?\s*/i,
        "",
      );
      const answerMatch = answerText?.match(/^([A-Da-d])\b/);
      if (answerMatch) {
        answer = answerMatch[1].toUpperCase();
      }
    }

    return {
      id: index,
      question,
      options,
      answer,
      explanation: explanationLine?.replace(
        /^(?:explanation|स्पष्टीकरण)\s*[:.]\s*/i,
        "",
      ),
    };
  });
}
