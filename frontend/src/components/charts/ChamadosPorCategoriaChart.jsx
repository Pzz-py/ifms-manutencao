import { BarChart, Bar, XAxis, YAxis, Tooltip, Cell, ResponsiveContainer } from "recharts";
import { useCategoriasChamado } from "../../hooks/useCategoriasChamado";

export default function ChamadosPorCategoriaChart({ dados }) {
  const { info } = useCategoriasChamado();

  // Usa as chaves devolvidas pela API: inclui categorias criadas pela
  // administração e também as desativadas que ainda têm chamados.
  const dadosGrafico = Object.keys(dados)
    .map((categoria) => ({
      categoria,
      label: info(categoria).label,
      quantidade: dados[categoria] || 0,
    }))
    .sort((a, b) => b.quantidade - a.quantidade);

  return (
    <ResponsiveContainer width="100%" height={320}>
      <BarChart
        data={dadosGrafico}
        layout="vertical"
        margin={{ top: 4, right: 16, bottom: 4, left: 4 }}
        barCategoryGap={8}
      >
        <XAxis type="number" allowDecimals={false} tick={{ fontSize: 12, fill: "#868E98" }} axisLine={false} tickLine={false} />
        <YAxis
          type="category"
          dataKey="label"
          width={100}
          tick={{ fontSize: 12, fill: "#434B56" }}
          axisLine={false}
          tickLine={false}
        />
        <Tooltip
          cursor={{ fill: "#F4F5F6" }}
          contentStyle={{ borderRadius: 8, border: "1px solid #E7E9EC", fontSize: 13 }}
          formatter={(value) => [value, "Chamados"]}
        />
        <Bar dataKey="quantidade" radius={[0, 6, 6, 0]} maxBarSize={18}>
          {dadosGrafico.map((entry) => (
            <Cell key={entry.categoria} fill={info(entry.categoria).color} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
