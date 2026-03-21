import React from 'react';
import { Modal } from './Modal';
import { Button } from './Button';

interface ConfirmDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'danger' | 'primary';
  loading?: boolean;
}

export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  open,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Подтвердить',
  cancelText = 'Отмена',
  variant = 'danger',
  loading = false,
}) => (
  <Modal open={open} onClose={onClose} title={title} maxWidth="max-w-md">
    <p className="text-sm text-gray-600 mb-6">{message}</p>
    <div className="flex justify-end gap-3">
      <Button variant="secondary" onClick={onClose}>
        {cancelText}
      </Button>
      <Button variant={variant} onClick={onConfirm} loading={loading}>
        {confirmText}
      </Button>
    </div>
  </Modal>
);
