import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getPetHistory } from '../../api/medical';
import type { HistoricalRecordDto } from '../../types/medical';
import PageWrapper from '../../components/PageWrapper';

export default function PetHistoryPage() {
  const { id } = useParams<{ id: string }>();
  const [records, setRecords] = useState<HistoricalRecordDto[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    getPetHistory(Number(id))
      .then(setRecords)
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <p>Cargando historial…</p>;
  if (!records.length) return <p>Sin historial clínico.</p>;

  return (
    <PageWrapper>
      <div className="space-y-8">
        <h1 className="text-2xl font-semibold mb-2">Historial clínico</h1>

        {records.map((rec) => (
          <section
            key={rec.recordId}
            className="bg-emerald-950/50 shadow rounded p-4 space-y-3"
          >
            {/* <header className="flex justify-between items-center">
        <div>
        <h2 className="font-medium">
        Registro #{rec.recordId}{' '}
        {rec.clinic && (
        <span className="text-slate-500 text-sm">
        — {rec.clinic.name}
        </span>
        )}
        </h2>
        </div>
        
        <Link
        to={`/records/${rec.recordId}/appointments/new`}
        className="btn btn-primary"
        >
        Nueva cita
        </Link>
        </header> */}
            {/* cabecera incluye todas las clínicas */}
            <header className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
              <div>
                <h2 className="font-medium">Registro #{rec.recordId}</h2>
                <p className="text-slate-500 text-xs">
                  {rec.clinics.map((c) => c.name).join(' • ')}
                </p>
              </div>

              <Link
                to={`/records/${rec.recordId}/appointments/new`}
                className="btn btn-primary"
              >
                Nueva cita
              </Link>
            </header>

            {/* tabla de citas */}
            <table className="min-w-full text-sm">
              {/* <thead>
          <tr className="bg-slate-100">
          <th className="p-1">Fecha</th>
          <th className="p-1">Peso (kg)</th>
          <th className="p-1">Temp (°C)</th>
          <th className="p-1">Síntomas</th>
          </tr>
          </thead>
          <tbody>
          {rec.appointments.map(ap => (
          <tr key={ap.id} className="border-b">
          <td className="p-1">{new Date(ap.date).toLocaleDateString()}</td>
          <td className="p-1">{ap.weight}</td>
          <td className="p-1">{ap.temperature}</td>
          <td className="p-1">{ap.symptoms.join(', ')}</td>
          </tr>
          ))}
          </tbody> */}

              <thead>
                <tr className="bg-slate-100/10">
                  <th className="p-1">Fecha</th>
                  <th className="p-1">Clínica</th> {/* nueva */}
                  <th className="p-1">Peso</th>
                  <th className="p-1">Temp</th>
                  <th className="p-1">Síntomas</th>
                  <th className="p-1">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {rec.appointments.map((ap) => (
                  <tr key={ap.id} className="border-b">
                    <td className="p-1">
                      {new Date(ap.date).toLocaleDateString()}
                    </td>
                    <td className="p-1">{ap.clinicName ?? '—'}</td>{' '}
                    {/* nueva */}
                    <td className="p-1">{ap.weight}</td>
                    <td className="p-1">{ap.temperature}</td>
                    <td className="p-1">{ap.symptoms.join(', ')}</td>
                    {/* 👉 NUEVA CELDA */}
                    <td className="p-1">
                      <Link
                        to={`/appointments/${ap.id}`}
                        className="btn btn-sm btn-secondary"
                      >
                        Ver cita
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>
        ))}
      </div>
    </PageWrapper>
  );
}
