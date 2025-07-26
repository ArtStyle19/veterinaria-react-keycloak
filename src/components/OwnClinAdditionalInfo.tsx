/* components/SimpleModal.tsx */
import { type PropsWithChildren, useEffect } from 'react';
import { createPortal } from 'react-dom';

export default function SimpleModal({
  isOpen,
  onClose,
  children,
}: PropsWithChildren<{ isOpen: boolean; onClose: () => void }>) {
  useEffect(() => {
    if (isOpen) document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-50 flex items-center justify-center
                 bg-black/40 backdrop-blur-sm animate-fade-in"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-md mx-4 p-6 rounded-2xl border border-white/20
                   bg-white/10 backdrop-blur-lg shadow-xl text-slate-100
                   animate-slide-up"
        onClick={(e) => e.stopPropagation()}
      >
        {children}
        <div className="text-right mt-6">
          <button className="btn btn-sm" onClick={onClose}>
            Cerrar
          </button>
        </div>
      </div>

      {/* keyframes */}
      <style jsx>{`
        @keyframes fade-in {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
        @keyframes slide-up {
          0% {
            opacity: 0;
            transform: translateY(30px) scale(0.95);
          }
          100% {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
        .animate-fade-in {
          animation: fade-in 0.25s ease-out both;
        }
        .animate-slide-up {
          animation: slide-up 0.35s cubic-bezier(0.16, 1, 0.3, 1) both;
        }
      `}</style>
    </div>,
    document.body,
  );
}
