// useModal - Modal state management hook
// Provides consistent modal open/close state

import { useCallback } from 'react';
import { useToggle } from './useToggle';

export function useModal() {
  const [isOpen, open, close, setOpen] = useToggle(false);
  const [data, setData] = useState(null);

  const openModal = useCallback((modalData = null) => {
    setData(modalData);
    setOpen(true);
  }, [setOpen, setData]);

  const closeModal = useCallback(() => {
    setData(null);
    close();
  }, [close, setData]);

  const updateData = useCallback((newData) => {
    setData(newData);
  }, [setData]);

  return {
    isOpen,
    data,
    open: openModal,
    close: closeModal,
    setData: updateData,
  };
}

export function useMultipleModals(modalConfigs) {
  const modals = {};

  modalConfigs.forEach(config => {
    modals[config.key] = useModal();
  });

  const closeAll = useCallback(() => {
    Object.values(modals).forEach(modal => {
      modal.close();
    });
  }, [modals]);

  return { ...modals, closeAll };
}

export default useModal;