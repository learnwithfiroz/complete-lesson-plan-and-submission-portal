import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Form, Button, Card, Alert, Row, Col } from 'react-bootstrap';
import { Lock, Mail, ShieldCheck, Eye, EyeOff, Smartphone } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useTranslation } from '../../locales/i18n';
import { usePwaInstall } from '../../hooks/usePwaInstall';
import { PwaInstallModal } from '../../components/common/PwaInstallModal';
import { LiveSystemBadge } from '../../components/common/LiveSystemBadge';

const loginSchema = z.object({
  email: z.string().min(1, 'অনুগ্রহ করে ইমেইল বা মোবাইল নম্বর দিন / Please enter Email or Mobile Number'),
  password: z.string().min(1, 'পাসওয়ার্ড প্রদান করুন / Password is required'),
  remember: z.boolean().optional(),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export const Login: React.FC = () => {
  const { loginMutation } = useAuth();
  const { t, language, setLanguage } = useTranslation();
  const { openInstallModal, isModalOpen, closeInstallModal, isInstalled } = usePwaInstall();
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
      remember: true,
    },
  });

  const onSubmit = (data: LoginFormValues) => {
    loginMutation.mutate(data);
  };

  return (
    <div className="auth-page-wrapper">
      <div className="container py-4">
        
        <div className="d-flex justify-content-end mb-3">
          <Button
            variant="outline-light"
            size="sm"
            className="rounded-pill px-3 py-1.5 shadow-sm bg-white text-dark border-0 fw-semibold d-flex align-items-center justify-content-center"
            onClick={() => setLanguage(language === 'bn' ? 'en' : 'bn')}
          >
            {language === 'bn' ? '🌐 English' : '🌐 বাংলা'}
          </Button>
        </div>

        <Row className="justify-content-center">
          <Col xs={12} sm={10} md={8} lg={6} xl={5}>
            
            <Card className="auth-card shadow-lg border-0 rounded-4 overflow-hidden">
              
              <div className="auth-header text-center p-4">
                {/* Live BD Time & IP Address Badge directly ABOVE the Logo */}
                <LiveSystemBadge variant="above-logo" className="mb-3" />

                <img
                  src="/logo.png"
                  alt="BSISC Official Logo"
                  className="auth-logo mb-2 bg-white rounded-circle p-1 shadow-sm"
                  style={{ width: 75, height: 75, objectFit: 'contain' }}
                />
                <h2 className="fs-5 fw-bold text-white mb-1">
                  Baridhara Scholars' International School and College (BSISC)
                </h2>
                <p className="fs-7 text-white-50 mb-2">
                  DOHS, Baridhara, Dhaka Cantonment, Dhaka
                </p>
                <div className="d-flex justify-content-center gap-2 small mb-0">
                  <span className="badge bg-light text-primary fw-bold">EIIN: 133988</span>
                  <span className="badge bg-light text-primary fw-bold">School: 1242</span>
                  <span className="badge bg-light text-primary fw-bold">College: 1760</span>
                </div>
              </div>

              <Card.Body className="p-4 p-md-5">
                <div className="text-center mb-4">
                  <h3 className="fs-5 fw-bold text-dark mb-1">{t('auth.login_title')}</h3>
                  <p className="text-muted fs-7 mb-0">{t('auth.login_subtitle')}</p>
                </div>

                {loginMutation.isError && (
                  <Alert variant="danger" className="py-2 fs-7 mb-3">
                    {(loginMutation.error as any)?.response?.data?.message || 'Login failed. Please check credentials.'}
                  </Alert>
                )}

                <Form onSubmit={handleSubmit(onSubmit)} noValidate>
                  
                  <Form.Group className="mb-3" controlId="email">
                    <Form.Label className="fw-semibold fs-7 text-secondary">
                      {language === 'bn' ? 'ইমেইল অথবা মোবাইল নম্বর' : 'Email or Mobile Number'}
                    </Form.Label>
                    <div className="input-group">
                      <span className="input-group-text bg-light border-end-0 text-muted">
                        <Mail size={17} />
                      </span>
                      <Form.Control
                        type="text"
                        placeholder={language === 'bn' ? 'যেমন: 01780017602 অথবা 01720041189' : 'e.g. 01780017602 or 01720041189 or admin@bsisc.edu.bd'}
                        className={`border-start-0 fs-7 ${errors.email ? 'is-invalid' : ''}`}
                        {...register('email')}
                      />
                      {errors.email && (
                        <Form.Control.Feedback type="invalid" className="d-block">
                          {errors.email.message}
                        </Form.Control.Feedback>
                      )}
                    </div>
                  </Form.Group>

                  <Form.Group className="mb-3" controlId="password">
                    <div className="d-flex justify-content-between align-items-center mb-1">
                      <Form.Label className="fw-semibold fs-7 text-secondary mb-0">
                        {t('auth.password')}
                      </Form.Label>
                      <Link to="/forgot-password" className="fs-8 text-primary text-decoration-none fw-medium">
                        {t('auth.forgot_password')}
                      </Link>
                    </div>
                    <div className="input-group">
                      <span className="input-group-text bg-light border-end-0 text-muted">
                        <Lock size={17} />
                      </span>
                      <Form.Control
                        type={showPassword ? 'text' : 'password'}
                        placeholder={language === 'bn' ? 'পাসওয়ার্ড (মোবাইল নম্বর)' : 'Password (Your Mobile Number)'}
                        className={`border-start-0 border-end-0 fs-7 ${errors.password ? 'is-invalid' : ''}`}
                        {...register('password')}
                      />
                      <Button
                        variant="outline-light"
                        type="button"
                        className="border bg-light text-muted px-2.5 d-flex align-items-center"
                        onClick={() => setShowPassword(!showPassword)}
                        title={showPassword ? 'Hide Password' : 'Show Password'}
                      >
                        {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                      </Button>
                      {errors.password && (
                        <Form.Control.Feedback type="invalid" className="d-block">
                          {errors.password.message}
                        </Form.Control.Feedback>
                      )}
                    </div>
                  </Form.Group>

                  <Form.Group className="mb-4 d-flex align-items-center" controlId="remember">
                    <Form.Check
                      type="checkbox"
                      id="remember"
                      label={<span className="fs-7 text-muted">{t('auth.remember_me')}</span>}
                      {...register('remember')}
                    />
                  </Form.Group>

                  <Button
                    variant="primary"
                    type="submit"
                    className="w-100 py-2.5 rounded-3 fw-bold btn-institutional shadow-sm"
                    disabled={loginMutation.isPending}
                  >
                    {loginMutation.isPending ? t('auth.signing_in') : t('auth.sign_in')}
                  </Button>
                </Form>

                {/* Mobile App Install Card on Login */}
                {!isInstalled && (
                  <div className="mt-4 pt-3 border-top text-center">
                    <Button
                      variant="outline-primary"
                      size="sm"
                      className="w-100 py-2 rounded-3 fw-bold d-flex align-items-center justify-content-center gap-2"
                      onClick={openInstallModal}
                    >
                      <Smartphone size={16} className="text-primary" />
                      <span>{language === 'bn' ? '📲 মোবাইলে অ্যাপ ইনস্টল করুন (Install App)' : '📲 Install Mobile App on Android'}</span>
                    </Button>
                  </div>
                )}

              </Card.Body>
            </Card>

            <div className="text-center mt-3 text-white-50 fs-8 d-flex flex-column align-items-center gap-1">
              <div className="d-flex align-items-center gap-1">
                <ShieldCheck size={14} />
                <span>Official Campus E-Portal | 256-Bit SSL Encrypted System</span>
              </div>
            </div>

          </Col>
        </Row>
      </div>

      <PwaInstallModal show={isModalOpen} onHide={closeInstallModal} />
    </div>
  );
};