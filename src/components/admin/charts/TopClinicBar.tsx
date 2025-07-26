import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';
import type { TopClinicDto } from '../../../types/stats';

export default function TopClinicBar({ data }: { data: TopClinicDto[] }) {
  const formatted = data.map((c) => ({
    name: c.clinicName,
    income: Number(c.totalIncome),
  }));
  return (
    <section className="h-72 p-4 rounded-xl bg-white/10 backdrop-blur-md border border-white/20 shadow-xl">
      <h4 className="mb-3 font-semibold text-white/90 text-base">
        Top 5 clínicas por ingresos (S/)
      </h4>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={formatted} layout="vertical" barSize={15}>
          <CartesianGrid stroke="rgba(255, 255, 255, 0.3)" />
          <XAxis
            type="number"
            tick={{ fill: '#fff', fontSize: 12 }}
            axisLine={{ stroke: 'rgba(255,255,255,0.1)' }}
            tickLine={false}
          />
          <YAxis
            type="category"
            dataKey="name"
            width={120}
            tick={{ fill: '#fff', fontSize: 12 }}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip
            cursor={{ fill: 'rgba(255, 255, 255, 0.05)' }}
            formatter={(value: number) => `S/ ${value.toFixed(2)}`}
            contentStyle={{
              background: 'rgba(0, 0, 0, 0.80)',
              backdropFilter: 'blur(10px)',
              WebkitBackdropFilter: 'blur(10px)',
              borderRadius: '0.5rem',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              color: '#fff',
            }}
            itemStyle={{ color: '#fff' }}
          />
          <Bar
            dataKey="income"
            name="Ingresos (S/)"
            fill="#ff0070"
            radius={[4, 4, 4, 4]}
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
