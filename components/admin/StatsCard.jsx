export default function StatsCard({
  title,
  value,
  icon: Icon,
  subtitle,
  color = "cyan",
  highlight = false,
}) {
  const colorMap = {
    cyan: {
      bg: "from-cyan-900/40 to-cyan-950/40",
      border: "border-cyan-500/30",
      icon: "text-cyan-400",
      text: "text-cyan-400",
    },
    emerald: {
      bg: "from-emerald-900/40 to-emerald-950/40",
      border: "border-emerald-500/30",
      icon: "text-emerald-400",
      text: "text-emerald-400",
    },
    blue: {
      bg: "from-blue-900/40 to-blue-950/40",
      border: "border-blue-500/30",
      icon: "text-blue-400",
      text: "text-blue-400",
    },
    violet: {
      bg: "from-violet-900/40 to-violet-950/40",
      border: "border-violet-500/30",
      icon: "text-violet-400",
      text: "text-violet-400",
    },
    rose: {
      bg: "from-rose-900/40 to-rose-950/40",
      border: "border-rose-500/30",
      icon: "text-rose-400",
      text: "text-rose-400",
    },
  };

  const colors = colorMap[color];

  return (
    <div
      className={`rounded-2xl bg-gradient-to-br ${colors.bg} ${colors.border} border backdrop-blur-sm p-6 hover:border-opacity-50 transition-all duration-300 ${
        highlight
          ? "ring-2 ring-offset-2 ring-offset-blue-950 ring-rose-500/50 shadow-lg shadow-rose-500/20"
          : "hover:shadow-lg"
      }`}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-medium text-gray-400 uppercase tracking-wider">
            {title}
          </p>
          <p className="text-3xl font-bold text-white mt-2 leading-tight">
            {value}
          </p>
          {subtitle && <p className="text-xs text-gray-500 mt-2">{subtitle}</p>}
        </div>

        {Icon && (
          <div className={`p-3 rounded-lg bg-blue-950/40`}>
            <Icon size={24} className={colors.icon} />
          </div>
        )}
      </div>
    </div>
  );
}
