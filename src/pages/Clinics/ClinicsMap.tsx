import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { getAllClinics } from '../../api/clinics';
import type { ClinicDto } from '../../types/clinic';
import PageWrapper from '../../components/PageWrapper';
import L from 'leaflet';

// Para que los íconos se vean bien (Leaflet bug con Webpack/Vite)
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

export default function ClinicMapPage() {
  const [clinics, setClinics] = useState<ClinicDto[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getAllClinics()
      .then(setClinics)
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p>Cargando mapa…</p>;

  const center = clinics.length
    ? [clinics[0].latitude, clinics[0].longitude]
    : [0, 0]; // fallback

  return (
    <PageWrapper>
      <div className="b">
        <h1 className="text-2xl font-semibold mb-4">Mapa de Clínicas</h1>
        <MapContainer
          center={center as [number, number]}
          zoom={5}
          className="h-[600px] w-full rounded shadow"
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution="&copy; OpenStreetMap contributors"
          />
          {clinics.map((clinic) => (
            <Marker
              key={clinic.id}
              position={[clinic.latitude, clinic.longitude]}
            >
              <Popup>
                <strong>{clinic.name}</strong>
                <br />
                {clinic.address}
                <br />
                <a href={`mailto:${clinic.email}`}>{clinic.email}</a>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>
    </PageWrapper>
  );
}
