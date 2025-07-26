// src/components/PetDetailModal.tsx

import { Dialog, Transition } from '@headlessui/react';
import { Fragment, useEffect, useState } from 'react';
import api from '../api/axios';
import type { PublicPetDto } from '../types/pet';
import PetQRCode from './PetQRCode';
import dayjs from 'dayjs';
import { useAuth } from '../auth/AuthContext';
import { useNavigate } from 'react-router-dom';
import { getEditCode } from '../api/pets';

type Props = {
  petId: number;
  isOpen: boolean;
  onClose: () => void;
};

// interface Props {
//   petId: number;
// }

export function EditCodeDisplay({ petId }: Props) {
  const [editCode, setEditCode] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchEditCode() {
      try {
        const response = await getEditCode(petId);
        setEditCode(response.editCode);
      } catch (error) {
        console.error('Error al obtener el editCode', error);
      } finally {
        setLoading(false);
      }
    }

    fetchEditCode();
  }, [petId]);

  if (loading) return <p>Cargando código...</p>;
  if (!editCode) return <p>No se pudo cargar el código.</p>;

  return (
    <div>
      <p>
        <strong>Código de edición:</strong> {editCode}
      </p>

      {/* Mostrar como QR */}
      <img
        src={`https://chart.googleapis.com/chart?chs=200x200&cht=qr&chl=${encodeURIComponent(editCode)}`}
        alt="QR del código de edición"
      />
    </div>
  );
}

