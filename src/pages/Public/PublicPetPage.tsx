import { useEffect, useRef, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import api from '../../api/axios';
import type { PublicPetDto } from '../../types/pet';
import dayjs from 'dayjs';
import { useAuth } from '../../auth/AuthContext';
import { importPet } from '../../api/pets';
import toast from 'react-hot-toast';
import PetQRCode from '../../components/PetQRCode';
import html2canvas from 'html2canvas'; // Asegúrate de tener esto instalado: `npm install html2canvas`
import PageWrapper from '../../components/PageWrapper';
// impor
import domtoimage from 'dom-to-image';

export default function PublicPetPage() {
  const navigate = useNavigate();
  const { token } = useParams<{ token: string }>();
  const [pet, setPet] = useState<PublicPetDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { user } = useAuth();
  const [editCode, setEditCode] = useState('');
  const [importing, setImporting] = useState(false);
  const role = user?.roleName;

  const qrRef = useRef<HTMLDivElement | null>(null);

  const handleDownloadQR = async () => {
    if (!qrRef.current) return;

    try {
      const dataUrl = await domtoimage.toPng(qrRef.current);
      const link = document.createElement('a');
      link.download = `${pet?.name || 'qr-mascota'}.png`;
      link.href = dataUrl;
      link.click();
    } catch (error) {
      toast.error('No se pudo descargar el QR');
      console.error(error);
    }
  };

  async function handleImport() {
    if (!editCode.trim()) {
      toast.error('Debes ingresar el código de edición');
      return;
    }
    try {
      setImporting(true);
      await importPet({ qrCodeToken: token, editCode });
      toast.success(
        role === 'VET'
          ? 'Paciente importado con éxito'
          : 'Mascota importada con éxito',
      );
      navigate('/pets');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Error al importar');
    } finally {
      setImporting(false);
    }
  }

  useEffect(() => {
    if (!token) return;
    api
      .get<PublicPetDto>(`/api/public/pets/qr/${token}`)
      .then((res) => setPet(res.data))
      .catch(() => setError('No encontrado o token inválido'))
      .finally(() => setLoading(false));
  }, [token]);

  if (loading) return <p className="p-6 text-white">Cargando…</p>;
  if (error) return <p className="p-6 text-red-500">{error}</p>;
  if (!pet) return null;

  return (
    <PageWrapper>
      <button
        onClick={() => navigate('/')} // 👈 Go back one step in history
        className="btn btn-primary mb-4"
      >
        ← Volver
      </button>
      {/* <Link to="/" className="btn btn-primary mb-4">
        Volver al inicio
      </Link> */}
      <section className="md:w-2/3 mx-auto px-4 py-8 text-white">
        <div className="max-w-2xl mx-auto bg-white/5 p-6 rounded-2xl shadow-lg backdrop-blur-md border border-white/10 text-sm">
          <div className="overflow-hidden rounded-xl border border-white/0 backdrop-blur-sm bg-white/0">
            <table className="w-full text-sm text-white">
              <tbody>
                <tr className="border-b border-white/10">
                  <td colSpan={2} className="px-6 py-6 text-center">
                    <h1 className="text-3xl font-bold text-emerald-200 drop-shadow">
                      {pet.name}
                    </h1>
                    <p className="text-sm text-white/80 mt-1">
                      {pet.species} — {pet.breed ?? '—'}
                    </p>
                    {pet.clinic && (
                      <p className="text-xs text-white/60 mt-1">
                        Clínica: {pet.clinic.name}
                      </p>
                    )}
                  </td>
                </tr>

                <Row label="Sexo" value={pet.sex} />
                <Row
                  label="Nacimiento"
                  value={
                    pet.birthdate
                      ? dayjs(pet.birthdate).format('DD/MM/YYYY')
                      : '—'
                  }
                />
                <Row label="Estado" value={pet.status} />

                {pet.status === 'LOST' && (
                  <tr>
                    <td colSpan={2} className="px-6 py-6">
                      <div className="rounded-xl border border-yellow-400/20 bg-yellow-300/10 p-6 text-yellow-100 shadow-inner backdrop-blur-md">
                        <div className="flex flex-col items-center gap-6 text-center">
                          {/* Encabezado con ícono */}
                          <div className="flex flex-col items-center gap-3">
                            <div className="p-3 rounded-full bg-yellow-400/20 border border-yellow-400/30">
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                                className="w-10 h-10 text-yellow-300"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth="2"
                                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.054 0 1.635-1.14 1.05-2.004L13.05 4.004c-.588-.864-1.863-.864-2.45 0L3.032 17.996c-.585.864-.004 2.004 1.05 2.004z"
                                />
                              </svg>
                            </div>
                            <h2 className="text-xl font-bold tracking-wide text-yellow-100">
                              Mascota reportada como perdida
                            </h2>
                            <p className="text-sm text-white/60 max-w-md">
                              Si reconoces a esta mascota, por favor contacta al
                              propietario.
                            </p>
                          </div>

                          {/* Datos de contacto */}
                          <div className="text-sm text-white/90 space-y-3 text-left max-w-md w-full">
                            <div className="m-auto"></div>
                            <p>
                              <span className="font-semibold">Dueño:</span>{' '}
                              {pet.ownerName || '—'}
                            </p>

                            {pet.ownerContact && (
                              <p className="flex items-center gap-3">
                                <span className="font-semibold">Teléfono:</span>
                                <span>{pet.ownerContact}</span>
                                <a
                                  href={`https://wa.me/${pet.ownerContact.replace(/\D/g, '')}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-green-600/20 hover:bg-green-600/40 text-green-300 text-xs font-medium shadow-sm transition-all"
                                >
                                  <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    fill="currentColor"
                                    viewBox="0 0 448 512"
                                    className="w-4 h-4"
                                  >
                                    <path d="M380.9 97.1C339-4.3 234.1-30.2 150.1 14.4S-10.1 186.2 33.5 270.2l-31.5 98.4a20 20 0 0025.1 25.1l98.4-31.5c84 43.6 183.6 16.6 227.2-67.4s-1.6-185.1-71.8-197.7zM224 388c-38.8 0-77.7-11.3-110.9-33l-7.9-5.1-58.2 18.6 18.6-58.2-5.1-7.9C71.3 261.7 60 222.8 60 184c0-90.6 73.4-164 164-164s164 73.4 164 164-73.4 164-164 164z" />
                                  </svg>
                                  WhatsApp
                                </a>
                              </p>
                            )}

                            {pet.ownerEmail && (
                              <p className="flex items-center gap-2">
                                <span className="font-semibold">Email:</span>
                                <a
                                  href={`mailto:${pet.ownerEmail}`}
                                  className="flex items-center gap-1 underline hover:text-yellow-300 transition"
                                >
                                  <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    fill="currentColor"
                                    viewBox="0 0 24 24"
                                    className="w-4 h-4 text-yellow-200"
                                  >
                                    <path d="M2.01 5.27L2 19a2 2 0 002 2h16a2 2 0 002-2V5.27l-10 6.15-10-6.15zM22 4H2a2 2 0 00-2 2v.01l12 7.36 12-7.36V6a2 2 0 00-2-2z" />
                                  </svg>
                                  {pet.ownerEmail}
                                </a>
                              </p>
                            )}
                          </div>

                          {/* Botón ubicación */}
                          <div className="pt-2 w-full max-w-md">
                            <button
                              onClick={() => {
                                toast.success(
                                  'Ubicación enviada al propietario',
                                );
                              }}
                              className="inline-flex justify-center w-full items-center gap-2 px-5 py-2 rounded-xl bg-yellow-400/30 hover:bg-yellow-400/50 text-yellow-100 font-medium text-sm shadow-md transition-all"
                            >
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                fill="none"
                                stroke="currentColor"
                                viewBox="0 0 24 24"
                                className="w-4 h-4"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={20}
                                  d="M12 11c.828 0 1.5-.672 1.5-1.5S12.828 8 12 8s-1.5.672-1.5 1.5S11.172 11 12 11zM12 14.5c-2.485 0-4.5-2.015-4.5-4.5S9.515 5.5 12 5.5s4.5 2.015 4.5 4.5-2.015 4.5-4.5 4.5z"
                                />
                              </svg>
                              Compartir mi ubicación
                            </button>
                          </div>
                        </div>
                      </div>
                    </td>
                  </tr>
                )}

                {pet.canBeImported && (
                  <tr className="border-y border-green-500/20 bg-green-500/5">
                    <td
                      colSpan={2}
                      className="px-6 py-4 text-green-300 text-sm text-center"
                    >
                      Esta mascota aún no tiene dueño registrado en el sistema.
                    </td>
                  </tr>
                )}
                <tr className="border-t border-white/10">
                  <td colSpan={2} className="px-6 py-6 text-center">
                    <h2 className="text-lg font-medium text-white mb-2">
                      Código QR para compartir
                    </h2>
                    <div>
                      <div
                        ref={qrRef}
                        className="inline-block p-5 rounded-xl"
                        style={{
                          backgroundColor: '#ffffff', // ← importante: evitar oklch
                        }}
                      >
                        <PetQRCode token={token} />
                      </div>
                    </div>

                    <div className="mt-4 flex flex-col sm:flex-row justify-center items-center gap-3">
                      <button
                        onClick={handleDownloadQR}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-white text-sm font-medium transition-all"
                      >
                        ⬇️ Descargar QR
                      </button>

                      <button
                        onClick={() => {
                          if (!qrRef.current) return;
                          const printWindow = window.open('', '_blank');
                          if (!printWindow) return;
                          const qrHtml = qrRef.current.innerHTML;
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
      <div class="pet-name">${pet?.name ?? ''}</div>
    </body>
  </html>
`);

                          printWindow.document.close();
                          printWindow.focus();
                          printWindow.print();
                          printWindow.close();
                        }}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 text-white text-sm font-medium transition-all"
                      >
                        🖨️ Imprimir QR
                      </button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </PageWrapper>
  );
}

function Row({ label, value }: { label: string; value?: string }) {
  return (
    <tr className="border-b border-white/10">
      <td className="px-6 py-3 font-semibold w-1/3">{label}</td>
      <td className="px-6 py-3">{value || '—'}</td>
    </tr>
  );
}
