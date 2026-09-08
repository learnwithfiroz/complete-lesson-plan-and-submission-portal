import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Form, Button, Card, Row, Col } from 'react-bootstrap';
import { Lock, ArrowLeft } from 'lucide-react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { authApi } from '../../api/auth';
import { useTranslation } from '../../locales/i18n';
import { toast } from 'react-toastify';

const schema = z
  .object({
    token: z.string().min(1, 'Token is required'),
    email: z.string().email('Valid email is required'),
    password: z.string().min(8, 'পাসওয়ার্ড কমপক্ষে ৮ অক্ষরের হতে হবে / Minimum 8 characters'),
    password_confirmation: z.string().min(8, 'পাসওয়ার্ড নিশ্চিত করুন'),
  })
  .refine((data) => data.password === data.password_confirmation, {
    message: 'পাসওয়ার্ড দুটি মিলছে না / Passwords do not match',
    path: ['password_confirmation'],
  });

type FormValues = z.infer<typeof schema>;

export const ResetPassword: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      token: searchParams.get('token') || '',
      email: searchParams.get('email') || '',
      password: '',
      password_confirmation: '',
    },
  });

  const onSubmit = async (data: FormValues) => {
    try {
      setLoading(true);
      const res = await authApi.resetPassword(data);
      toast.success(res.message || 'Password reset successfully. Please login.');
      navigate('/login');
    } catch (e: any) {
      toast.error(e.response?.data?.message || 'Failed to reset password.');
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
                <h2 className="fs-5 fw-bold text-white mb-0">{t('auth.new_password')}</h2>
              </div>

              <Card.Body className="p-4 p-md-5">
                <Form onSubmit={handleSubmit(onSubmit)} noValidate>
                  <input type="hidden" {...register('token')} />
                  <input type="hidden" {...register('email')} />

                  <Form.Group className="mb-3" controlId="password">
                    <Form.Label className="fw-semibold fs-7 text-secondary">
                      {t('auth.new_password')}
                    </Form.Label>
                    <div className="input-group">
                      <span className="input-group-text bg-light text-muted">
                        <Lock size={17} />
                      </span>
                      <Form.Control
                        type="password"
                        placeholder="••••••••"
                        className={`fs-7 ${errors.password ? 'is-invalid' : ''}`}
                        {...register('password')}
                      />
                      {errors.password && (
                        <Form.Control.Feedback type="invalid" className="d-block">
                          {errors.password.message}
                        </Form.Control.Feedback>
                      )}
                    </div>
                  </Form.Group>

                  <Form.Group className="mb-4" controlId="password_confirmation">
                    <Form.Label className="fw-semibold fs-7 text-secondary">
                      {t('auth.confirm_password')}
                    </Form.Label>
                    <div className="input-group">
                      <span className="input-group-text bg-light text-muted">
                        <Lock size={17} />
                      </span>
                      <Form.Control
                        type="password"
                        placeholder="••••••••"
                        className={`fs-7 ${errors.password_confirmation ? 'is-invalid' : ''}`}
                        {...register('password_confirmation')}
                      />
                      {errors.password_confirmation && (
                        <Form.Control.Feedback type="invalid" className="d-block">
                          {errors.password_confirmation.message}
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
                    {loading ? t('common.loading') : t('auth.save_password')}
                  </Button>

                  <div className="text-center mt-4">
                    <Link to="/login" className="fs-7 text-decoration-none fw-semibold text-primary d-inline-flex align-items-center gap-1">
                      <ArrowLeft size={16} />
                      <span>{t('auth.back_to_login')}</span>
                    </Link>
                  </div>
                </Form>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </div>
    </div>
  );
};