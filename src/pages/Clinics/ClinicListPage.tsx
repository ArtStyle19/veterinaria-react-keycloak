import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getAllClinics } from '../../api/clinics';
import type { ClinicDto } from '../../types/clinic';
import PageWrapper from '../../components/PageWrapper';
import ClinicMapModal from '../../components/ClinicsMapModal';
import RegisterVetModal from '../../components/RegisterVetModal';

export default function ClinicListPage() {
  const [clinics, setClinics] = useState<ClinicDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [openMapModal, setOpenMapModal] = useState(false);

  const [openVetModal, setOpenVetModal] = useState(false);

  useEffect(() => {
    getAllClinics()
      .then(setClinics)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p>Cargando…</p>;

  return (
    <PageWrapper>
      <div className="space-y-6">
        {/* encabezado */}
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-semibold">Clínicas</h1>
          <div className="flex gap-4">
            <button
              onClick={() => setOpenMapModal(true)}
              className="btn btn-secondary"
            >
              Ver en mapa
            </button>
            <button
              onClick={() => setOpenVetModal(true)}
              className="btn btn-primary"
            >
              Nuevo veterinario
            </button>
            <Link to="/clinics/new" className="btn btn-primary">
              Nueva clínica
            </Link>
          </div>
        </div>

        {/* tabla */}
        <table className="min-w-full rounded shadow-sm">
          <thead>
            <tr className="bg-white/10 text-left text-sm">
              <th className="p-2">ID</th>
              <th className="p-2">Nombre</th>
              <th className="p-2">Dirección</th>
              <th className="p-2">Email</th>
              <th className="p-2 w-36">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {clinics.map((c) => (
              <tr
                key={c.id}
                className="border-b text-sm hover:bg-slate-50/10 transition"
              >
                <td className="p-2">{c.id}</td>
                <td className="p-2">{c.name}</td>
                <td className="p-2">{c.address ?? '—'}</td>
                <td className="p-2">{c.email ?? '—'}</td>
                <td className="p-2">
                  <Link
                    to={`/admin/clinics/${c.id}`}
                    className="btn"
                    // className="inline-block text-sm px-3 py-1.5 rounded
                    //            bg-blue-600 text-white hover:bg-blue-700"
                  >
                    Ver dashboard
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* modal con mapa */}
      <ClinicMapModal
        isOpen={openMapModal}
        onClose={() => setOpenMapModal(false)}
      />

      {/* modal de registro de veterinario */}
      <RegisterVetModal
        isOpen={openVetModal}
        onClose={() => setOpenVetModal(false)}
        onSuccess={() => {
          // si quieres refrescar la lista de clínicas o hacer algo más
        }}
      />
    </PageWrapper>
  );
}
