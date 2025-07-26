import React from 'react';
import ReactDOM from 'react-dom/client';
import {
  BrowserRouter,
  Routes,
  Route,
  Outlet,
  Navigate,
} from 'react-router-dom';
import { AuthProvider } from './auth/AuthContext';
import AppLayout from './components/AppLayout';

import LoginPage from './auth/LoginPage';
import PetListPage from './pages/Pets/PetListPage';
import PetDetailPage from './pages/Pets/PetDetailPage';
import CreatePetPage from './pages/Pets/CreatePetPage';
import { oidc } from './auth/oidc'; // ➊ nuevo
import CallbackPage from './auth/CallbackPage'; // ➋ nuevo
import Dashboard from './pages/Dashboard/Dashboard';
import ProtectedRoute from './auth/ProtectedRoute';

import LoginRedirectPage from './auth/LoginRedirectPage'; // ⬅️ nuevo
import CreateClinicPage from './pages/Clinics/CreateClinicPage';
import ClinicListPage from './pages/Clinics/ClinicListPage';
import RegisterVetPage from './pages/Vets/RegisterVetPage';
import './index.css';
import ClinicMePage from './pages/Clinics/ClinicMePage';
import AppointmentDetailPage from './pages/Appointments/AppointmentDetailPage';

//
import PetHistoryPage from './pages/Pets/PetHistoryPage';
import CreateAppointmentPage from './pages/Appointments/CreateAppointmentPage';

// VISITANTE

import VisitorDashboard from './pages/Public/VistorDashboard';
// import QRSearchPage from './pages/Public/QRSearchPage';
import PublicPetPage from './pages/Public/PublicPetPage';

import QrPetSearchPage from './pages/Public/QrPetSearchPage';
// import PublicPetPage    from './pages/Public/PublicPetPage';

import { Toaster } from 'react-hot-toast';

import { QrModalProvider } from './qr-modal/QrModalContext';
import CompletePetInfo from './pages/Pets/CompletePetInfo';
import PredictPage from './pages/Predict/PredictPage';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import ClinicMapPage from './pages/Clinics/ClinicsMap';
import ClinicStatsPage from './components/admin/ClinicStatsPage';
import GlobalStatsPage from './components/admin/GlobalStatsPage';

const queryClient = new QueryClient();

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AuthProvider>
          <Toaster position="top-center" />
          <Routes>
            {/* <Route path="/login" element={<LoginPage />} /> */}

            {/* <Route path="/predict" element={<PredictPage />} /> */}
            <Route path="/login" element={<LoginRedirectPage />} />
            <Route path="/callback" element={<CallbackPage />} />
            <Route element={<AppLayout />}>
              <Route
                path="/home"
                element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/admin/stats/global"
                element={
                  <ProtectedRoute roles={['ADMIN']}>
                    <GlobalStatsPage />
                  </ProtectedRoute>
                }
              />

              {/* DASHBOARD DE CLÍNICA ESPECÍFICA ----------------------- */}
              <Route
                path="/admin/clinics/:clinicId"
                element={
                  <ProtectedRoute roles={['ADMIN']}>
                    <ClinicStatsPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="pets/:id"
                element={
                  <ProtectedRoute roles={['PET_OWNER', 'VET']}>
                    <PetDetailPage />
                  </ProtectedRoute>
                }
              />
              {/* <Route
                  path="pets/new"
                  element={
                    <ProtectedRoute roles={['PET_OWNER', 'VET']}>
                      <CreatePetPage />
                    </ProtectedRoute>
                  }
                /> */}

              <Route
                path="clinics"
                element={
                  <ProtectedRoute roles={['ADMIN']}>
                    <ClinicListPage />
                  </ProtectedRoute>
                }
              />

              <Route
                path="clinics/new"
                element={
                  <ProtectedRoute roles={['ADMIN']}>
                    <CreateClinicPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="clinics/me"
                element={
                  <ProtectedRoute roles={['VET']}>
                    <ClinicMePage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="clinics/map"
                element={
                  <ProtectedRoute roles={['ADMIN']}>
                    <ClinicMapPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="vets/new"
                element={
                  <ProtectedRoute roles={['ADMIN']}>
                    <RegisterVetPage />
                  </ProtectedRoute>
                }
              />

              <Route
                path="pets/:id/history"
                element={
                  <ProtectedRoute roles={['VET']}>
                    <PetHistoryPage />
                  </ProtectedRoute>
                }
              />

              <Route
                path="pets/:id/comp-history"
                element={
                  <ProtectedRoute roles={['VET', 'PET_OWNER']}>
                    <CompletePetInfo />
                  </ProtectedRoute>
                }
              />

              <Route
                path="records/:recordId/appointments/new"
                element={
                  <ProtectedRoute roles={['VET']}>
                    <CreateAppointmentPage />
                  </ProtectedRoute>
                }
              />

              <Route
                path="appointments/:id"
                element={
                  <ProtectedRoute roles={['VET']}>
                    <AppointmentDetailPage />
                  </ProtectedRoute>
                }
              />

              {/* más rutas… */}

              {/* -----------------------  PÚBLICAS  --q--------------------- */}

              <Route path="/" element={<VisitorDashboard />} />
              {/* <Route path="/qr"            element={<QRSearchPage />} /> */}
              <Route path="/qr/:token" element={<PublicPetPage />} />

              {/* login (también público) */}
              {/* <Route path="/login" element={<LoginPage />} /> */}
              {/* <Route
                path="/login"
                element={<Navigate to={oidc.settings.authority} replace />}
              /> */}

              <Route
                element={
                  <QrModalProvider>
                    <Outlet />
                  </QrModalProvider>
                }
              >
                {/* <Route path="/qr" element={<QrPetSearchPage />} /> */}
                <Route path="/qr" element={<QrPetSearchPage />} />
                <Route
                  path="pets"
                  element={
                    <ProtectedRoute roles={['PET_OWNER', 'VET']}>
                      <PetListPage />
                    </ProtectedRoute>
                  }
                />
              </Route>
            </Route>

            {/* <Route element={<VisitorLayout />}> */}
            {/* </Route> */}
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </QueryClientProvider>
  </React.StrictMode>,
);
