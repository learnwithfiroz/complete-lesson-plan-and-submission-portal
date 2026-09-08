import React from 'react';
import { Spinner } from 'react-bootstrap';

export const LoadingSpinner: React.FC<{ message?: string; size?: 'sm' | 'md' | 'lg' }> = ({
  message = 'Loading...',
  size = 'md',
}) => {
  return (
    <div className="d-flex flex-column align-items-center justify-content-center p-5">
      <Spinner
        animation="border"
        variant="primary"
        style={{ width: size === 'lg' ? '3rem' : size === 'sm' ? '1.5rem' : '2rem', height: size === 'lg' ? '3rem' : size === 'sm' ? '1.5rem' : '2rem' }}
      />
      {message && <p className="mt-3 text-muted fw-medium fs-6">{message}</p>}
    </div>
  );
};