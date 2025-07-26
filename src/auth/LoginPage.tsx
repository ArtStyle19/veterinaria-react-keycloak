import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from './AuthContext';
import PageWrapper from '../components/PageWrapper';

export default function LoginPage() {
  const { login } = useAuth();
  const loc = useLocation();
  const nav = useNavigate();

  // si vienes redirigido porque la sesión caducó
  if ((loc.state as any)?.reason === 'unauth') {
    setTimeout(login, 500);
  }

  return (
    <PageWrapper>
      <div className="flex flex-col items-center justify-center h-9/10">
        <button onClick={login} className="btn btn-primary">
          Iniciar sesión con Keycloak
        </button>
      </div>
    </PageWrapper>
  );
}
