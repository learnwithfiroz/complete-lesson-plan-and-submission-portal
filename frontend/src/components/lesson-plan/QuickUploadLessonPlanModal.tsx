import React, { useState } from 'react';
import { Modal, Form, Button, Row, Col, Alert } from 'react-bootstrap';
import { UploadCloud, CheckCircle2, AlertCircle } from 'lucide-react';
import { useTranslation } from '../../locales/i18n';
import { lessonPlansApi } from '../../api/lessonPlans';
import type { AcademicYear, SchoolClass, Subject } from '../../types/academic';
import { toast } from 'react-toastify';

interface Props {
  show: boolean;
  onHide: () => void;
  onSuccess: (newPlanId: number) => void;
  academicYears: AcademicYear[];
  classes: SchoolClass[];
  subjects: Subject[];
}

export const QuickUploadLessonPlanModal: React.FC<Props> = ({
  show,
  onHide,
  onSuccess,
  academicYears,
  classes,
  subjects,
}) => {
  const { t, language } = useTranslation();

  const [yearId, setYearId] = useState<number | ''>(academicYears.find((y) => y.is_current)?.id || (academicYears[0]?.id ?? ''));
  const [termId, setTermId] = useState<number | ''>('');
  const [classId, setClassId] = useState<number | ''>('');
  const [sectionId, setSectionId] = useState<number | ''>('');
  const [subjectId, setSubjectId] = useState<number | ''>('');
  const [chapterId, setChapterId] = useState<number | ''>('');

  const [title, setTitle] = useState('');
  const [topic, setTopic] = useState('');
  const [lessonDate, setLessonDate] = useState(new Date().toISOString().split('T')[0]);
  const [periodNumber, setPeriodNumber] = useState(1);
  const [durationMinutes, setDurationMinutes] = useState(45);
  const [additionalNotes, setAdditionalNotes] = useState('');
  const [submitNow, setSubmitNow] = useState(true);

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const currentYearObj = academicYears.find((y) => y.id === Number(yearId));
  const availableTerms = currentYearObj?.terms || [];

  const selectedClassObj = classes.find((c) => c.id === Number(classId));
  const availableSections = selectedClassObj?.sections || [];

  const selectedSubjectObj = subjects.find((s) => s.id === Number(subjectId));
  const availableChapters = selectedSubjectObj?.chapters || [];

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.size > 20 * 1024 * 1024) {
        setError('File size exceeds maximum allowed 20MB.');
        setSelectedFile(null);
        return;
      }
      setSelectedFile(file);
      setError(null);
      if (!title) {
        const cleanTitle = file.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ');
        setTitle(cleanTitle);
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!yearId || !termId || !classId || !sectionId || !subjectId || !title || !lessonDate) {
      setError('Please fill in all required academic details (*).');
      return;
    }

    if (!selectedFile) {
      setError('Please select a lesson plan document / file to upload (PDF, DOCX, etc.).');
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      // 1. Create base lesson plan
      const payload: any = {
        academic_year_id: yearId,
        term_id: termId,
        class_id: classId,
        section_id: sectionId,
        subject_id: subjectId,
        chapter_id: chapterId || null,
        title: title.trim(),
        topic: topic.trim() || title.trim(),
        lesson_date: lessonDate,
        period_number: periodNumber,
        duration_minutes: durationMinutes,
        student_count: 40,
        teaching_method: 'Uploaded Document Curriculum Plan',
        teaching_materials: selectedFile.name,
        reference_book: 'Prescribed Curriculum Textbook',
        additional_notes: additionalNotes,
        submit_now: submitNow,
        outcomes: [
          { outcome_text: `Cover lesson objectives detailed in ${selectedFile.name}`, sort_order: 1 },
        ],
        activities: [
          {
            stage: 'presentation',
            duration_minutes: durationMinutes,
            teacher_activities: 'Instruction and curriculum presentation per uploaded lesson plan sheet',
            student_activities: 'Active participation and note taking per plan',
            sort_order: 1,
          },
        ],
      };

      const res = await lessonPlansApi.createLessonPlan(payload);
      const planId = res.data.id;

      // 2. Upload file attachment
      await lessonPlansApi.uploadAttachment(planId, selectedFile);

      toast.success(
        submitNow
          ? 'পাঠ পরিকল্পনা ফাইল সফলভাবে আপলোড এবং পর্যালোচনার জন্য জমা দেওয়া হয়েছে!'
          : 'পাঠ পরিকল্পনা ফাইল সফলভাবে ড্রাফট হিসেবে সংরক্ষিত হয়েছে!'
      );

      onSuccess(planId);
      onHide();
    } catch (err: any) {
      console.error(err);
      setError(err.response?.data?.message || 'Failed to upload lesson plan document.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal show={show} onHide={onHide} size="lg" centered backdrop="static">
      <Modal.Header closeButton className="bg-primary text-white">
        <Modal.Title className="fs-5 fw-bold d-flex align-items-center">
          <UploadCloud className="me-2" size={22} />
          {t('lesson_plans.quick_upload', 'পাঠ পরিকল্পনা ডকুমেন্ট দ্রুত আপলোড (Quick Upload Plan)')}
        </Modal.Title>
      </Modal.Header>

      <Form onSubmit={handleSubmit}>
        <Modal.Body className="p-4">
          {error && (
            <Alert variant="danger" className="d-flex align-items-center mb-3">
              <AlertCircle size={18} className="me-2 flex-shrink-0" />
              <div>{error}</div>
            </Alert>
          )}

          {/* Upload Dropzone Box */}
          <div
            className={`p-4 text-center rounded border-2 border-dashed mb-4 ${
              selectedFile ? 'bg-light border-success' : 'bg-light border-primary'
            }`}
          >
            {selectedFile ? (
              <div className="py-2">
                <CheckCircle2 size={42} className="text-success mb-2" />
                <h6 className="fw-bold text-dark mb-1">{selectedFile.name}</h6>
                <div className="text-muted small mb-2">
                  {(selectedFile.size / 1024 / 1024).toFixed(2)} MB • {selectedFile.type || 'Document'}
                </div>
                <Button
                  size="sm"
                  variant="outline-secondary"
                  onClick={() => setSelectedFile(null)}
                  disabled={submitting}
                >
                  অন্য ফাইল বাছাই করুন (Change File)
                </Button>
              </div>
            ) : (
              <div>
                <UploadCloud size={46} className="text-primary opacity-75 mb-2" />
                <h6 className="fw-bold mb-1">পাঠ পরিকল্পনা ফাইল ড্রপ করুন বা সিলেক্ট করুন</h6>
                <p className="text-muted small mb-3">
                  সমর্থিত ফরম্যাট: <strong>PDF, Word (.docx/.doc), Excel (.xlsx), PPT, Image/Scan</strong> (সর্বোচ্চ ২০ MB)
                </p>
                <Form.Label htmlFor="lp-file-input" className="btn btn-primary btn-sm px-4 mb-0 cursor-pointer">
                  ফাইল পছন্দ করুন (Browse File)
                </Form.Label>
                <input
                  id="lp-file-input"
                  type="file"
                  className="d-none"
                  accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.jpg,.jpeg,.png"
                  onChange={handleFileChange}
                />
              </div>
            )}
          </div>

          <h6 className="fw-bold text-primary border-bottom pb-2 mb-3">
            একাডেমিক ও পাঠ সংক্রান্ত তথ্য (Academic Metadata)
          </h6>

          <Row className="g-3">
            {/* Year & Term */}
            <Col md={6}>
              <Form.Group>
                <Form.Label className="fw-semibold small">{t('academic_years.year_name')} *</Form.Label>
                <Form.Select
                  size="sm"
                  value={yearId}
                  onChange={(e) => {
                    setYearId(Number(e.target.value) || '');
                    setTermId('');
                  }}
                  required
                >
                  <option value="">-- শিক্ষাবর্ষ নির্বাচন করুন --</option>
                  {academicYears.map((y) => (
                    <option key={y.id} value={y.id}>
                      {y.name} {y.is_current ? '(Current)' : ''}
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>
            </Col>

            <Col md={6}>
              <Form.Group>
                <Form.Label className="fw-semibold small">{t('academic_years.term_name')} *</Form.Label>
                <Form.Select
                  size="sm"
                  value={termId}
                  onChange={(e) => setTermId(Number(e.target.value) || '')}
                  required
                >
                  <option value="">-- টার্ম নির্বাচন করুন --</option>
                  {availableTerms.map((tm) => (
                    <option key={tm.id} value={tm.id}>
                      {language === 'bn' ? tm.name_bn : tm.name_en}
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>
            </Col>

            {/* Class & Section */}
            <Col md={6}>
              <Form.Group>
                <Form.Label className="fw-semibold small">{t('classes_sections.class_name')} *</Form.Label>
                <Form.Select
                  size="sm"
                  value={classId}
                  onChange={(e) => {
                    setClassId(Number(e.target.value) || '');
                    setSectionId('');
                  }}
                  required
                >
                  <option value="">-- শ্রেণি নির্বাচন করুন --</option>
                  {classes.map((c) => (
                    <option key={c.id} value={c.id}>
                      {language === 'bn' ? c.name_bn : c.name_en}
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>
            </Col>

            <Col md={6}>
              <Form.Group>
                <Form.Label className="fw-semibold small">{t('classes_sections.section_name')} *</Form.Label>
                <Form.Select
                  size="sm"
                  value={sectionId}
                  onChange={(e) => setSectionId(Number(e.target.value) || '')}
                  required
                >
                  <option value="">-- শাখা নির্বাচন করুন --</option>
                  {availableSections.map((s) => (
                    <option key={s.id} value={s.id}>
                      {language === 'bn' ? s.name_bn : s.name_en}
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>
            </Col>

            {/* Subject & Chapter */}
            <Col md={6}>
              <Form.Group>
                <Form.Label className="fw-semibold small">{t('subjects_chapters.subject_name')} *</Form.Label>
                <Form.Select
                  size="sm"
                  value={subjectId}
                  onChange={(e) => {
                    setSubjectId(Number(e.target.value) || '');
                    setChapterId('');
                  }}
                  required
                >
                  <option value="">-- বিষয় নির্বাচন করুন --</option>
                  {subjects.map((s) => (
                    <option key={s.id} value={s.id}>
                      {language === 'bn' ? s.name_bn : s.name_en} ({s.code})
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>
            </Col>

            <Col md={6}>
              <Form.Group>
                <Form.Label className="fw-semibold small">{t('subjects_chapters.chapter_name')} (ঐচ্ছিক)</Form.Label>
                <Form.Select
                  size="sm"
                  value={chapterId}
                  onChange={(e) => setChapterId(Number(e.target.value) || '')}
                >
                  <option value="">-- অধ্যায় নির্বাচন করুন --</option>
                  {availableChapters.map((ch) => (
                    <option key={ch.id} value={ch.id}>
                      অধ্যায় {ch.chapter_no}: {language === 'bn' ? ch.title_bn : ch.title_en}
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>
            </Col>

            {/* Title & Topic */}
            <Col md={6}>
              <Form.Group>
                <Form.Label className="fw-semibold small">{t('lesson_plans.title')} *</Form.Label>
                <Form.Control
                  size="sm"
                  type="text"
                  placeholder="যেমন: বীজগণিতীয় সূত্রাবলি ও প্রয়োগ"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                />
              </Form.Group>
            </Col>

            <Col md={6}>
              <Form.Group>
                <Form.Label className="fw-semibold small">{t('lesson_plans.topic')}</Form.Label>
                <Form.Control
                  size="sm"
                  type="text"
                  placeholder="যেমন: সূত্রের সাহায্যে বর্গ নির্ণয়"
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                />
              </Form.Group>
            </Col>

            {/* Date, Period, Duration */}
            <Col md={4}>
              <Form.Group>
                <Form.Label className="fw-semibold small">{t('lesson_plans.lesson_date')} *</Form.Label>
                <Form.Control
                  size="sm"
                  type="date"
                  value={lessonDate}
                  onChange={(e) => setLessonDate(e.target.value)}
                  required
                />
              </Form.Group>
            </Col>

            <Col md={4}>
              <Form.Group>
                <Form.Label className="fw-semibold small">{t('lesson_plans.period')} (১-১০)</Form.Label>
                <Form.Control
                  size="sm"
                  type="number"
                  min={1}
                  max={10}
                  value={periodNumber}
                  onChange={(e) => setPeriodNumber(Number(e.target.value))}
                />
              </Form.Group>
            </Col>

            <Col md={4}>
              <Form.Group>
                <Form.Label className="fw-semibold small">{t('lesson_plans.duration')} (মিনিট)</Form.Label>
                <Form.Control
                  size="sm"
                  type="number"
                  min={15}
                  max={180}
                  value={durationMinutes}
                  onChange={(e) => setDurationMinutes(Number(e.target.value))}
                />
              </Form.Group>
            </Col>

            <Col md={12}>
              <Form.Group>
                <Form.Label className="fw-semibold small">অতিরিক্ত নোট / বিবরণ (ঐচ্ছিক)</Form.Label>
                <Form.Control
                  size="sm"
                  as="textarea"
                  rows={2}
                  placeholder="পাঠ পরিকল্পনা সম্পর্কিত যেকোনো নির্দেশনা বা নোট..."
                  value={additionalNotes}
                  onChange={(e) => setAdditionalNotes(e.target.value)}
                />
              </Form.Group>
            </Col>

            {/* Submission Mode Checkbox */}
            <Col md={12}>
              <div className="p-3 bg-light rounded border">
                <Form.Check
                  type="switch"
                  id="submit-now-switch"
                  label={
                    <div>
                      <strong>সরাসরি অনুমোদনের জন্য জমা দিন (Submit for Approval)</strong>
                      <div className="text-muted small">
                        সক্রিয় থাকলে আপলোডের সাথে সাথেই উপাধ্যক্ষ / কোঅর্ডিনেটরের কাছে পর্যালোচনার জন্য জমা হবে।
                      </div>
                    </div>
                  }
                  checked={submitNow}
                  onChange={(e) => setSubmitNow(e.target.checked)}
                />
              </div>
            </Col>
          </Row>
        </Modal.Body>

        <Modal.Footer className="bg-light">
          <Button variant="secondary" onClick={onHide} disabled={submitting}>
            বাতিল (Cancel)
          </Button>
          <Button variant="primary" type="submit" disabled={submitting || !selectedFile}>
            {submitting ? 'আপলোড হচ্ছে...' : submitNow ? 'আপলোড ও জমা দিন (Upload & Submit)' : 'ড্রাফট হিসেবে সেভ করুন (Save Draft)'}
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
};
