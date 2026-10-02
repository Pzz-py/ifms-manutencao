import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";
import { PRIORIDADE_CONFIG, ORDEM_PRIORIDADE } from "../../utils/prioridadeConfig";

export default function ChamadosPorPrioridadeChart({ dados }) {
  const total = ORDEM_PRIORIDADE.reduce((soma, p) => soma + (dados[p] || 0), 0);

  const dadosGrafico = ORDEM_PRIORIDADE.map((prioridade) => ({
    prioridade,
    label: PRIORIDADE_CONFIG[prioridade].label,
    quantidade: dados[prioridade] || 0,
  }));

  if (total === 0) {
    return (
      <div className="h-[220px] flex items-center justify-center text-sm text-neutral-400">
        Nenhum chamado registrado ainda.
      </div>
    );
  }

  return (
    <div className="flex items-center gap-6">
      <div className="w-40 h-40 shrink-0">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={dadosGrafico}
              dataKey="quantidade"
              nameKey="label"
              innerRadius={45}
              outerRadius={70}
              paddingAngle={2}
              strokeWidth={0}
            >
              {dadosGrafico.map((entry) => (
                <Cell key={entry.prioridade} fill={PRIORIDADE_CONFIG[entry.prioridade].color} />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{ borderRadius: 8, border: "1px solid #E7E9EC", fontSize: 13 }}
              formatter={(value, nome) => [value, nome]}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>

      <ul className="space-y-2.5 flex-1 min-w-0">
        {dadosGrafico.map((item) => (
          <li key={item.prioridade} className="flex items-center gap-2 text-sm">
            <span
              className="w-2.5 h-2.5 rounded-full shrink-0"
              style={{ backgroundColor: PRIORIDADE_CONFIG[item.prioridade].color }}
            />
            <span className="text-neutral-600 flex-1">{item.label}</span>
            <span className="font-medium text-neutral-800">{item.quantidade}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
