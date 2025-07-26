import { Navigate, Link } from 'react-router-dom';
import { useAuth } from '../../auth/AuthContext';
import PageWrapper from '../../components/PageWrapper';

export default function VisitorDashboard() {
  const { user } = useAuth();

  /* ← si está logueado, saltamos al área privada */
  if (user) return <Navigate to="/home" replace />;
  return (
    <PageWrapper>
      <div className="flex flex-col items-center justify-center gap-6 h-full">
        <h1 className="text-3xl font-bold">Bienvenido a Central-Vet</h1>
        <p className="text-slate-600 text-center max-w-md">
          Bienvenido. Aquí puedes gestionar tus mascotas, registrar extravíos y
          mantener su información actualizada.
        </p>
        <Link to="/qr" className="btn btn-primary">
          Buscar mascota por QR
        </Link>
        <Link to="/login" className="text-slate-600 hover:underline">
          Soy usuario registrado →
        </Link>
      </div>
    </PageWrapper>
  );
}
