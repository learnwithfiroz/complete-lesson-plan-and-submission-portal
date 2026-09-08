import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Form, Button, Card, Alert, Row, Col, Badge } from 'react-bootstrap';
import { Lock, Mail, ShieldCheck, Eye, EyeOff, Key, Copy, Check } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { useTranslation } from '../../locales/i18n';
import { toast } from 'react-toastify';

const loginSchema = z.object({
  email: z.string().min(1, 'অনুগ্রহ করে ইমেইল বা মোবাইল নম্বর দিন / Please enter Email or Mobile Number'),
  password: z.string().min(1, 'পাসওয়ার্ড প্রদান করুন / Password is required'),
  remember: z.boolean().optional(),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export const Login: React.FC = () => {
  const { loginMutation } = useAuth();
  const { t, language, setLanguage } = useTranslation();
  const [showPassword, setShowPassword] = useState(false);
  const [copied, setCopied] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: 'admin@bsisc.edu.bd',
      password: 'Password123!',
      remember: true,
    },
  });

  const onSubmit = (data: LoginFormValues) => {
    loginMutation.mutate(data);
  };

  const handleQuickLogin = (loginId: string, pass: string = 'Password123!') => {
    setValue('email', loginId);
    setValue('password', pass);
    loginMutation.mutate({
      email: loginId,
      password: pass,
      remember: true,
    });
  };

  const copyPassword = () => {
    navigator.clipboard.writeText('Password123!');
    setCopied(true);
    toast.info('Password copied: Password123!');
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="auth-page-wrapper">
      <div className="container py-4">
        
        <div className="d-flex justify-content-end mb-3">
          <Button
            variant="outline-light"
            size="sm"
            className="rounded-pill px-3 shadow-sm bg-white text-dark border-0 fw-semibold"
            onClick={() => setLanguage(language === 'bn' ? 'en' : 'bn')}
          >
            {language === 'bn' ? '🌐 English' : '🌐 বাংলা'}
          </Button>
        </div>

        <Row className="justify-content-center">
          <Col xs={12} sm={10} md={8} lg={6} xl={5}>
            
            <Card className="auth-card shadow-lg border-0 rounded-4 overflow-hidden">
              
              <div className="auth-header text-center p-4">
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

                  {/* Password Info Alert */}
                  <div className="p-2 mb-3 bg-light rounded border small">
                    <div className="d-flex align-items-center justify-content-between mb-1">
                      <div className="d-flex align-items-center gap-1.5 text-secondary">
                        <Key size={14} className="text-primary" />
                        <span>{language === 'bn' ? 'পাসওয়ার্ড নিয়ম:' : 'Password Rule:'} <strong>{language === 'bn' ? 'আপনার মোবাইল নম্বরই পাসওয়ার্ড' : 'Mobile Number is Password'}</strong></span>
                      </div>
                      <Button
                        variant="outline-primary"
                        size="sm"
                        className="py-0 px-2 fs-8"
                        onClick={copyPassword}
                      >
                        {copied ? <Check size={12} className="text-success me-1" /> : <Copy size={12} className="me-1" />}
                        Password123!
                      </Button>
                    </div>
                    <div className="text-muted fs-8">
                      {language === 'bn' 
                        ? 'সকল শিক্ষক ও স্টাফদের জন্য ইউজারনেম এবং পাসওয়ার্ড উভয়ই তাদের মোবাইল নম্বর।' 
                        : 'For all faculty & staff, both username and initial password are set to their registered Mobile Number.'}
                    </div>
                  </div>

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

                <div className="mt-4 pt-4 border-top">
                  <div className="d-flex align-items-center justify-content-between mb-2">
                    <p className="fs-8 fw-bold text-uppercase tracking-wider text-muted mb-0">
                      ⚡ {language === 'bn' ? '১-ক্লিক সরাসরি ডেমো লগইন' : '1-Click Quick Demo Sign-In'}
                    </p>
                    <Badge bg="success-subtle" text="success" className="border border-success-subtle fs-8">
                      {language === 'bn' ? 'সরাসরি প্রবেশ' : 'Instant Access'}
                    </Badge>
                  </div>
                  
                  <div className="d-grid gap-1.5">
                    <Button
                      variant="outline-primary"
                      size="sm"
                      className="text-start fs-8 py-2 d-flex align-items-center justify-content-between shadow-xs hover-shadow"
                      onClick={() => handleQuickLogin('admin@bsisc.edu.bd', 'Password123!')}
                      disabled={loginMutation.isPending}
                    >
                      <span className="fw-bold">🛡️ Super Admin</span>
                      <small className="text-muted font-monospace">admin@bsisc.edu.bd →</small>
                    </Button>

                    <Button
                      variant="outline-primary"
                      size="sm"
                      className="text-start fs-8 py-2 d-flex align-items-center justify-content-between shadow-xs hover-shadow"
                      onClick={() => handleQuickLogin('01711000002', '01711000002')}
                      disabled={loginMutation.isPending}
                    >
                      <span className="fw-bold">🎓 Principal (Brig Gen Akhter Shahid)</span>
                      <small className="text-muted font-monospace">01711000002 →</small>
                    </Button>

                    <Button
                      variant="outline-primary"
                      size="sm"
                      className="text-start fs-8 py-2 d-flex align-items-center justify-content-between shadow-xs hover-shadow"
                      onClick={() => handleQuickLogin('01780017602', '01780017602')}
                      disabled={loginMutation.isPending}
                    >
                      <span className="fw-bold">📋 VP (Sr. Div) - Masuma Mamataz</span>
                      <small className="text-muted font-monospace">01780017602 →</small>
                    </Button>

                    <Button
                      variant="outline-primary"
                      size="sm"
                      className="text-start fs-8 py-2 d-flex align-items-center justify-content-between shadow-xs hover-shadow"
                      onClick={() => handleQuickLogin('01720041189', '01720041189')}
                      disabled={loginMutation.isPending}
                    >
                      <span className="fw-bold">👨‍🏫 Senior Teacher - Aziza Taher</span>
                      <small className="text-muted font-monospace">01720041189 →</small>
                    </Button>

                    <Button
                      variant="outline-primary"
                      size="sm"
                      className="text-start fs-8 py-2 d-flex align-items-center justify-content-between shadow-xs hover-shadow"
                      onClick={() => handleQuickLogin('01670250173', '01670250173')}
                      disabled={loginMutation.isPending}
                    >
                      <span className="fw-bold">👩‍🏫 Senior Teacher - Zebin Akter</span>
                      <small className="text-muted font-monospace">01670250173 →</small>
                    </Button>
                  </div>
                </div>

              </Card.Body>
            </Card>

            <div className="text-center mt-3 text-white-50 fs-8 d-flex align-items-center justify-content-center gap-1">
              <ShieldCheck size={14} />
              <span>Official Campus E-Portal | 256-Bit SSL Encrypted System</span>
            </div>

          </Col>
        </Row>
      </div>
    </div>
  );
};