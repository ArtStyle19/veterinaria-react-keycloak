import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getAppointmentDetail } from '../../api/medical';
import type { AppointmentDetailDto } from '../../types/medical';
import dayjs from 'dayjs';
import PageWrapper from '../../components/PageWrapper';

export default function AppointmentDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [data, setData] = useState<AppointmentDetailDto | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    getAppointmentDetail(Number(id))
      .then(setData)
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <p>Cargando cita…</p>;
  if (!data) return <p>No encontrada.</p>;

  const dateFmt = dayjs(data.date).format('DD/MM/YYYY HH:mm');

  return (
    <PageWrapper>
      <div className="max-w-xl mx-auto bg-white/10 p-6 rounded-2xl shadow space-y-4">
        <h1 className="text-2xl font-semibold">Cita #{data.id}</h1>

        {data.clinicName && (
          <p className="text-sm text-slate-500">Clínica: {data.clinicName}</p>
        )}

        <table className="w-full text-sm">
          <tbody>
            <Row label="Fecha" value={dateFmt} />
            <Row label="Peso (kg)" value={data.weight} />
            <Row label="Temperatura (°C)" value={data.temperature} />
            <Row label="Ritmo cardíaco" value={data.heartRate ?? '—'} />
            <Row label="Síntomas" value={data.symptoms.join(', ') || '—'} />
            <Row label="Descripción" value={data.description ?? '—'} />
            <Row label="Diagnóstico" value={data.diagnosis ?? '—'} />
            <Row label="Tratamientos" value={data.treatments ?? '—'} />
            <Row label="Notas" value={data.notes ?? '—'} />
          </tbody>
        </table>

        <Link to={-1 as any} className="btn btn-primary">
          Volver
        </Link>
      </div>
    </PageWrapper>
  );
}

function Row({ label, value }: { label: string; value: string | number }) {
  return (
    <tr>
      <td className="font-medium py-1 w-40">{label}</td>
      <td className="py-1">{value}</td>
    </tr>
  );
}
