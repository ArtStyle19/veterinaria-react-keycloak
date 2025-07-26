import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import api from '../../api/axios';
import type { PublicPetDto } from '../../types/pet';
import dayjs from 'dayjs';
import { useAuth } from '../../auth/AuthContext';

import PetQRCode from '../../components/PetQRCode';
import PageWrapper from '../../components/PageWrapper';

export default function PetDetailPage() {
  // Navigation

  const navigate = useNavigate(); // 👈 Initialize navigate

  const { user, setUser } = useAuth();
  const { token } = useParams<{ token: string }>();

  const { id } = useParams<{ id: string }>();
  const [pet, setPet] = useState<PublicPetDto | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    api
      .get<PublicPetDto>(`/api/pets/${id}`)
      .then((res) => setPet(res.data))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <p>Cargando…</p>;
  if (!pet) return <p>No encontrado</p>;

  return (
    <PageWrapper>
      <button
        onClick={() => navigate(-1)} // 👈 Go back one step in history
        className="btn btn-primary mb-4"
      >
        ← Volver
      </button>
      <div className="max-w-xl mx-auto bg-emerald-950/50 p-6 rounded shadow">
        <h1 className="text-2xl font-semibold mb-4">{pet.name}</h1>

        <table className="w-full text-sm">
          <tbody>
            <Row label="Especie" value={pet.species} />
            <Row label="Raza" value={pet.breed ?? '—'} />
            <Row label="Sexo" value={pet.sex} />
            <Row
              label="Nacimiento"
              value={
                pet.birthdate ? dayjs(pet.birthdate).format('DD/MM/YYYY') : '—'
              }
            />
            <Row label="Estado" value={pet.visibility} />
            <Row label="Propietario" value={pet.ownerName ?? 'Sin asignar'} />
            <Row label="Contacto" value={pet.ownerContact ?? '—'} />
          </tbody>
        </table>

        {(user?.roleName == 'VET' ||
          user?.roleName ==
            'PET_OWNER') /* opcional: solo roles internos */ && (
          <div className="mt-6">
            <h2 className="font-medium mb-2">Código QR para compartir</h2>
            <PetQRCode token={pet.qrCodeToken} />
          </div>
        )}
        {user?.roleName === 'VET' && (
          <Link
            to={`/pets/${pet.id}/history`}
            className="btn btn-primary mt-4 inline-block"
          >
            Ver historial
          </Link>
        )}
      </div>
    </PageWrapper>
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
