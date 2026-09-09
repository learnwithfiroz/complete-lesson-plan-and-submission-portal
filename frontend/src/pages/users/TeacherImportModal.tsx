import React, { useState, useRef } from 'react';
import { Modal, Button, Alert, ProgressBar } from 'react-bootstrap';
import { Upload, Download, FileText, CheckCircle, AlertTriangle, X } from 'lucide-react';
import { usersApi } from '../../api/users';
import { toast } from 'react-toastify';

interface TeacherImportModalProps {
  show: boolean;
  onHide: () => void;
  onSuccess: () => void;
}

export const TeacherImportModal: React.FC<TeacherImportModalProps> = ({ show, onHide, onSuccess }) => {
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isDownloadingSample, setIsDownloadingSample] = useState(false);
  const [result, setResult] = useState<{
    imported_count: number;
    updated_count: number;
    errors: string[];
  } | null>(null);

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
      setResult(null);
    }
  };

  const handleDownloadSample = async () => {
    try {
      setIsDownloadingSample(true);
      await usersApi.downloadImportTemplate();
      toast.success('নমুনা CSV টেমপ্লেট ডাউনলোড হয়েছে');
    } catch (err: any) {
      toast.error('টেমপ্লেট ডাউনলোড করতে সমস্যা হয়েছে');
    } finally {
      setIsDownloadingSample(false);
    }
  };

  const handleUpload = async () => {
    if (!file) {
      toast.warning('অনুগ্রহ করে একটি CSV বা Excel ফাইল নির্বাচন করুন');
      return;
    }

    try {
      setIsUploading(true);
      setResult(null);
      const res = await usersApi.importTeachers(file);
      if (res.success) {
        setResult(res.data);
        toast.success(res.message || 'শিক্ষক ও স্টাফ তালিকা সফলভাবে ইমপোর্ট হয়েছে!');
        onSuccess();
      } else {
        toast.error(res.message || 'ইমপোর্ট সম্পন্ন করা সম্ভব হয়নি');
      }
    } catch (err: any) {
      const errorMsg = err.response?.data?.message || 'ফাইল প্রসেস করতে ত্রুটি ঘটেছে। ফাইলের ফরম্যাট চেক করুন।';
      toast.error(errorMsg);
    } finally {
      setIsUploading(false);
    }
  };

  const handleClose = () => {
    setFile(null);
    setResult(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
    onHide();
  };

  return (
    <Modal show={show} onHide={handleClose} size="lg" centered>
      <Modal.Header closeButton className="border-bottom">
        <Modal.Title className="fs-6 fw-bold d-flex align-items-center gap-2">
          <Upload size={20} className="text-primary" />
          <span>শিক্ষক ও কর্মী বাল্ক ইমপোর্ট (Bulk Import Teachers & Staff)</span>
        </Modal.Title>
      </Modal.Header>

      <Modal.Body className="p-4">
        {/* Sample Template & Format Guide Card */}
        <div className="bg-light border rounded-3 p-3 mb-3">
          <div className="d-flex flex-column flex-sm-row align-items-sm-center justify-content-between gap-2 mb-2">
            <div>
              <h6 className="fw-bold text-dark mb-0 fs-7">📄 নমুনা CSV টেমপ্লেট ব্যবহার করুন</h6>
              <small className="text-muted fs-8">
                নির্ধারিত ফরম্যাটে ডাটা সাজিয়ে এক্সেল বা CSV ফাইল আপলোড করুন।
              </small>
            </div>
            <Button
              variant="outline-primary"
              size="sm"
              className="d-flex align-items-center gap-1.5 fw-semibold text-nowrap rounded-2"
              onClick={handleDownloadSample}
              disabled={isDownloadingSample}
            >
              <Download size={14} />
              <span>{isDownloadingSample ? 'ডাউনলোড হচ্ছে...' : 'নমুনা টেমপ্লেট ডাউনলোড'}</span>
            </Button>
          </div>

          <div className="fs-8 text-secondary mt-2">
            <span className="fw-bold text-dark">কলাম হেডারসমূহ:</span>{' '}
            <code className="bg-white px-1.5 py-0.5 rounded border text-primary font-monospace">
              SL, Employee_ID, Name, Salutation, Gender, Designation, Department, Phone, Email, Role
            </code>
          </div>
          <ul className="fs-8 text-muted mb-0 mt-2 ps-3">
            <li>শিক্ষকের মোবাইল নম্বরটি স্বয়ংক্রিয়ভাবে তার <strong>প্রাথমিক লগইন পাসওয়ার্ড</strong> হিসেবে সেট হবে।</li>
            <li>পূর্বের কোনো শিক্ষকের ফোন/আইডি মিলে গেলে তার তথ্য <strong>আপডেট</strong> হবে, নতুন শিক্ষক <strong>যোগ</strong> হবে।</li>
          </ul>
        </div>

        {/* File Drop / Select Area */}
        <div
          className={`border-2 border-dashed rounded-3 p-4 text-center ${
            file ? 'bg-primary-subtle border-primary' : 'border-secondary-subtle bg-white'
          }`}
          style={{ cursor: 'pointer' }}
          onClick={() => fileInputRef.current?.click()}
        >
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept=".csv, .txt, .tsv, .xlsx"
            className="d-none"
          />
          {file ? (
            <div className="d-flex flex-column align-items-center">
              <FileText size={38} className="text-primary mb-2" />
              <div className="fw-bold text-dark fs-7">{file.name}</div>
              <small className="text-muted">{(file.size / 1024).toFixed(1)} KB</small>
              <Button
                variant="link"
                size="sm"
                className="text-danger p-0 mt-2 text-decoration-none fs-8"
                onClick={(e) => {
                  e.stopPropagation();
                  setFile(null);
                  if (fileInputRef.current) fileInputRef.current.value = '';
                }}
              >
                <X size={14} className="me-1" />
                ফাইল সরান
              </Button>
            </div>
          ) : (
            <div className="d-flex flex-column align-items-center py-2">
              <Upload size={36} className="text-muted mb-2" />
              <div className="fw-bold text-dark fs-7">এখানে ক্লিক করে CSV ফাইল নির্বাচন করুন</div>
              <small className="text-muted mt-1">সমর্থিত ফরম্যাট: .csv, .tsv, .txt (UTF-8)</small>
            </div>
          )}
        </div>

        {isUploading && (
          <div className="mt-3">
            <small className="text-muted d-block mb-1">ফাইল প্রসেসিং চলছে, অনুগ্রহ করে অপেক্ষা করুন...</small>
            <ProgressBar animated now={100} variant="primary" style={{ height: '6px' }} />
          </div>
        )}

        {/* Results summary */}
        {result && (
          <div className="mt-3">
            <Alert variant="success" className="d-flex align-items-center gap-2 mb-2 py-2">
              <CheckCircle size={18} className="text-success flex-shrink-0" />
              <div className="fs-7">
                <strong>{result.imported_count}</strong> জন নতুন যোগ করা হয়েছে এবং <strong>{result.updated_count}</strong> জন প্রোফাইল আপডেট করা হয়েছে।
              </div>
            </Alert>

            {result.errors && result.errors.length > 0 && (
              <Alert variant="warning" className="py-2 mb-0">
                <div className="d-flex align-items-center gap-1.5 fw-bold fs-8 mb-1">
                  <AlertTriangle size={15} />
                  <span>কিছু সারিতে সতর্কতা রয়েছে ({result.errors.length} টি):</span>
                </div>
                <div style={{ maxHeight: '120px', overflowY: 'auto' }} className="fs-8">
                  <ul className="mb-0 ps-3">
                    {result.errors.map((err, i) => (
                      <li key={i}>{err}</li>
                    ))}
                  </ul>
                </div>
              </Alert>
            )}
          </div>
        )}
      </Modal.Body>

      <Modal.Footer className="border-top">
        <Button variant="secondary" size="sm" onClick={handleClose} disabled={isUploading}>
          বন্ধ করুন
        </Button>
        <Button
          variant="primary"
          size="sm"
          className="d-flex align-items-center gap-2 fw-bold px-3"
          onClick={handleUpload}
          disabled={!file || isUploading}
        >
          <Upload size={15} />
          <span>{isUploading ? 'ইমপোর্ট হচ্ছে...' : 'ইমপোর্ট শুরু করুন'}</span>
        </Button>
      </Modal.Footer>
    </Modal>
  );
};
