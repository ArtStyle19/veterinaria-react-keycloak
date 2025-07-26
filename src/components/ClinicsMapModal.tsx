import { Dialog, Transition } from '@headlessui/react';
import { Fragment, useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import { getAllClinics } from '../api/clinics';
import type { ClinicDto } from '../types/clinic';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix íconos
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

type ClinicMapModalProps = {
  isOpen: boolean;
  onClose: () => void;
};

function ForceResize() {
  const map = useMap();
  useEffect(() => {
    setTimeout(() => {
      map.invalidateSize();
    }, 300);
  }, [map]);
  return null;
}

export default function ClinicMapModal({
  isOpen,
  onClose,
}: ClinicMapModalProps) {
  const [clinics, setClinics] = useState<ClinicDto[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isOpen) {
      setLoading(true);
      getAllClinics()
        .then(setClinics)
        .finally(() => setLoading(false));
    }
  }, [isOpen]);

  const center = clinics.length
    ? [clinics[0].latitude, clinics[0].longitude]
    : [0, 0];

  return (
    <Transition show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        {/* Fondo con blur */}
        <Transition.Child
          as={Fragment}
          enter="transition-opacity duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="transition-opacity duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/30 backdrop-blur-sm" />
        </Transition.Child>

        {/* Contenido centrado */}
        <div className="fixed inset-0 flex items-center justify-center p-4">
          <Transition.Child
            as={Fragment}
            enter="transition-transform duration-300 ease-out"
            enterFrom="opacity-0 scale-95 translate-y-4"
            enterTo="opacity-100 scale-100 translate-y-0"
            leave="transition-transform duration-200 ease-in"
            leaveFrom="opacity-100 scale-100 translate-y-0"
            leaveTo="opacity-0 scale-95 translate-y-4"
          >
            <Dialog.Panel className="bg-white/10 backdrop-blur-md border border-white/20 text-white rounded-xl shadow-xl w-[90%] max-w-4xl overflow-hidden">
              <div className="flex justify-between items-center p-4 border-b border-white/10">
                <Dialog.Title className="text-lg font-semibold">
                  Mapa de Clínicas
                </Dialog.Title>
                <button
                  onClick={onClose}
                  className="text-sm hover:text-white/80"
                >
                  ✕
                </button>
              </div>
              <div className="h-[500px]">
                {loading ? (
                  <div className="flex items-center justify-center h-full">
                    Cargando mapa…
                  </div>
                ) : (
                  <MapContainer
                    center={center as [number, number]}
                    zoom={5}
                    className="h-full w-full rounded-b-xl"
                  >
                    <ForceResize />
                    <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
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
                )}
              </div>
            </Dialog.Panel>
          </Transition.Child>
        </div>
      </Dialog>
    </Transition>
  );
}
