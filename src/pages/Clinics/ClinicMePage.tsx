// src/pages/ClinicMePage.tsx

import { useEffect, useState } from 'react';
import { getVetClinic } from '../../api/clinics'; // Use the corrected function name
import type { ClinicDto } from '../../types/clinic';
import PageWrapper from '../../components/PageWrapper';
import 'leaflet/dist/leaflet.css';

import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
// Arreglar íconos de Leaflet (opcional pero recomendado)
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

export default function ClinicMePage() {
  const [clinic, setClinic] = useState<ClinicDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchClinicData = async () => {
      setLoading(true); // Ensure loading is true before fetch
      setError(null); // Clear previous errors

      try {
        // No need to pass the token here; Axios interceptor handles it
        const data = await getVetClinic();
        setClinic(data);
      } catch (err: any) {
        // Use 'any' or check 'err instanceof AxiosError' if Axios provides it
        console.error('Error fetching clinic data:', err);
        // Axios error handling often includes err.response for server errors
        if (err.response && err.response.status === 401) {
          setError('Unauthorized: Please log in to view your clinic details.');
          // Your Axios interceptor should already handle redirecting to /login for 401
        } else if (
          err.response &&
          err.response.data &&
          err.response.data.message
        ) {
          setError(`Error: ${err.response.data.message}`);
        } else if (err instanceof Error) {
          setError(err.message);
        } else {
          setError('An unknown error occurred while fetching clinic data.');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchClinicData();
  }, []); // Empty dependency array: runs once on mount

  if (error) {
    return <p className="text-red-500">Error: {error}</p>;
  }

  if (!clinic) {
    // This case might mean no clinic is associated with the logged-in user,
    // or an error occurred that didn't set the error state.
    return <p></p>;
  }

  return (
    <PageWrapper>
      <div className="max-w-2xl mx-auto mt-16 p-8 rounded-xl bg-white/4 backdrop-blur-md shadow-xl border border-white/30">
        <h1 className="text-md font-bold mb-8 text-center text-white drop-shadow">
          Mi Clínica
        </h1>

        <div className="space-y-5 text-xs">
          {/* Nombre */}
          <div className="flex gap-4 items-start border-b border-white/30 pb-3">
            <div className="flex items-center gap-2 text-white/80 font-semibold min-w-[90px]">
              {/* Icono de usuario */}
              <svg
                className="w-4 h-4 text-white"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.5 20.25a8.25 8.25 0 0115 0"
                />
              </svg>
              <span>Nombre</span>
            </div>
            <span className="text-white">{clinic.name}</span>
          </div>

          {/* Dirección */}
          <div className="flex gap-4 items-start border-b border-white/30 pb-3">
            <div className="flex items-center gap-2 text-white/80 font-semibold min-w-[90px]">
              <svg
                className="w-4 h-4 text-white"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M3 12l9-9 9 9v9a3 3 0 01-3 3H6a3 3 0 01-3-3v-9z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M9 21V9h6v12"
                />
              </svg>
              <span>Dirección</span>
            </div>
            <span className="text-white">{clinic.address || '—'}</span>
          </div>

          {/* Email */}
          <div className="flex gap-4 items-start border-b border-white/30 pb-3">
            <div className="flex items-center gap-2 text-white/80 font-semibold min-w-[90px]">
              <svg
                className="w-4 h-4 text-white"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M3 8l7.89 5.26a3 3 0 003.22 0L22 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                />
              </svg>
              <span>Email</span>
            </div>
            <span className="text-white">{clinic.email || '—'}</span>
          </div>

          {/* Latitud y Longitud */}
          {(clinic.latitude || clinic.longitude) && (
            <div className="flex gap-4 items-start border-b border-white/30 pb-3">
              <div className="flex items-center gap-2 text-white/80 font-semibold min-w-[90px]">
                <svg
                  className="w-4 h-4 text-white"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 11.25a2.25 2.25 0 100-4.5 2.25 2.25 0 000 4.5z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M19.5 11.25c0 7.5-7.5 10.5-7.5 10.5S4.5 18.75 4.5 11.25a7.5 7.5 0 1115 0z"
                  />
                </svg>
                <span>Ubicación</span>
              </div>
              <span className="text-white">
                {clinic.latitude ? `Lat: ${clinic.latitude}` : ''}
                {clinic.longitude ? `, Long: ${clinic.longitude}` : ''}
              </span>
            </div>
          )}

          {/* Mapa */}
          {clinic.latitude && clinic.longitude && (
            <div className="mt-6 rounded-xl overflow-hidden border border-white/20">
              <MapContainer
                center={[clinic.latitude, clinic.longitude]}
                zoom={15}
                scrollWheelZoom={false}
                className="h-64 w-full rounded-md"
              >
                <TileLayer
                  attribution='&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                <Marker position={[clinic.latitude, clinic.longitude]}>
                  <Popup>
                    {clinic.name} <br /> {clinic.address || 'Ubicación'}
                  </Popup>
                </Marker>
              </MapContainer>
            </div>
          )}
        </div>
      </div>
    </PageWrapper>
  );
}
