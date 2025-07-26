import { useEffect, useState } from 'react';
import api from '../../api/axios';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../auth/AuthContext';
import { useQrModal } from '../../qr-modal/QrModalContext';
import PageWrapper from '../../components/PageWrapper';
import CreatePetModal from '../../components/CreatePetModal';
import PetDetailModal from '../../components/PetDetailModal';

import type { PetListItemDto, OwnerDetail, ClinicDto } from '../../types/pet';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import SimpleModal from '../../components/OwnClinAdditionalInfo';

import dayjs from 'dayjs';
import { getHomeClinicDetail, getOwnerDetail } from '../../api/pets';

const fetchPets = async (): Promise<PetListItemDto[]> => {
  const res = await api.get('/api/pets');
  return res.data;
};
export default function PetListPage() {
  const [selectedPetId, setSelectedPetId] = useState<number | null>(null);
  const [ownerModalPet, setOwnerModalPet] = useState<number | null>(null);
  const [clinicModalPet, setClinicModalPet] = useState<number | null>(null);

  const { user } = useAuth();
  const { open } = useQrModal();
  const navigate = useNavigate();
  const [openModal, setOpenModal] = useState(false);
  const qc = useQueryClient();
  const {
    data: pets = [],
    isLoading,
    isError,
  } = useQuery({
    queryKey: ['pets'],
    queryFn: fetchPets,
  });

  /* ------- owner / clinic details (lazy) -------- */
  const { data: ownerDetail } = useQuery({
    queryKey: ['ownerDetail', ownerModalPet],
    queryFn: () => getOwnerDetail(ownerModalPet as number),
    enabled: !!ownerModalPet,
    staleTime: 5 * 60 * 1000,
  });

  const { data: clinicDetail } = useQuery({
    queryKey: ['clinicDetail', clinicModalPet],
    queryFn: () => getHomeClinicDetail(clinicModalPet as number),
    enabled: !!clinicModalPet,
    staleTime: 5 * 60 * 1000,
  });

  /* ------- columns that depend on role -------- */
  const isVet = user?.roleName === 'VET';
  const isOwner = user?.roleName === 'PET_OWNER';
  return (
    <PageWrapper>
      <div className="flex flex-col gap-6 h-full">
        <div className="space-y-6">
          <section className="bg-white/5 shadow rounded p-4 space-y-4">
            <header className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
              <h1 className="text-2xl font-semibold">
                {user?.roleName === 'PET_OWNER'
                  ? 'Mis mascotas'
                  : 'Mis pacientes'}
              </h1>

              <div className="flex gap-4">
                {user?.roleName === 'PET_OWNER' && (
                  <>
                    <button
                      className="btn btn-primary"
                      onClick={() => setOpenModal(true)}
                    >
                      Registrar Mascota
                    </button>
                    <button
                      className="btn btn-primary"
                      onClick={() => open('IMPORT_VET')}
                    >
                      Importar Mascota
                    </button>
                  </>
                )}
                {user?.roleName === 'VET' && (
                  <>
                    <button
                      className="btn btn-primary"
                      onClick={() => setOpenModal(true)}
                    >
                      Registrar nuevo Paciente
                    </button>
                    <button
                      className="btn btn-primary"
                      onClick={() => open('IMPORT_VET')}
                    >
                      Importar paciente
                    </button>
                  </>
                )}
              </div>
            </header>

            <table className="min-w-full table-auto text-sm text-black">
              <thead>
                <tr className="bg-white/10 border-b border-black text-xs uppercase tracking-wide">
                  <th className="p-2 w-12 text-center">ID</th>
                  <th className="p-2 text-center">Nombre</th>
                  <th className="p-2 text-center">Especie</th>
                  <th className="p-2 text-center">Raza</th>
                  <th className="p-2 text-center">Nac.</th>
                  {isVet && (
                    <>
                      <th className="p-2 text-center">Dueño</th>
                      <th className="p-2 text-center">Acceso</th>
                    </>
                  )}
                  {isOwner && <th className="p-2 text-center">Clínica</th>}
                  <th className="p-2 text-center">Estado</th>
                  <th className="p-2 text-center">Acciones</th>
                </tr>
              </thead>

              <tbody>
                {pets.map((p, i) => (
                  <tr
                    key={p.id}
                    className="group border-b border-white/30 hover:bg-white/10 transition duration-300 ease-out animate-fade-in"
                    style={{
                      animationDelay: `${i * 40}ms`,
                      animationFillMode: 'both',
                    }}
                  >
                    <td className="p-2 text-center">{p.id}</td>
                    <td className="p-2 text-center">
                      <button
                        onClick={() => setSelectedPetId(p.id)}
                        className="text-[#1BBCB6] group-hover:text-blue-300 hover:underline font-medium"
                      >
                        {p.name}
                      </button>
                    </td>
                    <td className="p-2 text-center">{p.species}</td>
                    <td className="p-2 text-center">{p.breed ?? '—'}</td>
                    <td className="p-2 text-center">
                      {p.birthdate
                        ? dayjs(p.birthdate).format('DD/MM/YYYY')
                        : '—'}
                    </td>

                    {isVet && (
                      <>
                        <td className="p-2 text-center">
                          {p.ownerName ? (
                            <button
                              className="underline text-black hover:text-blue-300"
                              onClick={() => setOwnerModalPet(p.id)}
                            >
                              {p.ownerName}
                            </button>
                          ) : (
                            '—'
                          )}
                        </td>
                        <td className="p-2 text-center">{p.accessLevel}</td>
                      </>
                    )}

                    {isOwner && (
                      <td className="p-2 text-center">
                        {p.homeClinic ? (
                          <button
                            className="underline text-[#1BBCB6] hover:text-blue-300"
                            onClick={() => setClinicModalPet(p.id)}
                          >
                            {p.homeClinic}
                          </button>
                        ) : (
                          '—'
                        )}
                      </td>
                    )}

                    <td
                      className={`p-2 text-center font-medium text-xs backdrop-blur-sm
                    ${p.status === 'OK' ? 'bg-[#1BBCB6]/100 text-emerald-200' : ''}
                    ${p.status === 'LOST' ? 'bg-red-800/100 text-red-200' : ''}
                    ${p.status !== 'OK' && p.status !== 'LOST' ? 'bg-slate-700/20 text-slate-200' : ''}`}
                    >
                      {p.status}
                    </td>

                    <td className="p-2 text-center">
                      <button
                        onClick={() => setSelectedPetId(p.id)}
                        className="text-blue-100 group-hover:text-blue-300 hover:underline font-medium"
                      >
                        Ver
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>
        </div>
      </div>

      {selectedPetId && (
        <PetDetailModal
          petId={selectedPetId}
          isOpen={true}
          onClose={() => setSelectedPetId(null)}
        />
      )}

      {ownerModalPet && (
        <SimpleModal isOpen={true} onClose={() => setOwnerModalPet(null)}>
          {ownerDetail ? (
            <div className="space-y-2">
              <h2 className="text-xl font-semibold mb-2">Propietario</h2>
              <p>
                <strong>Nombre:</strong> {ownerDetail.fullName}
              </p>
              <p>
                <strong>Email:</strong> {ownerDetail.email}
              </p>
              <p>
                <strong>Teléfono:</strong> {ownerDetail.phone}
              </p>
            </div>
          ) : (
            <p>Cargando…</p>
          )}
        </SimpleModal>
      )}

      {clinicModalPet && (
        <SimpleModal isOpen={true} onClose={() => setClinicModalPet(null)}>
          {clinicDetail ? (
            <div className="space-y-2">
              <h2 className="text-xl font-semibold mb-2">Clínica</h2>
              <p>
                <strong>Nombre:</strong> {clinicDetail.name}
              </p>
              <p>
                <strong>Dirección:</strong> {clinicDetail.address}
              </p>
              <p>
                <strong>Email:</strong> {clinicDetail.email}
              </p>
              <p>
                <strong>Lat/Lng:</strong> {clinicDetail.latitude},{' '}
                {clinicDetail.longitude}
              </p>
              {/* Aquí podrías insertar un mapa (Leaflet, GMaps) */}
            </div>
          ) : (
            <p>Cargando…</p>
          )}
        </SimpleModal>
      )}

      <CreatePetModal isOpen={openModal} onClose={() => setOpenModal(false)} />
    </PageWrapper>
  );
}
