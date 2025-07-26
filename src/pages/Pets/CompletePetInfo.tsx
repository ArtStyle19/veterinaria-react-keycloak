import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import api from '../../api/axios';
import dayjs from 'dayjs';
import CreateAppointmentModal from '../../components/CreateAppoinmentModal';
import AppointmentDetailModal from '../../components/AppointmentDetailModal';

import { getPetHistory } from '../../api/medical';
import type { PublicPetDto } from '../../types/pet';
import type { HistoricalRecordDto } from '../../types/medical';
import PetQRCode from '../../components/PetQRCode';
import { useAuth } from '../../auth/AuthContext';
import PageWrapper from '../../components/PageWrapper';

import ManageAccessModal from '../../components/ClinicAccessModal';
export default function CompletePetInfo() {
  const [openModal, setOpenModal] = useState(false);
  const [selectedAppointmentId, setSelectedAppointmentId] = useState<
    number | null
  >(null);
  const [accessModalOpen, setAccessModalOpen] = useState(false);
  const [accessRecordId, setAccessRecordId] = useState<number | null>(null);
  const [selectedRecordId, setSelectedRecordId] = useState<number | null>(null);

  const navigate = useNavigate(); // 👈 Initialize navigate

  const { user } = useAuth();

  //   const { pet_id } = useParams();
  const { id } = useParams<{ id: string }>();

  const [pet, setPet] = useState<PublicPetDto | null>(null);
  // const [record, setRecord] = useState<HistoricalRecordDto | null>(null);
  const [record, setRecord] = useState<HistoricalRecordDto[]>([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  //   if (loading) return <p>Cargando historial…</p>;
  // if (!records.length) return <p>Sin historial clínico.</p>;

  useEffect(() => {
    if (!id) return;

    const pid = parseInt(id);

    Promise.all([api.get<PublicPetDto>(`/api/pets/${pid}`), getPetHistory(pid)])
      .then(([resPet, records]) => {
        setPet(resPet.data);
        setRecord(records); // Asumes un único historial por mascota
      })
      .catch(() => setError('No se pudo cargar la información'))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <p className="p-6">Cargando…</p>;
  if (error) return <p className="p-6 text-red-600">{error}</p>;
  if (!pet || !record) return null;

  return (
    <PageWrapper>
      <button
        onClick={() => navigate(-1)} // 👈 Go back one step in history
        className="btn btn-primary mb-4"
      >
        ← Volver
      </button>

      {/* // <div className="flex flex-col md:flex-row gap-6"> */}
      <div className="flex flex-col md:flex-row gap-6 h-full">
        {/* INFO MASCOTA */}
        <section className="md:w-1/3 bg-white/0 shadow space-y-3">
          <div className="max-w-xl mx-auto bg-blue-700/5 p-6 rounded-2xl shadow-lg backdrop-blur-md border border-white/10  ">
            {/* <div className="max-w-xl mx-auto rounded-2xl p-6 shadow-lg backdrop-blur-md bg-white/10 border border-white/20 text-white"></div> */}

            <div className="overflow-hidden rounded-xl border border-white/0 backdrop-blur-sm bg-white/0">
              <table className="w-full text-xs text-white/100">
                <tbody>
                  <tr className="border-b border-white/10">
                    <td colSpan={2} className="px-5 py-6 text-center ">
                      <h1 className="text-3xl font-bold mb-6 text-center text-emerald-200/90 drop-shadow-lg">
                        {pet.name}
                      </h1>
                    </td>
                  </tr>

                  <tr className="border-b border-white/10">
                    <td className="px-4 py-3 font-semibold w-1/3">Especie</td>
                    <td className="px-4 py-3">{pet.species}</td>
                  </tr>
                  <tr className="border-b border-white/10">
                    <td className="px-4 py-3 font-semibold">Raza</td>
                    <td className="px-4 py-3">{pet.breed ?? '—'}</td>
                  </tr>
                  <tr className="border-b border-white/10">
                    <td className="px-4 py-3 font-semibold">Sexo</td>
                    <td className="px-4 py-3">{pet.sex}</td>
                  </tr>
                  <tr className="border-b border-white/10">
                    <td className="px-4 py-3 font-semibold">Nacimiento</td>
                    <td className="px-4 py-3">
                      {pet.birthdate
                        ? dayjs(pet.birthdate).format('DD/MM/YYYY')
                        : '—'}
                    </td>
                  </tr>
                  <tr className="border-b border-white/10">
                    <td className="px-4 py-3 font-semibold">Estado</td>
                    <td className="px-4 py-3">{pet.visibility}</td>
                  </tr>
                  <tr className="border-b border-white/10">
                    <td className="px-4 py-3 font-semibold">Propietario</td>
                    <td className="px-4 py-3">
                      {pet.ownerName ?? 'Sin asignar'}
                    </td>
                  </tr>
                  <tr>
                    <td className="px-4 py-3 font-semibold">Contacto</td>
                    <td className="px-4 py-3">{pet.ownerContact ?? '—'}</td>
                  </tr>

                  <tr className="border-b border-white/10">
                    <td colSpan={2} className="px-5 py-6 text-center ">
                      <div className="mt-6">
                        <h2 className="text-lg font-medium text-white mb-2">
                          Código QR para compartir
                        </h2>
                        <PetQRCode token={pet.qrCodeToken} data-qr-printable />
                      </div>
                    </td>
                  </tr>

                  <tr className="border-b border-white/10">
                    <td colSpan={2} className="px-5 py-6 text-center space-y-3">
                      <button
                        onClick={async () => {
                          const qrElement = document.querySelector(
                            '[data-qr-printable]',
                          );
                          if (!qrElement) return;
                          const domtoimage = await import('dom-to-image');
                          const dataUrl = await domtoimage.toPng(
                            qrElement as Node,
                          );
                          const link = document.createElement('a');
                          link.download = `${pet.name || 'qr-mascota'}.png`;
                          link.href = dataUrl;
                          link.click();
                        }}
                        className="inline-block px-5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-semibold transition-all shadow-md"
                      >
                        ⬇️ Descargar QR
                      </button>

                      <button
                        onClick={() => {
                          const qrElement = document.querySelector(
                            '[data-qr-printable]',
                          );
                          if (!qrElement) return;
                          const printWindow = window.open('', '_blank');
                          if (!printWindow) return;
                          const qrHtml = qrElement.outerHTML;

                          printWindow.document.write(`
  <html>
    <head>
      <title>Imprimir QR</title>
      <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@600&display=swap" rel="stylesheet">
      <style>
        body {
          display: flex;
          justify-content: center;
          align-items: center;
          flex-direction: column;
          height: 100vh;
          margin: 0;
          font-family: 'Poppins', sans-serif;
          background: white;
        }
        .pet-name {
          margin-top: 20px;
          font-size: 2rem;
          font-weight: 600;
          color: #333;
          text-align: center;
        }
      </style>
    </head>
    <body>
      <div>${qrHtml}</div>
      <div class="pet-name">${pet.name}</div>
    </body>
  </html>
        `);
                          printWindow.document.close();
                          printWindow.focus();
                          printWindow.print();
                          printWindow.close();
                        }}
                        className="inline-block px-5 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-semibold transition-all shadow-md"
                      >
                        🖨️ Imprimir QR
                      </button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* {(user?.roleName === 'VET' || user?.roleName === 'PET_OWNER') && ( */}

            {/* )} */}

            {/* {user?.roleName === 'VET' && ( */}

            {/* )} */}
          </div>
        </section>

        {/* HISTORIAL */}
        {/* <section className="md:w-1/2 bg-white/10 rounded shadow p-4 space-y-4">
      <h2 className="text-xl font-semibold">Historial clínico</h2>
      
      {record.appointments.length === 0 ? (
      <p className="text-slate-500 text-sm">Sin citas registradas.</p>
      ) : (
      <ul className="divide-y text-sm">
      {record.appointments.map(apt => (
      <li key={apt.id} className="py-3 space-y-1">
      <p className="font-medium text-slate-700">
      {dayjs(apt.date).format('DD/MM/YYYY')} — {apt.diagnosis || 'Sin diagnóstico'}
      </p>
      <p><strong>Síntomas:</strong> {apt.symptoms.join(', ') || '—'}</p>
      <p><strong>Tratamientos:</strong> {apt.treatments || '—'}</p>
      <p><strong>Notas:</strong> {apt.notes || '—'}</p>
      <p className="text-xs text-slate-500">
      Peso: {apt.weight}kg — Temp: {apt.temperature}°C — FC: {apt.heartRate} bpm
      </p>
      {apt.clinicName && (
      <p className="text-xs text-slate-500">Clínica: {apt.clinicName}</p>
      )}
      </li>
      ))}
      </ul>
      )}
      </section> */}

        {/* <section className="md:w-1/3 bg-white/0 shadow space-y-3"> */}
        <section className="md:w-2/3 bg-violet-700/5 p-6 rounded-2xl shadow-lg backdrop-blur-md border border-white/10  ">
          {/* <section className="md:w-1/2 bg-white/10 rounded shadow p-4 space-y-4"> */}

          <div className="space-y-8">
            <h1 className="text-2xl font-semibold mb-2">Historial clínico</h1>

            {record.map((rec) => (
              <section
                key={rec.recordId}
                className="bg-white/5 shadow rounded p-4 space-y-3"
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
                  {/* NUEVO BOTÓN 👇 */}
                  {user?.roleName === 'PET_OWNER' && (
                    <button
                      className="btn btn-secondary"
                      onClick={() => {
                        setAccessRecordId(rec.recordId);
                        setAccessModalOpen(true);
                      }}
                    >
                      Gestionar accesos
                    </button>
                  )}
                  {user?.roleName === 'VET' && (
                    <>
                      <button
                        className="btn btn-primary"
                        onClick={() => {
                          setSelectedRecordId(rec.recordId);
                          setOpenModal(true);
                        }}
                      >
                        Nueva cita
                      </button>

                      {/* <Link
                        to={`/records/${rec.recordId}/appointments/new`}
                        className="btn btn-primary"
                      >
                        Nueva cita
                      </Link> */}
                    </>
                  )}
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
                    <tr className="bg-white/10 border-b border-white text-xs uppercase tracking-wide text-white/80">
                      <th className="p-2 text-center">Fecha</th>
                      <th className="p-2 text-center">Clínica</th>
                      <th className="p-2 text-center">Peso</th>
                      <th className="p-2 text-center">Temp</th>
                      <th className="p-2 text-center">Síntomas</th>
                      <th className="p-2 text-center">Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {rec.appointments.map((ap, i) => (
                      <tr
                        key={ap.id}
                        className="group border-b border-white/50 hover:bg-white/10 transition duration-300 ease-out animate-fade-in"
                        style={{
                          animationDelay: `${i * 40}ms`,
                          animationFillMode: 'both',
                        }}
                      >
                        <td className="p-2 ">
                          {new Date(ap.date).toLocaleDateString()}
                        </td>
                        <td className="p-2 ">{ap.clinicName ?? '—'}</td>
                        <td className="p-2 ">{ap.weight}</td>
                        <td className="p-2 ">{ap.temperature}</td>
                        <td className="p-2 ">{ap.symptoms.join(', ')}</td>
                        <td className="p-2 ">
                          <button
                            className="btn btn-sm btn-secondary hover:scale-[1.05] transition-transform"
                            onClick={() => setSelectedAppointmentId(ap.id)}
                          >
                            Ver
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </section>
            ))}
          </div>
        </section>
      </div>
      {selectedRecordId && (
        <CreateAppointmentModal
          isOpen={openModal}
          onClose={() => setOpenModal(false)}
          recordId={selectedRecordId}
          onSuccess={() => window.location.reload()} // refrescar historial tras crear
        />
      )}

      {selectedAppointmentId && (
        <AppointmentDetailModal
          appointmentId={selectedAppointmentId}
          isOpen={true}
          onClose={() => setSelectedAppointmentId(null)}
        />
      )}
      {/* --- MODAL DE ACCESOS --- */}
      {accessRecordId !== null && (
        <ManageAccessModal
          recordId={accessRecordId}
          isOpen={accessModalOpen}
          onClose={() => setAccessModalOpen(false)}
          onSaved={() => window.location.reload()} // o sólo refresca la parte necesaria
        />
      )}
    </PageWrapper>
  );
}

// function Row({ label, value }: { label: string; value?: string }) {
//   return (
//     <tr>
//     <td className="font-medium py-1 pr-2">{label}</td>
//     <td className="py-1">{value || '—'}</td>
//     </tr>
//   );
// }
