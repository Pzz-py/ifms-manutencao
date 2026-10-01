const TONS = {
  neutral: "bg-neutral-100 text-neutral-600",
  primary: "bg-primary-50 text-primary-600",
  accent: "bg-accent-50 text-accent-600",
  urgent: "bg-priority-urgente/10 text-priority-urgente",
};

/**
 * Card de indicador (KPI) do dashboard.
 * Ex: <StatCard icon={ClipboardList} label="Total de chamados" value={42} tone="primary" />
 */
export default function StatCard({ icon: Icon, label, value, tone = "neutral" }) {
  return (
    <div className="surface-card p-5 flex items-center gap-4">
      <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 ${TONS[tone]}`}>
        <Icon className="w-5 h-5" />
      </div>
      <div className="min-w-0">
        <p className="font-display text-2xl font-bold text-neutral-900 leading-none">
          {value}
        </p>
        <p className="text-sm text-neutral-500 mt-1.5 truncate">{label}</p>
      </div>
    </div>
  );
}