export default function PetDetailModal({ petId, isOpen, onClose }: Props) {
  const [pet, setPet] = useState<PublicPetDto | null>(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const navigate = useNavigate();

  // STEP EDITING

  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({});

  function startEditFull() {
    setFormData({
      name: pet?.name ?? '',
      species: pet?.species ?? '',
      breed: pet?.breed ?? '',
      sex: pet?.sex ?? '',
      birthdate: pet?.birthdate ?? '',
      ownerName: pet?.ownerName ?? '',
      ownerContact: pet?.ownerContact ?? '',
      status: pet?.status ?? 'OK', // 👈 importante
    });
    setIsEditing(true);
  }

  function startEditContact() {
    setFormData({
      ownerName: pet?.ownerName ?? '',
      ownerContact: pet?.ownerContact ?? '',
    });
    setIsEditing(true);
  }

  useEffect(() => {
    if (isOpen) {
      setLoading(true);
      api
        .get<PublicPetDto>(`/api/pets/${petId}`)
        .then((res) => setPet(res.data))
        .finally(() => setLoading(false));
    }
  }, [petId, isOpen]);

  return (
    <Dialog as="div" className="relative z-50" open={isOpen} onClose={onClose}>
      <Transition appear show={isOpen} as={Fragment}>
        <div className="fixed inset-0">
          {/* Fondo */}
          <Transition.Child
            as={Fragment}
            enter="transition-opacity duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="transition-opacity duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
          </Transition.Child>

          {/* Panel */}
          <div className="flex items-center justify-center min-h-full p-4">
            <Transition.Child
              as={Fragment}
              enter="transition-transform duration-300 ease-out"
              enterFrom="opacity-0 scale-95 translate-y-4"
              enterTo="opacity-100 scale-100 translate-y-0"
              leave="transition-transform duration-200 ease-in"
              leaveFrom="opacity-100 scale-100 translate-y-0"
              leaveTo="opacity-0 scale-95 translate-y-4"
            >
              <Dialog.Panel className="bg-white/10 backdrop-blur-md border border-white/20 text-white rounded-xl shadow-xl w-full max-w-xl max-h-[90vh] overflow-hidden">
                <div className="p-6 overflow-y-auto max-h-[90vh] space-y-4">
                  {loading ? (
                    <p>Cargando…</p>
                  ) : !pet ? (
                    <p>No encontrado.</p>
                  ) : isEditing ? (
                    <form
                      className="space-y-4"
                      onSubmit={async (e) => {
                        e.preventDefault();
                        try {
                          await api.put(`/api/pets/${pet.id}`, formData);
                          const res = await api.get(`/api/pets/${pet.id}`);
                          setPet(res.data); // actualizar vista
                          setIsEditing(false);
                          // onClose(); // si querés cerrar el modal directamente
                        } catch (err) {
                          console.error(err);
                          alert('Error al guardar');
                        }
                      }}
                    >
                      {pet.accessLevelEnum !== 'WRITE' && (
                        <>
                          <TextField
                            label="Nombre"
                            value={formData.name || ''}
                            onChange={(e) =>
                              setFormData({ ...formData, name: e.target.value })
                            }
                          />
                          <TextField
                            label="Especie"
                            value={formData.species || ''}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                species: e.target.value,
                              })
                            }
                          />
                          <TextField
                            label="Raza"
                            value={formData.breed || ''}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                breed: e.target.value,
                              })
                            }
                          />
                          <TextField
                            label="Sexo"
                            value={formData.sex || ''}
                            onChange={(e) =>
                              setFormData({ ...formData, sex: e.target.value })
                            }
                          />
                          <TextField
                            label="Nacimiento"
                            type="date"
                            value={
                              formData.birthdate
                                ? dayjs(formData.birthdate).format('YYYY-MM-DD')
                                : ''
                            }
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                birthdate: e.target.value,
                              })
                            }
                          />

                          <TextFieldSelect
                            label="Estado"
                            value={formData.status || 'OK'}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                status: e.target.value,
                              })
                            }
                            options={[
                              { value: 'OK', label: 'Saludable' },
                              { value: 'SICK', label: 'Enfermo' },
                              { value: 'LOST', label: 'Perdido' },
                              { value: 'DECEASED', label: 'Fallecido' },
                            ]}
                          />
                        </>
                      )}

                      {(pet.accessLevelEnum === 'FULL' ||
                        pet.accessLevelEnum === 'WRITE') && (
                        <>
                          <TextField
                            label="Nombre del dueño (visible)"
                            value={formData.ownerName || ''}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                ownerName: e.target.value,
                              })
                            }
                          />
                          <TextField
                            label="Contacto del dueño (visible)"
                            value={formData.ownerContact || ''}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                ownerContact: e.target.value,
                              })
                            }
                          />
                        </>
                      )}

                      <div className="flex justify-between mt-4">
                        <button
                          type="button"
                          className="btn btn-secondary"
                          onClick={() => setIsEditing(false)}
                        >
                          Cancelar
                        </button>
                        <button type="submit" className="btn btn-primary">
                          💾 Guardar
                        </button>
                      </div>
                    </form>
                  ) : (
                    <>
                      <Dialog.Title className="text-2xl font-semibold mb-4">
                        {pet.name}
                      </Dialog.Title>

                      <table className="w-full text-sm">
                        <tbody>
                          <Row label="Especie" value={pet.species} />
                          <Row label="Raza" value={pet.breed ?? '—'} />
                          <Row label="Sexo" value={pet.sex} />
                          <Row
                            label="Nacimiento"
                            value={
                              pet.birthdate
                                ? dayjs(pet.birthdate).format('DD/MM/YYYY')
                                : '—'
                            }
                          />
                          <Row label="Estado" value={pet.visibility} />
                          <Row
                            label="Propietario"
                            value={pet.ownerName ?? 'Sin asignar'}
                          />
                          <Row
                            label="Contacto"
                            value={pet.ownerContact ?? '—'}
                          />
                        </tbody>
                      </table>

                      {(user?.roleName === 'VET' ||
                        user?.roleName === 'PET_OWNER') && (
                        <div className="mt-6">
                          <h2 className="font-medium mb-2">
                            Código QR para compartir
                          </h2>

                          <div className="flex justify-center mb-4">
                            <PetQRCode
                              token={pet.qrCodeToken}
                              data-qr-printable
                            />
                            <EditCodeDisplay
                              petId={petId}
                              isOpen={true} // o el estado que uses
                              onClose={() => console.log('cerrar')} // o tu lógica
                            />
                          </div>

                          <div className="flex flex-col sm:flex-row sm:justify-center gap-3">
                            <button
                              className="btn btn-secondary"
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
                            >
                              ⬇️ Descargar QR
                            </button>

                            {/* <EditCodeDisplay petId={138} /> */}

                            <button
                              className="btn btn-secondary"
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
                            >
                              🖨️ Imprimir QR
                            </button>
                          </div>
                        </div>
                      )}

                      {(user?.roleName === 'VET' ||
                        user?.roleName === 'PET_OWNER') && (
                        <div className="mt-6 flex justify-center">
                          <button
                            className="btn btn-primary"
                            onClick={() =>
                              navigate(`/pets/${pet.id}/comp-history`)
                            }
                          >
                            Ver historial
                          </button>
                        </div>
                      )}

                      {pet.accessLevelEnum === 'FULL_OWNER' && (
                        <button
                          className="btn btn-primary"
                          onClick={startEditFull}
                        >
                          🛠 Editar Mascota
                        </button>
                      )}

                      {pet.accessLevelEnum === 'FULL' && (
                        <button
                          className="btn btn-primary"
                          onClick={startEditFull}
                        >
                          🩺 Editar Paciente
                        </button>
                      )}

                      {pet.accessLevelEnum == 'WRITE' && (
                        <button
                          className="btn btn-primary"
                          onClick={startEditContact}
                        >
                          📞 Editar Contacto
                        </button>
                      )}
                    </>
                  )}
                  <div className="flex justify-end">
                    <button
                      onClick={onClose}
                      className="btn btn-secondary mt-4"
                    >
                      Cerrar
                    </button>
                  </div>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Transition>
    </Dialog>
  );
}

function Row({
  label,
  value,
}: {
  label: string;
  value?: string | number | null;
}) {
  return (
    <tr>
      <td className="py-1 font-medium w-32">{label}</td>
      <td className="py-1">{value || '—'}</td>
    </tr>
  );
}
function TextField({
  label,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement> & { label: string }) {
  return (
    <div className="flex flex-col text-sm">
      <label className="font-medium mb-1">{label}</label>
      <input
        className="bg-white/10 border border-white/20 rounded px-3 py-2"
        {...props}
      />
    </div>
  );
}
function TextFieldSelect({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: React.ChangeEventHandler<HTMLSelectElement>;
  options: { value: string; label: string }[];
}) {
  return (
    <div className="flex flex-col text-sm">
      <label className="font-medium mb-1">{label}</label>
      <select className="select   px-3 py-2 " value={value} onChange={onChange}>
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
}
