import { useAuth } from '../../auth/AuthContext';
import { Link } from 'react-router-dom';
import PageWrapper from '../../components/PageWrapper';

export default function Dashboard() {
  const { user } = useAuth();

  return (
    <PageWrapper>
      <div className="h-full">
        <div className="flex flex-col items-center justify-center gap-6 h-full">
          {/* <div className="flex flex-col items-center justify-center h-screen gap-6"> */}

          {/* <div className="space-y-6"> */}
          <h1 className="text-2xl font-semibold">
            ¡Bienvenido/a, {user?.username}!
          </h1>

          {user?.roleName === 'PET_OWNER' && (
            <>
              <p className="text-slate-700">
                Aquí puedes gestionar tus mascotas, registrar extravíos y
                mantener su información actualizada.
              </p>
              {/* <Link to="/pets/new" className="btn btn-primary">
            Registrar nueva mascota
          </Link> */}
            </>
          )}

          {user?.roleName === 'VET' && (
            <>
              <p className="text-slate-700">
                Accede a los historiales clínicos de tus pacientes y agenda
                nuevas consultas.
              </p>
              {/* <Link to="/pets" className="btn btn-primary">
            Ver pacientes
          </Link> */}

              {/* <Link to="/pets/new" className="btn btn-primary">
            Registrar nueva mascota
          </Link> */}
            </>
          )}

          {user?.roleName === 'ADMIN' && (
            <>
              <p className="text-slate-700">
                Administra clínicas y usuarios del sistema.
              </p>
              <Link to="/clinics" className="btn btn-primary">
                Ver clínicas
              </Link>
            </>
          )}
        </div>
      </div>
    </PageWrapper>
  );
}
