import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Form, Button, Card, Alert, Row, Col } from 'react-bootstrap';
import { Mail, ArrowLeft, KeyRound } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { authApi } from '../../api/auth';
import { useTranslation } from '../../locales/i18n';
import { toast } from 'react-toastify';

const schema = z.object({
  email: z.string().email('অনুগ্রহ করে সঠিক ইমেইল প্রদান করুন'),
});

type FormValues = z.infer<typeof schema>;

export const ForgotPassword: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [resetData, setResetData] = useState<{ token: string; email: string } | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { email: 'teacher1@bsisc.edu.bd' },
  });

  const onSubmit = async (data: FormValues) => {
    try {
      setLoading(true);
      const res = await authApi.forgotPassword(data.email);
      toast.success(res.message || 'Password reset token generated.');
      if (res.data.reset_token) {
        setResetData({ token: res.data.reset_token, email: res.data.email });
      }
    } catch (e: any) {
      toast.error(e.response?.data?.message || 'Could not process request.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page-wrapper">
      <div className="container py-5">
        <Row className="justify-content-center">
          <Col xs={12} sm={10} md={8} lg={6} xl={5}>
            <Card className="auth-card shadow-lg border-0 rounded-4 overflow-hidden">
              <div className="auth-header text-center p-4">
                <img src="/logo.svg" alt="Institution Logo" className="auth-logo mb-2" />
                <h2 className="fs-5 fw-bold text-white mb-0">{t('auth.reset_password_title')}</h2>
              </div>

              <Card.Body className="p-4 p-md-5">
                {resetData ? (
                  <div>
                    <Alert variant="success" className="fs-7">
                      <p className="fw-bold mb-1">রিসেট টোকেন তৈরি হয়েছে / Reset Token Generated:</p>
                      <code className="text-break d-block bg-white p-2 rounded mb-2 border">
                        {resetData.token}
                      </code>
                    </Alert>
                    <Button
                      variant="primary"
                      className="w-100 py-2.5 rounded-3 fw-bold"
                      onClick={() => navigate(`/reset-password?token=${resetData.token}&email=${encodeURIComponent(resetData.email)}`)}
                    >
                      <KeyRound size={16} className="me-2 inline" />
                      নতুন পাসওয়ার্ড সেট করুন (Proceed to Reset)
                    </Button>
                  </div>
                ) : (
                  <Form onSubmit={handleSubmit(onSubmit)} noValidate>
                    <p className="text-muted fs-7 mb-4 text-center">
                      {t('auth.reset_password_subtitle')}
                    </p>

                    <Form.Group className="mb-4" controlId="email">
                      <Form.Label className="fw-semibold fs-7 text-secondary">
                        {t('auth.email')}
                      </Form.Label>
                      <div className="input-group">
                        <span className="input-group-text bg-light text-muted">
                          <Mail size={17} />
                        </span>
                        <Form.Control
                          type="email"
                          placeholder={t('auth.email_placeholder')}
                          className={`fs-7 ${errors.email ? 'is-invalid' : ''}`}
                          {...register('email')}
                        />
                        {errors.email && (
                          <Form.Control.Feedback type="invalid" className="d-block">
                            {errors.email.message}
                          </Form.Control.Feedback>
                        )}
                      </div>
                    </Form.Group>

                    <Button
                      variant="primary"
                      type="submit"
                      className="w-100 py-2.5 rounded-3 fw-bold btn-institutional"
                      disabled={loading}
                    >
                      {loading ? t('common.loading') : t('auth.send_reset_link')}
                    </Button>

                    <div className="text-center mt-4">
                      <Link to="/login" className="fs-7 text-decoration-none fw-semibold text-primary d-inline-flex align-items-center gap-1">
                        <ArrowLeft size={16} />
                        <span>{t('auth.back_to_login')}</span>
                      </Link>
                    </div>
                  </Form>
                )}
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </div>
    </div>
  );
};