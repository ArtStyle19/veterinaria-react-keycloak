import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react';
import { oidc } from './oidc';
import { jwtDecode } from 'jwt-decode';
import { whoAmI } from '../api/auth'; // sigue siendo útil
import type { UserDto } from '../types/auth';

interface AuthCtx {
  user: UserDto | null;
  loading: boolean;
  login: () => void;
  logout: () => void;
  accessToken: string | null;
}

const AuthContext = createContext<AuthCtx | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [accessToken, setToken] = useState<string | null>(null);

  /* ------- init: ¿hay sesión almacenada por oidc? ------- */
  useEffect(() => {
    /* init normal (leer usuario guardado) */
    oidc.getUser().then(async (u) => {
      if (u && !u.expired) {
        setToken(u.access_token);
        const me = await whoAmI();
        console.log('JWT:', u.access_token);
        setUser(me);
      }
      setLoading(false);
    });

    /* 🔔  evento cuando CallbackPage termina */
    const subLoaded = oidc.events.addUserLoaded(async (u) => {
      setToken(u.access_token);
      const me = await whoAmI();
      setUser(me);
      setLoading(false);
    });

    const subSignedOut = oidc.events.addUserSignedOut(() => {
      setUser(null);
      setToken(null);
    });

    return () => {
      oidc.events.removeUserLoaded(subLoaded);
      oidc.events.removeUserSignedOut(subSignedOut);
    };
  }, []);

  /* ------- helpers públicos ------- */
  const login = () => oidc.signinRedirect();
  // AuthContext.tsx
  const logout = async () => {
    try {
      await oidc.signoutRedirect({
        post_logout_redirect_uri: window.location.origin, // http://localhost:5173/
      });

      //       await oidc.signoutRedirect({
      //   post_logout_redirect_uri: `${window.location.origin}/logged-out`,
      // });
    } finally {
      // Limpia estado local por si el usuario cierra la pestaña en la pantalla intermedia
      setUser(null);
      setToken(null);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        logout,
        accessToken,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth dentro de AuthProvider');
  return ctx;
}
