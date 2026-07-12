/**
 * Parses the structured markdown output from Lexora AI into typed sections.
 *
 * The AI is instructed to produce:
 *   ## 1. Clause Summary
 *   ## 2. Risk Assessment
 *   … and so on up to ## 10. Conclusion
 */

export interface ParsedSection {
  number: number;
  title: string;
  content: string;
  /** Derived badge for the Risk & Compliance Level section */
  riskLevel?: "low" | "moderate" | "high";
}

export interface ParsedAIResponse {
  sections: ParsedSection[];
  /** true when the response was structured (had ## headings) */
  isStructured: boolean;
  /** raw text for fallback */
  raw: string;
}

// Map the AI heading titles to canonical keys we use for icons/styles
export const SECTION_META: Record<
  number,
  { short: string; icon: string; accentClass: string }
> = {
  1:  { short: "Clause Summary",       icon: "FileText",      accentClass: "cyan"   },
  2:  { short: "Risk Assessment",       icon: "AlertTriangle", accentClass: "rose"   },
  3:  { short: "Legal References",      icon: "BookOpen",      accentClass: "violet" },
  4:  { short: "Industry Benchmark",    icon: "BarChart2",     accentClass: "blue"   },
  5:  { short: "Compliance Check",      icon: "ShieldCheck",   accentClass: "emerald"},
  6:  { short: "Safer Alternative",     icon: "Pencil",        accentClass: "amber"  },
  7:  { short: "Ambiguities & Conflicts",icon: "AlertCircle",  accentClass: "orange" },
  8:  { short: "Probable Risks",        icon: "Zap",           accentClass: "red"    },
  9:  { short: "Risk & Compliance Level",icon: "Gauge",        accentClass: "pink"   },
  10: { short: "Conclusion",            icon: "CheckCircle2",  accentClass: "teal"   },
};

function detectRiskLevel(content: string): "low" | "moderate" | "high" | undefined {
  const lower = content.toLowerCase();
  if (lower.includes("🔴") || lower.includes("high risk"))     return "high";
  if (lower.includes("🟡") || lower.includes("moderate risk")) return "moderate";
  if (lower.includes("🟢") || lower.includes("low risk"))      return "low";
  return undefined;
}

export function parseAIResponse(raw: string): ParsedAIResponse {
  // Match headings like:  ## 1. Clause Summary  or  **1. Clause Summary**
  const headingRegex = /^#{1,3}\s+(\d+)\.\s+(.+)$/gm;

  const matches: Array<{ number: number; title: string; index: number }> = [];
  let m: RegExpExecArray | null;
  while ((m = headingRegex.exec(raw)) !== null) {
    matches.push({
      number: parseInt(m[1], 10),
      title: m[2].trim(),
      index: m.index,
    });
  }

  if (matches.length === 0) {
    return { sections: [], isStructured: false, raw };
  }

  const sections: ParsedSection[] = matches.map((match, i) => {
    const start = match.index + raw.slice(match.index).indexOf("\n") + 1;
    const end   = i + 1 < matches.length ? matches[i + 1].index : raw.length;
    const content = raw.slice(start, end).trim();

    return {
      number:    match.number,
      title:     match.title,
      content,
      riskLevel: match.number === 9 ? detectRiskLevel(content) : undefined,
    };
  });

  return { sections, isStructured: true, raw };
}
