import { useEffect } from 'react';
import { oidc } from './oidc';

export default function CallbackPage() {
  useEffect(() => {
    // Procesa el código solo **una** vez
    oidc.signinRedirectCallback().finally(() => {
      // Recargamos la SPA para que AuthProvider arranque con la sesión fresca
      window.location.replace('/home');
    });
  }, []);

  return <p className="p-8 text-center">Procesando login…</p>;
}
