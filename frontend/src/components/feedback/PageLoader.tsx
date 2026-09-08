import React from 'react';
import { Spinner } from 'react-bootstrap';

export const PageLoader: React.FC = () => {
  return (
    <div 
      className="d-flex flex-column align-items-center justify-content-center w-100 py-5"
      style={{ minHeight: '45vh' }}
    >
      <div className="position-relative d-flex align-items-center justify-content-center mb-3">
        <Spinner 
          animation="border" 
          variant="primary" 
          style={{ width: '2.5rem', height: '2.5rem', borderWidth: '0.2rem' }} 
        />
      </div>
      <span className="text-muted fs-7 fw-medium">
        লোডিং হচ্ছে... / Loading...
      </span>
    </div>
  );
};
