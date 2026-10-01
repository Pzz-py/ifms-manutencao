import { BarChart, Bar, XAxis, YAxis, Tooltip, Cell, ResponsiveContainer } from "recharts";
import { STATUS_CONFIG, ORDEM_STATUS } from "../../utils/statusConfig";

/**
 * Gráfico de barras horizontais com a quantidade de chamados por status.
 * Layout horizontal escolhido porque os rótulos ("Aguardando peças",
 * "Em atendimento"...) são longos e ficam ilegíveis em barras verticais.
 */
export default function ChamadosPorStatusChart({ dados }) {
  const dadosGrafico = ORDEM_STATUS.map((status) => ({
    status,
    label: STATUS_CONFIG[status].label,
    quantidade: dados[status] || 0,
  }));

  return (
    <ResponsiveContainer width="100%" height={280}>
      <BarChart
        data={dadosGrafico}
        layout="vertical"
        margin={{ top: 4, right: 16, bottom: 4, left: 4 }}
        barCategoryGap={10}
      >
        <XAxis type="number" allowDecimals={false} tick={{ fontSize: 12, fill: "#868E98" }} axisLine={false} tickLine={false} />
        <YAxis
          type="category"
          dataKey="label"
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
        <Bar dataKey="quantidade" radius={[0, 6, 6, 0]} maxBarSize={22}>
          {dadosGrafico.map((entry) => (
            <Cell key={entry.status} fill={STATUS_CONFIG[entry.status].color} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
