import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';
import type { DailyCount } from '../../../types/stats';

export default function DailyAppointmentsChart({
  data,
}: {
  data: DailyCount[];
}) {
  return (
    <section className="h-72 p-4 rounded-xl bg-white/10 backdrop-blur-md border border-white/20 shadow-xl">
      <h4 className="mb-3 font-semibold text-black/90 text-base">
        Citas diarias
      </h4>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={data}
          margin={{ top: 10, right: 30, left: 0, bottom: 10 }}
        >
          <CartesianGrid stroke="rgba(0, 0, 0, 0.7)" />
          <XAxis
            dataKey="day"
            tick={{ fill: '#000000', fontSize: 12 }}
            axisLine={{ stroke: 'rgba(0,0,0,0.7)' }}
            tickLine={false}
          />
          <YAxis
            allowDecimals={true}
            tick={{ fill: '#000000', fontSize: 12 }}
            axisLine={{ stroke: 'rgba(0,0,0,0.7)' }}
            tickLine={false}
          />
          <Tooltip
            formatter={(value: number, name: string) => [`${value}`, name]}
            contentStyle={{
              background: 'rgba(0, 0, 0, 0.80)',
              backdropFilter: 'blur(10px)',
              WebkitBackdropFilter: 'blur(10px)',
              borderRadius: '0.5rem',
              border: '1px solid rgba(0, 0, 0, 0.7)',
              color: '#fff',
            }}
            itemStyle={{ color: '#fff' }}
            cursor={{ stroke: 'rgba(255, 0, 0, 0.4)', strokeWidth: 2 }}
          />
          <Line
            type="monotone"
            dataKey="count"
            stroke="#000000"
            strokeWidth={3}
            dot={{ r: 5, fill: '#D16D79' }}
            activeDot={{
              r: 10,
              fill: '#D16D79',
              stroke: '#000000',
              strokeWidth: 3,
            }}
          />
        </LineChart>
      </ResponsiveContainer>
    </section>
  );
}
