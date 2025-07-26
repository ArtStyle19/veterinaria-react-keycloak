import { createContext, useContext, useState } from 'react';
import QrModal from './QrModal';
import { AnimatePresence } from 'framer-motion';

type Mode = 'VIEW' | 'IMPORT_VET' | 'IMPORT_OWNER';

interface QrModalState {
  open: (mode: Mode) => void;
  close: () => void;
  mode: Mode | null;
}

const QrModalContext = createContext<QrModalState | null>(null);

export function QrModalProvider({ children }: { children: React.ReactNode }) {
  const [mode, setMode] = useState<Mode | null>(null);
  const [show, setShow] = useState(false);

  const open = (m: Mode) => {
    setMode(m);
    setShow(true);
  };

  const close = () => {
    setShow(false); // Esto oculta el modal, pero no desmonta aún
  };
  return (
    <QrModalContext.Provider value={{ open, close, mode }}>
      {children}
      <AnimatePresence>
        {show && mode && (
          <QrModal
            onExited={() => {
              setMode(null);
            }}
          />
        )}
      </AnimatePresence>
    </QrModalContext.Provider>
  );
}

// ✅ hook declarado fuera de cualquier condición
export function useQrModal(): QrModalState {
  const ctx = useContext(QrModalContext);
  if (!ctx) throw new Error('QrModalProvider missing');
  return ctx;
}
