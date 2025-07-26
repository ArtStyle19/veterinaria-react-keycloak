// src/auth/LoginRedirectPage.tsx
import { useEffect } from 'react';
import { oidc } from './oidc';

export default function LoginRedirectPage() {
  useEffect(() => {
    oidc.signinRedirect();
  }, []);
  return <p className="p-8 text-center">Redirigiendo a Keycloak…</p>;
}
