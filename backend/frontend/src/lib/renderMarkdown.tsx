import type { ReactNode } from "react";

/**
 * Lightweight markdown → React renderer.
 * Handles: bullet lists (- / *), numbered lists, bold (**text**),
 * inline code (`code`), blockquotes (>), and plain paragraphs.
 * No external dependency needed.
 */

function renderInline(text: string): ReactNode {
  // Split on **bold**, `code`, and emoji risk indicators
  const parts = text.split(/(\*\*[^*]+\*\*|`[^`]+`)/g);
  return parts.map((part, i) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      const rawText = part.slice(2, -2);
      const riskKeywords = [
        "automatic renewal", "auto-renewal", "non-compete", "limitation of liability",
        "governing law", "termination for convenience", "indemnification",
        "ip ownership", "payment terms", "non-solicitation", "risky clauses",
        "unusual clauses", "risky", "liability", "termination", "indemnity"
      ];
      const isRisk = riskKeywords.some(kw => rawText.toLowerCase().includes(kw));
      if (isRisk) {
        return (
          <span
            key={i}
            className="px-1.5 py-0.5 rounded bg-rose-500/10 border border-rose-500/25 text-rose-300 font-semibold shadow-[0_0_8px_rgba(239,68,68,0.12)] inline-block mx-0.5"
          >
            {rawText}
          </span>
        );
      }
      return <strong key={i} className="text-white font-semibold">{rawText}</strong>;
    }
    if (part.startsWith("`") && part.endsWith("`")) {
      return (
        <code key={i} className="px-1.5 py-0.5 rounded-md text-[11px] font-mono bg-white/8 text-violet-300">
          {part.slice(1, -1)}
        </code>
      );
    }
    return <span key={i}>{part}</span>;
  });
}

export function renderMarkdownContent(raw: string): ReactNode {
  if (!raw.trim()) return null;

  const lines = raw.split("\n");
  const nodes: ReactNode[] = [];
  let bulletBuffer: string[] = [];
  let numberedBuffer: Array<{ num: string; text: string }> = [];
  let blockquoteBuffer: string[] = [];

  const flushBullets = () => {
    if (!bulletBuffer.length) return;
    nodes.push(
      <ul key={`ul-${nodes.length}`} className="space-y-1.5 my-2">
        {bulletBuffer.map((item, i) => (
          <li key={i} className="flex items-start gap-2 text-[13px] text-slate-600 leading-relaxed">
            <span className="mt-[5px] w-1 h-1 rounded-full bg-slate-400 flex-shrink-0" />
            <span>{renderInline(item)}</span>
          </li>
        ))}
      </ul>
    );
    bulletBuffer = [];
  };

  const flushNumbered = () => {
    if (!numberedBuffer.length) return;
    nodes.push(
      <ol key={`ol-${nodes.length}`} className="space-y-1.5 my-2">
        {numberedBuffer.map((item, i) => (
          <li key={i} className="flex items-start gap-2.5 text-[13px] text-slate-600 leading-relaxed">
            <span className="flex-shrink-0 w-5 h-5 rounded-full bg-slate-100 flex items-center justify-center text-[10px] font-bold text-slate-400 border border-slate-200/50">
              {item.num}
            </span>
            <span className="pt-0.5">{renderInline(item.text)}</span>
          </li>
        ))}
      </ol>
    );
    numberedBuffer = [];
  };

  const flushBlockquote = () => {
    if (!blockquoteBuffer.length) return;
    nodes.push(
      <blockquote
        key={`bq-${nodes.length}`}
        className="my-2 pl-3 border-l-2 border-violet-500/40 text-[12px] text-slate-500 italic leading-relaxed"
      >
        {blockquoteBuffer.join(" ")}
      </blockquote>
    );
    blockquoteBuffer = [];
  };

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const trimmed = line.trim();

    if (!trimmed) {
      flushBullets();
      flushNumbered();
      flushBlockquote();
      continue;
    }

    // Blockquote
    if (trimmed.startsWith("> ")) {
      flushBullets(); flushNumbered();
      blockquoteBuffer.push(trimmed.slice(2));
      continue;
    }

    // Bullet list
    if (/^[-*•]\s+/.test(trimmed)) {
      flushNumbered(); flushBlockquote();
      bulletBuffer.push(trimmed.replace(/^[-*•]\s+/, ""));
      continue;
    }

    // Numbered list  1. 2. etc.
    const numMatch = trimmed.match(/^(\d+)\.\s+(.+)/);
    if (numMatch) {
      flushBullets(); flushBlockquote();
      numberedBuffer.push({ num: numMatch[1], text: numMatch[2] });
      continue;
    }

    // Risk level indicators — render as a badge
    if (/🔴|🟡|🟢/.test(trimmed)) {
      flushBullets(); flushNumbered(); flushBlockquote();
      const isHigh     = trimmed.includes("🔴");
      const isModerate = trimmed.includes("🟡");
      const colors = isHigh
        ? "bg-rose-500/15 border-rose-500/30 text-rose-400 shadow-[0_0_8px_rgba(244,63,94,0.1)]"
        : isModerate
        ? "bg-amber-500/15 border-amber-500/30 text-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.06)]"
        : "bg-emerald-500/15 border-emerald-500/30 text-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.06)]";

      nodes.push(
        <div key={`badge-${i}`}
          className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-xl border text-sm font-semibold my-2 ${colors}`}
        >
          {trimmed}
        </div>
      );
      continue;
    }

    // Sub-heading (###) inside a section
    if (trimmed.startsWith("###")) {
      flushBullets(); flushNumbered(); flushBlockquote();
      nodes.push(
        <p key={`h3-${i}`} className="text-[11px] text-slate-500 uppercase tracking-widest font-semibold mt-3 mb-1">
          {trimmed.replace(/^#+\s*/, "")}
        </p>
      );
      continue;
    }

    // Horizontal rule
    if (/^---+$/.test(trimmed)) {
      flushBullets(); flushNumbered(); flushBlockquote();
      nodes.push(<hr key={`hr-${i}`} className="border-slate-100 my-2" />);
      continue;
    }

    // Plain paragraph
    flushBullets(); flushNumbered(); flushBlockquote();
    nodes.push(
      <p key={`p-${i}`} className="text-[13px] text-slate-700 leading-relaxed font-sans">
        {renderInline(trimmed)}
      </p>
    );
  }

  // Flush any remaining
  flushBullets();
  flushNumbered();
  flushBlockquote();

  return <div className="space-y-1">{nodes}</div>;
}
