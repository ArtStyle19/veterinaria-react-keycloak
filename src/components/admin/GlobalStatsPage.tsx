import { useQuery } from '@tanstack/react-query';
import { format } from 'date-fns';
import {
  DailyAppointmentsChart,
  MonthlyIncomeChart,
  SymptomPie,
  TopClinicBar,
} from './charts';
import { getGlobalStats } from '../../api/admin';
import { useDateRange } from '../../hooks/useDateRange';
import PageWrapper from '../PageWrapper';
import { useNavigate } from 'react-router-dom';

/* ------------------------------------------------------------- */
/*  PAGE COMPONENT                                               */
/* ------------------------------------------------------------- */
export default function GlobalStatsPage() {
  const { from, to, setFrom, setTo, isoFrom, isoTo } = useDateRange(30);
  const navigate = useNavigate(); // 👈 Initialize navigate

  const { data, isLoading } = useQuery({
    queryKey: ['globalStats', isoFrom, isoTo],
    queryFn: () => getGlobalStats(isoFrom, isoTo).then((r) => r.data),
    staleTime: 5 * 60 * 1000,
  });

  if (isLoading || !data)
    return <p className="text-white">Cargando métricas…</p>;

  /* --------- Cálculos dinámicos (dep. de rango) --------- */
  const citasRango = data.dailyAppointments.reduce((s, d) => s + d.count, 0);
  const ingresosRango = citasRango * 4; // S/ 4 por cita
  const promedioCitasDia = (
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

        {/* ------------- BLOQUE HISTÓRICO (fijo) ------------- */}
        <SectionTitle>Acumulado histórico</SectionTitle>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatsCard
            title="Ingresos totales"
            value={`S/ ${data.totalIncome}`}
          />
          <StatsCard title="Citas totales" value={data.totalAppointments} />
          <StatsCard title="Perros perdidos" value={data.totalLostDogs} />
          <StatsCard
            title="Ingresos este mes"
            value={`S/ ${data.incomeThisMonth}`}
          />
        </div>

        {/* --------- BLOQUE POR RANGO (reactivo) --------- */}
        <SectionTitle>Métricas del rango seleccionado</SectionTitle>
        <div className="grid md:grid-cols-3 lg:grid-cols-3 gap-6">
          <StatsCard title="Ingresos en rango" value={`S/ ${ingresosRango}`} />
          <StatsCard title="Citas en rango" value={citasRango} />
          <StatsCard title="Prom. citas / día" value={promedioCitasDia} />
        </div>

        {/* ------------- GRÁFICOS ------------- */}
        <DailyAppointmentsChart data={data.dailyAppointments} />
        <MonthlyIncomeChart data={data.monthlyAppointments} />
        <SymptomPie data={data.topSymptoms} />
        <TopClinicBar data={data.topClinics} />
      </div>
    </PageWrapper>
  );
}

/* ------------------------------------------------------------- */
/*  REUSABLE SUB-COMPONENTS                                      */
/* ------------------------------------------------------------- */
function SectionTitle({ children }: { children: React.ReactNode }) {
  return <h3 className="text-lg font-semibold text-black">{children}</h3>;
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
      <div className="p-5">
        <p className="text-sm text-black/70 mb-1">{title}</p>
        <p className="text-3xl font-semibold text-black">{value}</p>
      </div>
    </div>
  );
}

/* DateRangeInline: selector compacto de fechas */
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
      <label className="text-xs text-black/70 mb-1">{label}</label>
      <input
        type="date"
        className="w-full px-3 py-2 bg-white/5 text-black
                   border border-white/20 rounded-md
                   focus:outline-none focus:ring-2 focus:ring-blue-500"
        value={format(date, 'yyyy-MM-dd')}
        onChange={(e) => onChange(new Date(e.target.value))}
      />
    </div>
  );
}
