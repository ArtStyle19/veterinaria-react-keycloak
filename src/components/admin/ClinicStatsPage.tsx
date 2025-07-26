// components/admin/ClinicStatsPage.tsx
import { useQuery } from '@tanstack/react-query';
import { format } from 'date-fns';
import { useNavigate, useParams } from 'react-router-dom'; // ✅
import { getClinicStats } from '../../api/admin';
import {
  DailyAppointmentsChart,
  MonthlyIncomeChart,
  SymptomPie,
} from './charts';
import { useDateRange } from '../../hooks/useDateRange';
import PageWrapper from '../PageWrapper';

/* ------------------------------------------------------------------ */
/*  PAGE COMPONENT                                                    */
/* ------------------------------------------------------------------ */
export default function ClinicStatsPage() {
  /* id viene como string ⇒ conviértelo a número */
  const { clinicId } = useParams<{ clinicId: string }>();
  const id = Number(clinicId);

  const { from, to, setFrom, setTo, isoFrom, isoTo } = useDateRange(30);
  const navigate = useNavigate(); // 👈 Initialize navigate

  const { data, isLoading } = useQuery({
    queryKey: ['clinicStats', id, isoFrom, isoTo], // ✅ usa id
    queryFn: () => getClinicStats(id, isoFrom, isoTo).then((r) => r.data), // ✅ usa id
    staleTime: 5 * 60 * 1000,
    enabled: !isNaN(id), // evita llamada si id es NaN
  });

  if (isLoading || !data) return <p>Cargando métricas…</p>;

  /* ---------- cálculos reactivos ----------- */
  const citasRango = data.dailyAppointments.reduce((s, d) => s + d.count, 0);
  const ingresosRango = citasRango * 4; // S/ 4 por cita
  const promedioDia = (
    citasRango / (data.dailyAppointments.length || 1)
  ).toFixed(1);

  return (
    <PageWrapper>
      <button
        onClick={() => navigate(-1)} // 👈 Go back one step in history
        className="btn btn-primary mb-4"
      >
        ← Volver
      </button>
      <div className="space-y-10">
        <DateRangeInline from={from} to={to} setFrom={setFrom} setTo={setTo} />

        {/* ------------- BLOQUE HISTÓRICO ------------- */}
        <SectionTitle>Acumulado histórico</SectionTitle>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatsCard
            title="Ingresos totales"
            value={`S/ ${data.totalIncome}`}
          />
          <StatsCard title="Citas totales" value={data.totalAppointments} />
          <StatsCard title="Perros perdidos" value={data.lostDogs} />
          <StatsCard
            title="Ingresos este mes"
            value={`S/ ${data.incomeThisMonth}`}
          />
        </div>

        {/* ----------- BLOQUE POR RANGO ----------- */}
        <SectionTitle>Métricas del rango seleccionado</SectionTitle>
        <div className="grid md:grid-cols-3 lg:grid-cols-3 gap-6">
          {/* ✅ clase fija */}
          <StatsCard title="Ingresos en rango" value={`S/ ${ingresosRango}`} />
          <StatsCard title="Citas en rango" value={citasRango} />
          <StatsCard title="Prom. citas / día" value={promedioDia} />
        </div>

        {/* ------------- GRÁFICOS ------------- */}
        <DailyAppointmentsChart data={data.dailyAppointments} />
        <MonthlyIncomeChart data={data.monthlyAppointments} />
        <SymptomPie data={data.topSymptoms} />
      </div>
    </PageWrapper>
  );
}

/* ------------------------------------------------------------------ */
/*  REUSABLE SUB-COMPONENTS                                           */
/* ------------------------------------------------------------------ */
function SectionTitle({ children }: { children: React.ReactNode }) {
  return <h3 className="text-lg font-semibold text-white">{children}</h3>;
}

function StatsCard({
  title,
  value,
}: {
  title: string;
  value: number | string;
}) {
  return (
    <div className="rounded-xl border border-white/20 bg-white/10 backdrop-blur-md shadow-lg hover:shadow-xl transition-shadow duration-300">
      <div className="p-4">
        <p className="text-sm text-white mb-1">{title}</p>
        <p className="text-3xl font-semibold text-white">{value}</p>
      </div>
    </div>
  );
}

function DateRangeInline({
  from,
  to,
  setFrom,
  setTo,
}: {
  from: Date;
  to: Date;
  setFrom: (d: Date) => void;
  setTo: (d: Date) => void;
}) {
  return (
    <div
      className="flex flex-col md:flex-row gap-4
                 bg-white/10 border border-white/20
                 backdrop-blur-md rounded-xl p-4 shadow-lg"
    >
      <DateInput label="Desde" date={from} onChange={setFrom} />
      <DateInput label="Hasta" date={to} onChange={setTo} />
    </div>
  );
}

function DateInput({
  label,
  date,
  onChange,
}: {
  label: string;
  date: Date;
  onChange: (d: Date) => void;
}) {
  return (
    <div className="flex flex-col w-full">
      <label className="text-xs text-gray-300 mb-1">{label}</label>
      <input
        type="date"
        className="w-full px-3 py-2 border border-gray-300 rounded-md
                   focus:outline-none focus:ring-2 focus:ring-blue-500"
        value={format(date, 'yyyy-MM-dd')}
        onChange={(e) => onChange(new Date(e.target.value))}
      />
    </div>
  );
}
