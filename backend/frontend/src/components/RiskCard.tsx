import type { Risk } from "../types/risk";

interface Props {
  risk: Risk;
}

export default function RiskCard({ risk }: Props) {
  const styles = {
    High: {
      border: "border-red-500",
      bg: "bg-red-50",
      badge: "bg-red-600 text-white",
      icon: "🔴",
    },
    Medium: {
      border: "border-yellow-500",
      bg: "bg-yellow-50",
      badge: "bg-yellow-500 text-white",
      icon: "🟡",
    },
    Low: {
      border: "border-green-500",
      bg: "bg-green-50",
      badge: "bg-green-600 text-white",
      icon: "🟢",
    },
  };

  const style = styles[risk.level];

  return (
    <div
      className={`border-l-4 ${style.border} ${style.bg} rounded-xl p-4 shadow-sm mb-4`}
    >
      <div className="flex justify-between items-center">

        <h3 className="font-bold text-lg">
          {style.icon} {risk.title}
        </h3>

        <span
          className={`px-3 py-1 rounded-full text-xs font-bold ${style.badge}`}
        >
          {risk.level}
        </span>

      </div>

      <p className="mt-3 text-gray-700 leading-relaxed">
        {risk.description}
      </p>
    </div>
  );
}