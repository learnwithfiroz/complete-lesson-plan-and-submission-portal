import React from 'react';
import { Pagination as BsPagination, Form } from 'react-bootstrap';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface PaginationProps {
  currentPage: number;
  lastPage: number;
  total: number;
  perPage: number;
  onPageChange: (page: number) => void;
  onPerPageChange?: (perPage: number) => void;
}

export const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  lastPage,
  total,
  perPage,
  onPageChange,
  onPerPageChange,
}) => {
  if (total === 0) return null;

  const startItem = (currentPage - 1) * perPage + 1;
  const endItem = Math.min(currentPage * perPage, total);

  return (
    <div className="d-flex flex-column flex-md-row align-items-center justify-content-between gap-3 py-3 px-2">
      <div className="d-flex align-items-center gap-2 text-muted fs-7">
        <span>
          সর্বমোট <strong>{total}</strong> টি তথ্যের মধ্যে <strong>{startItem}-{endItem}</strong> প্রদর্শিত হচ্ছে
        </span>
        {onPerPageChange && (
          <div className="d-flex align-items-center gap-1 ms-3">
            <span className="fs-8">প্রতি পৃষ্ঠায়:</span>
            <Form.Select
              size="sm"
              value={perPage}
              onChange={(e) => onPerPageChange(Number(e.target.value))}
              style={{ width: '85px', fontSize: '0.8rem' }}
            >
              <option value="15">15</option>
              <option value="25">25</option>
              <option value="50">50</option>
              <option value="100">100</option>
              <option value="250">সব (250)</option>
            </Form.Select>
          </div>
        )}
      </div>

      {lastPage > 1 && (
        <BsPagination className="mb-0 pagination-sm">
          <BsPagination.Prev
            disabled={currentPage === 1}
            onClick={() => onPageChange(currentPage - 1)}
          >
            <ChevronLeft size={16} />
          </BsPagination.Prev>

          {Array.from({ length: lastPage }, (_, i) => i + 1)
            .filter((p) => p === 1 || p === lastPage || Math.abs(p - currentPage) <= 2)
            .map((p, idx, arr) => {
              const showEllipsisBefore = idx > 0 && p - arr[idx - 1] > 1;
              return (
                <React.Fragment key={p}>
                  {showEllipsisBefore && <BsPagination.Ellipsis disabled />}
                  <BsPagination.Item
                    active={p === currentPage}
                    onClick={() => onPageChange(p)}
                  >
                    {p}
                  </BsPagination.Item>
                </React.Fragment>
              );
            })}

          <BsPagination.Next
            disabled={currentPage === lastPage}
            onClick={() => onPageChange(currentPage + 1)}
          >
            <ChevronRight size={16} />
          </BsPagination.Next>
        </BsPagination>
      )}
    </div>
  );
};