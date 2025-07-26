// src/components/AppointmentDetailModal.tsx

import { Dialog, Transition } from '@headlessui/react';
import { Fragment, useEffect, useState } from 'react';
import { getAppointmentDetail } from '../api/medical';
import type { AppointmentDetailDto } from '../types/medical';
import dayjs from 'dayjs';

type Props = {
  appointmentId: number;
  isOpen: boolean;
  onClose: () => void;
};

export default function AppointmentDetailModal({
  appointmentId,
  isOpen,
  onClose,
}: Props) {
  const [data, setData] = useState<AppointmentDetailDto | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isOpen) {
      setLoading(true);
      getAppointmentDetail(appointmentId)
        .then(setData)
        .finally(() => setLoading(false));
    }
  }, [appointmentId, isOpen]);

  return (
    <Dialog as="div" className="relative z-50" open={isOpen} onClose={onClose}>
      <Transition appear show={isOpen} as={Fragment}>
        <div className="fixed inset-0">
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
            <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
          </Transition.Child>

          {/* Panel modal */}
          <div className="flex items-center justify-center min-h-full p-4">
            <Transition.Child
              as={Fragment}
              enter="transition-transform duration-300 ease-out"
              enterFrom="opacity-0 scale-95 translate-y-4"
              enterTo="opacity-100 scale-100 translate-y-0"
              leave="transition-transform duration-200 ease-in"
              leaveFrom="opacity-100 scale-100 translate-y-0"
              leaveTo="opacity-0 scale-95 translate-y-4"
            >
              <Dialog.Panel className="bg-white/10 backdrop-blur-md border border-white/20 text-white rounded-xl shadow-xl w-full max-w-xl max-h-[90vh] overflow-hidden">
                <div className="p-6 overflow-y-auto max-h-[90vh] space-y-4">
                  <Dialog.Title className="text-2xl font-semibold">
                    {loading ? 'Cargando cita…' : `Cita #${data?.id}`}
                  </Dialog.Title>

                  {!loading && data && (
                    <>
                      {data.clinicName && (
                        <p className="text-sm text-white/80">
                          Clínica: {data.clinicName}
                        </p>
                      )}

                      <table className="w-full text-sm">
                        <tbody>
                          <Row
                            label="Fecha"
                            value={dayjs(data.date).format('DD/MM/YYYY HH:mm')}
                          />
                          <Row label="Peso (kg)" value={data.weight} />
                          <Row
                            label="Temperatura (°C)"
                            value={data.temperature}
                          />
                          <Row
                            label="Ritmo cardíaco"
                            value={data.heartRate ?? '—'}
                          />
                          <Row
                            label="Síntomas"
                            value={data.symptoms.join(', ') || '—'}
                          />
                          <Row
                            label="Descripción"
                            value={data.description ?? '—'}
                          />
                          <Row
                            label="Diagnóstico"
                            value={data.diagnosis ?? '—'}
                          />
                          <Row
                            label="Tratamientos"
                            value={data.treatments ?? '—'}
                          />
                          <Row label="Notas" value={data.notes ?? '—'} />
                        </tbody>
                      </table>
                    </>
                  )}

                  <div className="flex justify-end">
                    <button
                      onClick={onClose}
                      className="btn btn-secondary mt-2"
                    >
                      Cerrar
                    </button>
                  </div>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Transition>
    </Dialog>
  );
}

function Row({ label, value }: { label: string; value: string | number }) {
  return (
    <tr>
      <td className="font-medium py-1 pr-4 w-40">{label}</td>
      <td className="py-1">{value}</td>
    </tr>
  );
}
