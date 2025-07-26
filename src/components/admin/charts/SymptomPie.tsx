import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from 'recharts';
import type { SymptomCount } from '../../../types/stats';

export default function SymptomPie({ data }: { data: SymptomCount[] }) {
  const COLORS = ['#91f6ff', '#dab6ff', '#ffe899', '#ffb3b3', '#cbffc2'];

  return (
    <section className="h-72 p-4 rounded-xl bg-white/10 backdrop-blur-md border border-white/20 shadow-xl">
      <h4 className="mb-3 font-semibold text-white/90 text-base">
        Enfermedades más comunes
      </h4>
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            dataKey="occurrences"
            nameKey="symptom"
            innerRadius={80}
            outerRadius={100}
            paddingAngle={0}
          >
            {data.map((_, idx) => (
              <Cell
                key={idx}
                fill="rgba(255, 255, 255, 0.05)" // casi transparente
                stroke={COLORS[idx % COLORS.length]}
                strokeWidth={4}
              />
            ))}
          </Pie>
          <Tooltip
            formatter={(value: number, name: string) => [`${value}`, name]}
            contentStyle={{
              background: 'rgba(0, 0, 0, 0.80)',
              backdropFilter: 'blur(10px)',
              WebkitBackdropFilter: 'blur(10px)',
              borderRadius: '0.5rem',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              color: '#fff',
            }}
            itemStyle={{ color: '#fff' }}
            cursor={{ fill: 'rgba(255, 255, 255, 0.05)' }}
          />
        </PieChart>
      </ResponsiveContainer>
    </section>
  );
}
