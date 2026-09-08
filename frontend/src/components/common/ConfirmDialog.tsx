import React from 'react';
import { Modal, Button } from 'react-bootstrap';
import { AlertTriangle } from 'lucide-react';

interface ConfirmDialogProps {
  show: boolean;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  variant?: 'danger' | 'primary' | 'warning';
  isLoading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  show,
  title,
  message,
  confirmText = 'নিশ্চিত করুন',
  cancelText = 'বাতিল',
  variant = 'danger',
  isLoading = false,
  onConfirm,
  onCancel,
}) => {
  return (
    <Modal show={show} onHide={onCancel} centered backdrop="static">
      <Modal.Header closeButton className="border-0 pb-0">
        <Modal.Title className="fs-6 fw-bold d-flex align-items-center gap-2">
          {variant === 'danger' && <AlertTriangle size={20} className="text-danger" />}
          <span>{title}</span>
        </Modal.Title>
      </Modal.Header>
      <Modal.Body className="py-3 fs-7 text-secondary">
        {message}
      </Modal.Body>
      <Modal.Footer className="border-0 pt-0">
        <Button variant="light" size="sm" onClick={onCancel} disabled={isLoading}>
          {cancelText}
        </Button>
        <Button variant={variant} size="sm" onClick={onConfirm} disabled={isLoading}>
          {isLoading ? 'প্রক্রিয়াকরণ হচ্ছে...' : confirmText}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};