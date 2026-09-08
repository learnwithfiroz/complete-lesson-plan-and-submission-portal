import React, { useState, useEffect } from 'react';
import { Form, InputGroup, Button } from 'react-bootstrap';
import { Search, X } from 'lucide-react';

interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  debounceMs?: number;
}

export const SearchInput: React.FC<SearchInputProps> = ({
  value,
  onChange,
  placeholder = 'অনুসন্ধান করুন...',
  debounceMs = 400,
}) => {
  const [innerValue, setInnerValue] = useState(value);

  useEffect(() => {
    setInnerValue(value);
  }, [value]);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (innerValue !== value) {
        onChange(innerValue);
      }
    }, debounceMs);

    return () => clearTimeout(timer);
  }, [innerValue, debounceMs, onChange, value]);

  const handleClear = () => {
    setInnerValue('');
    onChange('');
  };

  return (
    <InputGroup className="search-input-group shadow-sm">
      <InputGroup.Text className="bg-white border-end-0 text-muted">
        <Search size={16} />
      </InputGroup.Text>
      <Form.Control
        type="text"
        placeholder={placeholder}
        className="border-start-0 border-end-0 fs-7"
        value={innerValue}
        onChange={(e) => setInnerValue(e.target.value)}
      />
      {innerValue && (
        <Button
          variant="outline-secondary"
          className="border-start-0 bg-white text-muted"
          onClick={handleClear}
          aria-label="Clear search"
        >
          <X size={15} />
        </Button>
      )}
    </InputGroup>
  );
};