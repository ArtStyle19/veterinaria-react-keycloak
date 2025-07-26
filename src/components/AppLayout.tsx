// src/components/AppLayout.tsx
import {
  Link,
  NavLink,
  Outlet,
  useLocation,
  useNavigate,
} from 'react-router-dom';
import { useEffect } from 'react';
import { LogIn, LogOut } from 'lucide-react';

import { useAuth } from '../auth/AuthContext';
import { oidc } from '../auth/oidc'; // 👈 nuevo import

/* Si seguías usando esta flag para fullscreen en algunas vistas… */
const isFullHeight = false; // ajústalo según tu lógica

export default function AppLayout() {
  const { user, loading, logout: ctxLogout, login: ctxLogin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  /* ---------- helpers ---------- */
  const logout = () => {
    ctxLogout(); // dispara oidc.signoutRedirect()
    // opcional: también navegar a /login si prefieres
  };

  const login = () => ctxLogin(); // oidc.signinRedirect()

  /* ---------- sesión cerrada en otra pestaña ---------- */
  useEffect(() => {
    const sub = oidc.events.addUserSignedOut(() => {
      ctxLogout();
      navigate('/login');
    });
    return () => oidc.events.removeUserSignedOut(sub);
  }, []);

  /* ---------- enlaces ---------- */
  const PublicLinks = (
    <>
      <NavLink to="/" className="nav-link">
        Inicio
      </NavLink>
      <NavLink to="/qr" className="nav-link">
        Buscar mascota
      </NavLink>
    </>
  );

  const OwnerLinks = (
    <NavLink to="/pets" className="nav-link">
      Mis mascotas
    </NavLink>
  );

  const VetLinks = (
    <>
      <NavLink to="/pets" className="nav-link">
        Pacientes
      </NavLink>
      <NavLink to="/clinics/me" className="nav-link">
        Clínica
      </NavLink>
    </>
  );

  const AdminLinks = (
    <>
      <NavLink to="/clinics" className="nav-link">
        Clínicas
      </NavLink>
      <NavLink to="/vets/new" className="nav-link">
        Nuevo vet
      </NavLink>
      <NavLink to="/admin/stats/global" className="nav-link">
        Gestionar
      </NavLink>
    </>
  );

  return (
    <div
      // className="min-h-screen flex flex-col bg-gradient-to-bl
      // //               from-blue-950 via-black to-violet-950 text-slate-100"
      className="min-h-screen flex flex-col bg-gradient-to-bl
      //               from-[#EDEDEF] via-[#EDEDEF] to-[#EDEDEF] text-black"
      // className="min-h-screen flex flex-col bg-[#A9C3B8]"
    >
      {/* ---------- NAV ---------- */}
      <nav className="backdrop-blur-md bg-white/3 border-b border-black/50 shadow-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-3 flex justify-between items-center">
          {/* brand */}
          <Link to="/" className="font-bold text-lg tracking-wide">
            🐾 Central-Vet
          </Link>

          {/* links */}
          <div className="flex items-center gap-6 text-sm">
            {PublicLinks}
            {user?.roleName === 'PET_OWNER' && OwnerLinks}
            {user?.roleName === 'VET' && VetLinks}
            {user?.roleName === 'ADMIN' && AdminLinks}
          </div>

          {/* auth btn */}
          {!loading &&
            (user ? (
              <button
                onClick={logout}
                className="flex items-center gap-1 bg-violet-600/40
                         border-white/50 border-1 hover:bg-blue-600/0
                         hover:border-white transition px-3 py-1 rounded-full
                         text-xs shadow-md"
              >
                <LogOut size={14} /> Salir
              </button>
            ) : (
              <button
                onClick={login}
                className="flex items-center gap-1 bg-blue-700/30
                         border-white/50 border-1 hover:bg-blue-600/0
                         hover:border-white transition px-3 py-1 rounded-full
                         text-xs shadow-md"
              >
                <LogIn size={14} /> Iniciar sesión
              </button>
            ))}
        </div>
      </nav>

      {/* ---------- MAIN ---------- */}
      <main className="flex-1 flex justify-center px-4 py-8 overflow-hidden">
        <div
          className={`w-full max-w-7xl p-6 ${
            isFullHeight
              ? 'h-full min-h-[calc(100vh-160px)]'
              : 'overflow-y-auto min-h-[calc(100vh)] max-h-[calc(100vh-160px)] rounded-2xl backdrop-blur-md bg-white/3 border border-white/10 shadow-xl'
          }`}
        >
          <Outlet />
        </div>
      </main>

      {/* ---------- FOOTER ---------- */}
      <footer
        className="text-center text-xs py-6 text-black
                         backdrop-blur-md bg-white/3 border-t border-black/50"
      >
        © {new Date().getFullYear()} Central-Vet — Todos los derechos
        reservados
      </footer>
    </div>
  );
}
