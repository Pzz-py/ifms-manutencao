import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";

/**
 * Gráfico de barras horizontais com a quantidade de chamados por local
 * (item explícito do escopo). Usa uma cor única (accent), diferente dos
 * gráficos de status/categoria/prioridade, porque locais não têm um
 * significado semântico fixo por cor — são cadastrados livremente.
 */
export default function ChamadosPorLocalChart({ dados }) {
  if (!dados || dados.length === 0) {
    return (
      <div className="h-[160px] flex items-center justify-center text-sm text-neutral-400">
        Nenhum chamado registrado ainda.
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={Math.max(dados.length * 34, 160)}>
      <BarChart
        data={dados}
        layout="vertical"
        margin={{ top: 4, right: 16, bottom: 4, left: 4 }}
        barCategoryGap={8}
      >
        <XAxis type="number" allowDecimals={false} tick={{ fontSize: 12, fill: "#868E98" }} axisLine={false} tickLine={false} />
        <YAxis
          type="category"
          dataKey="local"
          width={110}
          tick={{ fontSize: 12, fill: "#434B56" }}
          axisLine={false}
          tickLine={false}
        />
        <Tooltip
          cursor={{ fill: "#F4F5F6" }}
          contentStyle={{ borderRadius: 8, border: "1px solid #E7E9EC", fontSize: 13 }}
          formatter={(value) => [value, "Chamados"]}
        />
        <Bar dataKey="quantidade" fill="#3A7EAF" radius={[0, 6, 6, 0]} maxBarSize={18} />
      </BarChart>
    </ResponsiveContainer>
  );
}
