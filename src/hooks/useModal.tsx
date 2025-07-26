// hooks/useModal.ts (conceptual)
import { useState, useCallback } from 'react';

export const useModal = () => {
  const [isOpen, setIsOpen] = useState(false); // This 'isOpen' is the boolean state

  const toggle = useCallback(() => setIsOpen((prev) => !prev), []);
  const close = useCallback(() => setIsOpen(false), []);
  const open = useCallback(() => setIsOpen(true), []); // You might have an 'open' function, or just rely on 'toggle'

  return {
    isOpen, // <--- This should be the boolean state
    toggle,
    close,
    open, // If you need a direct open function
  };
};
