import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';
import type { MonthlyCount } from '../../../types/stats';

export default function MonthlyIncomeChart({ data }: { data: MonthlyCount[] }) {
  const formatted = data.map((d) => ({
    month: d.month.slice(0, 7), // yyyy-MM
    income: Number(d.count) * 4, // 4 soles c/u
  }));

  return (
    <section className="h-72 p-4 rounded-xl bg-white/10 backdrop-blur-md border border-white/20 shadow-xl">
      <h4 className="mb-3 font-semibold text-white/90 text-base">
        Ingresos por mes (S/)
      </h4>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={formatted}
          margin={{ top: 10, right: 30, left: 0, bottom: 20 }}
        >
          <CartesianGrid stroke="rgba(255, 255, 255, 0.05)" />
          <XAxis
            dataKey="month"
            tick={{ fill: '#fff', fontSize: 12 }}
            axisLine={{ stroke: 'rgba(255,255,255,0.1)' }}
            tickLine={false}
          />
          <YAxis
            allowDecimals={false}
            tick={{ fill: '#fff', fontSize: 12 }} // corregido
            axisLine={{ stroke: 'rgba(255,255,255,0.2)' }}
            tickLine={false}
          />
          <Tooltip
            formatter={(value: number, name: string) => [`${value}`, name]}
            contentStyle={{
              background: 'rgba(0, 0, 0, 0.80)',
              backdropFilter: 'blur(10px)',
              WebkitBackdropFilter: 'blur(10px)',
              borderRadius: '0.5rem',
              border: '1px solid rgba(255, 255, 255, 0.7)',
              color: '#fff',
            }}
            itemStyle={{ color: '#fff' }}
            cursor={{ fill: 'rgba(255, 255, 255, 0.05)' }}
          />
          <Bar
            dataKey="income"
            name="Ingresos (S/)"
            fill="#BAFB00"
            radius={[4, 4, 0, 0]}
            activeBar={{
              fill: '#0ea5e9',
              style: { transition: 'fill 0.3s ease-in-out' },
            }}
          />
        </BarChart>
      </ResponsiveContainer>
    </section>
  );
}
