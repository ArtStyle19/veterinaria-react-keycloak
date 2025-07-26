import { useState, useEffect, useRef } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import toast from 'react-hot-toast';
import api from '../api/axios';
import { importPet } from '../api/pets';
import { useQrModal } from './QrModalContext';
import { useAuth } from '../auth/AuthContext';
import dayjs from 'dayjs';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import type { PublicPetDto } from '../types/pet';
import { useQueryClient } from '@tanstack/react-query';

interface QrModalProps {
  onExited: () => void;
  onImport?: () => void;
}

export default function QrModal({ onExited }: QrModalProps) {
  const { mode, close } = useQrModal();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [step, setStep] = useState<'SCAN' | 'INFO' | 'EDIT' | 'DONE'>('SCAN');
  const [pet, setPet] = useState<PublicPetDto | null>(null);
  const [editCode, setEditCode] = useState('');
  const [importing, setImporting] = useState(false);
  const [QrToken, setQrToken] = useState('');

  const scannerRef = useRef<Html5QrcodeScanner | null>(null);
  const [scannerReady, setScannerReady] = useState(false);

  const queryClient = useQueryClient();

  const initScanner = () => {
    setTimeout(() => {
      const scanner = new Html5QrcodeScanner(
        'qr-reader',
        {
          fps: 10,
          qrbox: 250,
          rememberLastUsedCamera: false,
          // aspectRatio: 100.0,
          // showTorchButtonIfSupported: true,
          showTorchButtonIfSupported: true,
          // showZoomSliderIfSupported: true,
          // defaultZoomValueIfSupported: 1,
          // aspectRatio: 1.0,
          // disableFlip: false,
        },
        false,
      );

      //lines animation

      const observer = new MutationObserver(() => {
        const shadedRegion = document.querySelector(
          '#qr-shaded-region',
        ) as HTMLElement;
        if (shadedRegion && !shadedRegion.querySelector('.qr-scan-line')) {
          const line = document.createElement('div');
          line.className = 'qr-scan-line';
          shadedRegion.appendChild(line);
          observer.disconnect(); // ya no se necesita observar más
        }
      });

      observer.observe(document.getElementById('qr-reader')!, {
        childList: true,
        subtree: true,
      });
      //

      scanner.render(
        (decoded) => {
          scanner.clear();
          handleToken(decoded);
        },
        () => {},
      );
      setScannerReady(true);
    }, 100);
  };

  const clearScanner = async () => {
    const scanner = scannerRef.current;

    // 1 - marcarlo como NULL en seguida
    scannerRef.current = null;

    // 2 - esperar el clear real
    if (scanner) {
      try {
        await scanner.clear(); // <-- promesa asíncrona
      } catch (e) {
        console.warn('Error clearing scanner:', e);
      }
    }

    // 3 - limpiar el contenedor
    const el = document.getElementById('qr-reader');
    if (el) el.innerHTML = '';
  };

  useEffect(() => {
    if (step !== 'SCAN' || scannerRef.current) return;
    document.getElementById('qr-reader')?.remove;

    const el = document.getElementById('qr-reader');
    if (!el) return;

    const scanner = new Html5QrcodeScanner(
      'qr-reader',
      {
        fps: 10,
        qrbox: 250,
        rememberLastUsedCamera: false,
        showTorchButtonIfSupported: true,
      },
      false,
    );

    scanner.render(
      (decoded) => {
        scanner.clear().then(() => {
          scannerRef.current = null;
          handleToken(decoded);
        });
      },
      () => {},
    );

    scannerRef.current = scanner;

    // Animación de línea
    const observer = new MutationObserver(() => {
      const shadedRegion = document.querySelector(
        '#qr-shaded-region',
      ) as HTMLElement;
      if (shadedRegion && !shadedRegion.querySelector('.qr-scan-line')) {
        const line = document.createElement('div');
        line.className = 'qr-scan-line';
        shadedRegion.appendChild(line);
        observer.disconnect();
      }
    });

    observer.observe(document.getElementById('qr-reader')!, {
      childList: true,
      subtree: true,
    });
  }, [step]);

  function handleToken(raw: string) {
    const match = raw.match(
      /([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})/i,
    );
    if (!match) {
      toast.error('QR inválido');
      return;
    }

    const token = match[1];
    setQrToken(token);

    if (mode === 'VIEW') {
      navigate(`/qr/${token}`);
      close();
      return;
    }

    api
      .get(`/api/public/pets/qr/${token}`)
      .then((res) => {
        setPet(res.data);
        setStep('INFO');
      })
      .catch(() => toast.error('Mascota no encontrada'));
  }

  async function handleImport() {
    if (!QrToken) return;
    if (!editCode.trim()) {
      toast.error('Ingresa el código de edición');
      return;
    }
    try {
      setImporting(true);
      await importPet({ qrCodeToken: QrToken, editCode });
      toast.success('Importación exitosa');

      // 🔥 Invalida la cache de mascotas
      queryClient.invalidateQueries({ queryKey: ['pets'] });

      setStep('DONE');
    } catch (e: any) {
      toast.error(e.response?.data?.message || 'Error al importar');
    } finally {
      setImporting(false);
    }
  }
  const canImport =
    mode === 'IMPORT_VET' || (mode === 'IMPORT_OWNER' && pet?.canBeImported);

  return (
    <motion.div
      key="qr-modal"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/20 flex items-center backdrop-blur-sm justify-center  z-40"
      onClick={() => {
        clearScanner();
        close();
      }}
      onAnimationComplete={(definition) => {
        if (definition === 'exit') {
          onExited();
        }
      }}
    >
      <motion.div
        layout
        className="bg-black/60 border border-white/15 shadow-glass rounded-2xl p-6 w-1/3 text-slate-100 flex flex-col"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        style={{ minHeight: 600, minWidth: 600 }}
        onAnimationComplete={(definition) => {
          if (definition === 'exit') {
            onExited();
          }
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="overflow-y-auto p-6 flex-grow flex flex-col gap-4">
          <div className="px-6 pt-6">
            <h2 className="text-xl font-semibold text-center">
              {step === 'SCAN' && 'Escanea código QR'}
              {step === 'INFO' && 'Mascota encontrada'}
              {step === 'EDIT' && 'Confirmar importación'}
              {step === 'DONE' && 'Éxito'}
            </h2>
          </div>

          <div className="flex-grow overflow-y-auto px-6 py-4 space-y-4">
            <AnimatePresence>
              <motion.div
                key={step}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                // exit={{ opacity: 0, x: -30 }}
                transition={{ duration: 0.4 }}
              >
                {step === 'SCAN' && (
                  <>
                    <div
                      id="qr-reader"
                      className="rounded-lg overflow-hidden min-h-[250px]"
                    />
                    <p className="text-center text-xs mt-2">
                      Apunta la cámara o sube una imagen. El QR debe contener un
                      token UUID o una URL <code>/qr/&lt;token&gt;</code>.
                    </p>
                  </>
                )}

                {step === 'INFO' && pet && (
                  <>
                    <p className="text-lg font-medium">
                      {pet.name} — {pet.species}
                    </p>
                    <p className="text-sm opacity-90">{pet.breed}</p>
                    <table className="text-sm mt-2">
                      <tbody>
                        <Row label="Sexo" value={pet.sex} />
                        <Row
                          label="Nacimiento"
                          value={
                            pet.birthdate
                              ? dayjs(pet.birthdate).format('DD/MM/YYYY')
                              : '—'
                          }
                        />
                        <Row label="Estado" value={pet.status} />
                      </tbody>
                    </table>
                    {pet.status === 'LOST' && (
                      <div className="mt-3 text-amber-200 text-sm">
                        <p>Dueño: {pet.ownerName || '—'}</p>
                        <p>Contacto: {pet.ownerContact || '—'}</p>
                        {pet.ownerEmail && <p>Email: {pet.ownerEmail}</p>}
                      </div>
                    )}
                  </>
                )}

                {step === 'EDIT' && (
                  <input
                    className="input w-full"
                    placeholder="Código de edición"
                    value={editCode}
                    onChange={(e) => setEditCode(e.target.value)}
                  />
                )}

                {step === 'DONE' && (
                  <p className="text-center text-lg font-semibold">
                    ¡Importación completada!
                  </p>
                )}
              </motion.div>
            </AnimatePresence>
          </div>

          <div className="px-6 pb-6 space-y-2">
            <div className="flex justify-between items-center flex-wrap gap-2">
              {(step === 'INFO' || step === 'EDIT') && (
                <button
                  className="btn btn-secondary"
                  onClick={() => {
                    if (step === 'EDIT') return setStep('INFO');
                    // clearScanner();
                    setPet(null);
                    setStep('SCAN');
                    setEditCode('');
                  }}
                >
                  ← Volver
                </button>
              )}

              {step === 'INFO' && canImport && (
                <button
                  className="btn btn-primary"
                  onClick={() => setStep('EDIT')}
                >
                  Importar
                </button>
              )}

              {step === 'EDIT' && (
                <button
                  className="btn btn-primary"
                  onClick={handleImport}
                  disabled={importing}
                >
                  {importing ? 'Importando…' : 'Confirmar'}
                </button>
              )}

              {step === 'DONE' && (
                <button
                  className="btn btn-primary justify-center w-full"
                  onClick={() => {
                    clearScanner();
                    setPet(null);
                    setStep('SCAN');
                    setEditCode('');
                  }}
                >
                  Escanear otro
                </button>
              )}
            </div>

            <div className="flex justify-center pt-2">
              <button
                className="btn btn-ghost text-sm opacity-70 hover:opacity-100"
                onClick={() => {
                  clearScanner();
                  close();
                }}
              >
                ✕ Cerrar
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

function Row({ label, value }: { label: string; value?: string }) {
  return (
    <tr>
      <td className="pr-2">{label}</td>
      <td className="opacity-90">{value || '—'}</td>
    </tr>
  );
}
