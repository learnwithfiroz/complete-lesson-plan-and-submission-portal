import React, { useState, useRef, useEffect } from 'react';
import { Card, Row, Col, Form, Button, Badge, Nav, Tab, Spinner, Table } from 'react-bootstrap';
import { 
  User as UserIcon, 
  Phone, 
  Briefcase, 
  KeyRound, 
  Camera, 
  Trash2, 
  Save, 
  Building2, 
  MapPin, 
  CreditCard, 
  Globe, 
  HeartHandshake,
  ShieldCheck,
  Clock,
  Laptop,
  Smartphone,
  Tablet,
  CheckCircle2
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useTranslation } from '../../locales/i18n';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { authApi } from '../../api/auth';
import type { UpdateProfilePayload } from '../../api/auth';
import type { LoginHistoryResponse } from '../../types/auth';
import { toast } from 'react-toastify';

const passwordSchema = z
  .object({
    current_password: z.string().min(1, 'বর্তমান পাসওয়ার্ড দিন'),
    password: z.string().min(8, 'নতুন পাসওয়ার্ড কমপক্ষে ৮ অক্ষরের হতে হবে'),
    password_confirmation: z.string().min(8, 'নতুন পাসওয়ার্ড নিশ্চিত করুন'),
  })
  .refine((data) => data.password === data.password_confirmation, {
    message: 'পাসওয়ার্ড দুটি মিলছে না',
    path: ['password_confirmation'],
  });

type PasswordFormValues = z.infer<typeof passwordSchema>;

const BD_DISTRICTS = [
  'Dhaka', 'Faridpur', 'Gazipur', 'Gopalganj', 'Kishoreganj', 'Madaripur', 'Manikganj', 'Munshiganj', 'Narayanganj', 'Narsingdi', 'Rajbari', 'Shariatpur', 'Tangail',
  'Chattogram', 'Bandarban', 'Brahmanbaria', 'Chandpur', 'Cumilla', "Cox's Bazar", 'Feni', 'Khagrachhari', 'Lakshmipur', 'Noakhali', 'Rangamati',
  'Rajshahi', 'Bogura', 'Joypurhat', 'Naogaon', 'Natore', 'Chapai Nawabganj', 'Pabna', 'Sirajganj',
  'Khulna', 'Bagerhat', 'Chuadanga', 'Jashore', 'Jhenaidah', 'Kushtia', 'Magura', 'Meherpur', 'Narail', 'Satkhira',
  'Barishal', 'Barguna', 'Bhola', 'Jhalokathi', 'Patuakhali', 'Pirojpur',
  'Sylhet', 'Habiganj', 'Moulvibazar', 'Sunamganj',
  'Rangpur', 'Dinajpur', 'Gaibandha', 'Kurigram', 'Lalmonirhat', 'Nilphamari', 'Panchagarh', 'Thakurgaon',
  'Mymensingh', 'Jamalpur', 'Netrokona', 'Sherpur'
];

export const Profile: React.FC = () => {
  const { user, setUser } = useAuth();
  const { t } = useTranslation();
  
  const [activeTab, setActiveTab] = useState<string>('basic');
  const [updatingProfile, setUpdatingProfile] = useState<boolean>(false);
  const [changingPassword, setChangingPassword] = useState<boolean>(false);
  const [uploadingAvatar, setUploadingAvatar] = useState<boolean>(false);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);

  // Login History State
  const [loginHistoryData, setLoginHistoryData] = useState<LoginHistoryResponse | null>(null);
  const [loadingHistory, setLoadingHistory] = useState<boolean>(false);
  const [historyPage, setHistoryPage] = useState<number>(1);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Profile Form
  const {
    register: registerProfile,
    handleSubmit: handleProfileSubmit,
    reset: resetProfile,
  } = useForm<UpdateProfilePayload>({
    defaultValues: {
      name: '',
      name_bn: '',
      salutation: 'Sir',
      gender: 'Male',
      religion: 'Islam',
      blood_group: '',
      date_of_birth: '',
      join_date: '',
      nid: '',
      nationality: 'Bangladeshi',
      father_name: '',
      mother_name: '',
      present_address: '',
      permanent_address: '',
      home_district: 'Dhaka',
      emergency_contact_name: '',
      emergency_contact_relation: '',
      emergency_contact_phone: '',
      appointment_subject: '',
      teaching_subject: '',
      school_hours: 'Teacher-BSI [08:05 - 14:30]',
      employee_type: 'Permanent',
      bio: '',
      facebook_url: '',
      bank_account_no: '',
      bank_name: '',
      email: '',
      phone: '',
      designation: '',
    },
  });

  // Password Form
  const {
    register: registerPassword,
    handleSubmit: handlePasswordSubmit,
    reset: resetPassword,
    formState: { errors: passwordErrors },
  } = useForm<PasswordFormValues>({
    resolver: zodResolver(passwordSchema),
  });

  // Populate Profile Form on Load / User change
  useEffect(() => {
    if (user) {
      resetProfile({
        name: user.name || '',
        name_bn: user.name_bn || '',
        salutation: user.salutation || 'Sir',
        gender: user.gender || 'Male',
        religion: user.religion || 'Islam',
        blood_group: user.blood_group || '',
        date_of_birth: user.date_of_birth ? user.date_of_birth.split('T')[0] : '',
        join_date: user.join_date ? user.join_date.split('T')[0] : '',
        nid: user.nid || '',
        nationality: user.nationality || 'Bangladeshi',
        father_name: user.father_name || '',
        mother_name: user.mother_name || '',
        present_address: user.present_address || '',
        permanent_address: user.permanent_address || '',
        home_district: user.home_district || 'Dhaka',
        emergency_contact_name: user.emergency_contact_name || '',
        emergency_contact_relation: user.emergency_contact_relation || '',
        emergency_contact_phone: user.emergency_contact_phone || '',
        appointment_subject: user.appointment_subject || '',
        teaching_subject: user.teaching_subject || '',
        school_hours: user.school_hours || 'Teacher-BSI [08:05 - 14:30]',
        employee_type: user.employee_type || 'Permanent',
        bio: user.bio || '',
        facebook_url: user.facebook_url || '',
        bank_account_no: user.bank_account_no || '',
        bank_name: user.bank_name || '',
        email: user.email || '',
        phone: user.phone || '',
        designation: user.designation || '',
      });
      setAvatarPreview(user.avatar || null);
    }
  }, [user, resetProfile]);

  // Load Login History when tab is active
  useEffect(() => {
    if (activeTab === 'history') {
      loadLoginHistory(historyPage);
    }
  }, [activeTab, historyPage]);

  const loadLoginHistory = async (page: number) => {
    try {
      setLoadingHistory(true);
      const res = await authApi.getLoginHistory(page, 15);
      if (res.success) {
        setLoginHistoryData(res);
      }
    } catch {
      // silent
    } finally {
      setLoadingHistory(false);
    }
  };

  const formatLoginBDTime = (dateStr?: string | null) => {
    if (!dateStr) return 'N/A';
    try {
      const d = new Date(dateStr);
      return d.toLocaleString('en-US', {
        timeZone: 'Asia/Dhaka',
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: true,
      });
    } catch {
      return dateStr;
    }
  };

  // Handle Avatar Selection & Upload
  const handleAvatarFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 4 * 1024 * 1024) {
      toast.error('ছবির সাইজ সর্বোচ্চ ৪ মেগাবাইট (4MB) হতে পারবে।');
      return;
    }

    // Local Preview
    const previewUrl = URL.createObjectURL(file);
    setAvatarPreview(previewUrl);

    // Upload to server
    const formData = new FormData();
    formData.append('avatar', file);

    try {
      setUploadingAvatar(true);
      const res = await authApi.updateAvatar(formData);
      setUser(res.data);
      setAvatarPreview(res.data.avatar || null);
      toast.success('প্রোফাইল ছবি সফলভাবে আপডেট হয়েছে!');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'ছবি আপলোড ব্যর্থ হয়েছে।');
      setAvatarPreview(user?.avatar || null);
    } finally {
      setUploadingAvatar(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  // Remove Avatar
  const handleRemoveAvatar = async () => {
    if (!window.confirm('আপনি কি প্রোফাইল ছবি মুছে ফেলতে চান?')) return;

    try {
      setUploadingAvatar(true);
      const res = await authApi.removeAvatar();
      setUser(res.data);
      setAvatarPreview(null);
      toast.info('প্রোফাইল ছবি মুছে ফেলা হয়েছে।');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'ছবি মোছা সম্ভব হয়নি।');
    } finally {
      setUploadingAvatar(false);
    }
  };

  // Profile Form Submission
  const onProfileSubmit = async (data: UpdateProfilePayload) => {
    try {
      setUpdatingProfile(true);
      const res = await authApi.updateProfile(data);
      setUser(res.data);
      toast.success(res.message || 'প্রোফাইল তথ্য সফলভাবে সংরক্ষণ করা হয়েছে!');
    } catch (e: any) {
      toast.error(e.response?.data?.message || 'তথ্য সংরক্ষণ ব্যর্থ হয়েছে।');
    } finally {
      setUpdatingProfile(false);
    }
  };

  // Password Form Submission
  const onPasswordSubmit = async (data: PasswordFormValues) => {
    try {
      setChangingPassword(true);
      const res = await authApi.changePassword(data);
      toast.success(res.message || 'পাসওয়ার্ড সফলভাবে পরিবর্তন করা হয়েছে!');
      resetPassword();
    } catch (e: any) {
      toast.error(e.response?.data?.message || 'পাসওয়ার্ড পরিবর্তন ব্যর্থ হয়েছে।');
    } finally {
      setChangingPassword(false);
    }
  };

  return (
    <div className="profile-container pb-5">
      {/* 1. TOP HERO / PROFILE IDENTITY CARD */}
      <Card className="border-0 shadow-sm rounded-4 overflow-hidden mb-4 bg-white">
        <div 
          style={{ 
            height: '110px', 
            background: 'linear-gradient(135deg, #1e3a8a 0%, #2563eb 50%, #38bdf8 100%)' 
          }}
          className="position-relative p-3"
        >
          <div className="text-white small opacity-75 d-flex align-items-center gap-2">
            <Building2 size={16} />
            <span>বারিধারা স্কলার্স ইন্টারন্যাশনাল স্কুল অ্যান্ড কলেজ (BSISC) | শিক্ষক ও কর্মকর্তা প্রোফাইল</span>
          </div>
        </div>

        <Card.Body className="pt-0 px-4 pb-4">
          <div className="d-flex flex-column flex-md-row align-items-center align-items-md-end gap-3" style={{ marginTop: '-55px' }}>
            {/* Avatar Photo with Interactive Upload Button */}
            <div className="position-relative">
              <div 
                className="rounded-circle border border-4 border-white shadow-sm overflow-hidden d-flex align-items-center justify-content-center bg-light position-relative"
                style={{ width: '110px', height: '110px', minWidth: '110px' }}
              >
                {avatarPreview ? (
                  <img 
                    src={avatarPreview} 
                    alt={user?.name || 'User Avatar'} 
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                ) : (
                  <div 
                    className={`w-100 h-100 d-flex align-items-center justify-content-center fs-2 fw-bold ${
                      user?.gender === 'Female' ? 'bg-danger-subtle text-danger' : 'bg-primary-subtle text-primary'
                    }`}
                  >
                    {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
                  </div>
                )}

                {uploadingAvatar && (
                  <div 
                    className="position-absolute w-100 h-100 d-flex align-items-center justify-content-center bg-dark bg-opacity-50 text-white"
                  >
                    <Spinner animation="border" size="sm" />
                  </div>
                )}
              </div>

              {/* Photo Upload Trigger Button */}
              <button
                type="button"
                className="btn btn-primary btn-sm rounded-circle position-absolute bottom-0 end-0 p-1.5 shadow-sm border border-2 border-white d-flex align-items-center justify-content-center"
                style={{ width: '32px', height: '32px' }}
                onClick={() => fileInputRef.current?.click()}
                title="ছবি আপলোড / পরিবর্তন করুন"
                disabled={uploadingAvatar}
              >
                <Camera size={15} />
              </button>

              <input 
                type="file" 
                ref={fileInputRef} 
                className="d-none" 
                accept="image/jpeg,image/png,image/jpg,image/webp" 
                onChange={handleAvatarFileChange} 
              />
            </div>

            {/* Teacher Details & Identifiers */}
            <div className="flex-grow-1 text-center text-md-start mt-2 mt-md-0">
              <div className="d-flex flex-wrap align-items-center justify-content-center justify-content-md-start gap-2 mb-1">
                {user?.salutation && (
                  <Badge bg={user.salutation.toLowerCase().includes('madam') ? 'danger' : 'primary'} className="px-2 py-1 fs-8">
                    {user.salutation}
                  </Badge>
                )}
                <h4 className="fw-bold text-dark mb-0 fs-5">{user?.name}</h4>
                {user?.name_bn && (
                  <span className="text-secondary fw-semibold fs-7">({user.name_bn})</span>
                )}
              </div>

              <div className="d-flex flex-wrap align-items-center justify-content-center justify-content-md-start gap-2 mb-2">
                <span className="text-muted fs-7 fw-medium">
                  {user?.designation || 'Faculty Member'}
                </span>
                <span className="text-muted">•</span>
                <span className="badge bg-light text-secondary border fs-8">
                  {user?.department?.name_bn || 'সাধারণ শিক্ষা / প্রশাসন'}
                </span>
                {user?.employee_type && (
                  <Badge bg="info" className="text-dark bg-opacity-25 border fs-9">
                    {user.employee_type}
                  </Badge>
                )}
              </div>

              {/* Official Badges: SL, EMP ID, Blood Group, Active */}
              <div className="d-flex flex-wrap align-items-center justify-content-center justify-content-md-start gap-1.5">
                {user?.serial_number !== undefined && user?.serial_number !== null && (
                  <Badge bg="dark" className="font-monospace px-2 py-1 fs-8">
                    SL #{user.serial_number}
                  </Badge>
                )}
                {user?.employee_id && (
                  <Badge bg="primary" className="font-monospace px-2 py-1 fs-8">
                    EMP ID: {user.employee_id}
                  </Badge>
                )}
                {user?.blood_group && (
                  <Badge bg="danger" className="px-2 py-1 fs-8">
                    🩸 {user.blood_group}
                  </Badge>
                )}
                {user?.roles?.map((r) => (
                  <Badge key={r.id} bg="success" className="bg-opacity-75 px-2 py-1 fs-8">
                    {r.display_name_bn}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Quick Actions (Photo Controls) */}
            <div className="d-flex gap-2">
              <Button
                variant="outline-primary"
                size="sm"
                className="d-flex align-items-center gap-1.5 rounded-3 fw-semibold fs-8"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploadingAvatar}
              >
                <Camera size={14} />
                <span>{avatarPreview ? 'ছবি পরিবর্তন' : 'ছবি যোগ করুন'}</span>
              </Button>
              {avatarPreview && (
                <Button
                  variant="outline-danger"
                  size="sm"
                  className="d-flex align-items-center gap-1 rounded-3 fs-8"
                  onClick={handleRemoveAvatar}
                  disabled={uploadingAvatar}
                  title="ছবি মুছে ফেলুন"
                >
                  <Trash2 size={14} />
                </Button>
              )}
            </div>
          </div>
        </Card.Body>
      </Card>

      {/* 2. TABBED PROFILE CONTENT AREA */}
      <Tab.Container activeKey={activeTab} onSelect={(k) => k && setActiveTab(k)}>
        <Card className="border-0 shadow-sm rounded-4 overflow-hidden bg-white">
          <Card.Header className="bg-white p-2 border-bottom">
            <Nav variant="pills" className="custom-nav-pills gap-1 flex-wrap">
              <Nav.Item>
                <Nav.Link eventKey="basic" className="d-flex align-items-center gap-2 fw-semibold fs-7 py-2 px-3">
                  <UserIcon size={16} />
                  <span>ব্যক্তিগত ও প্রাতিষ্ঠানিক তথ্য (Personal & Official)</span>
                </Nav.Link>
              </Nav.Item>

              <Nav.Item>
                <Nav.Link eventKey="contact" className="d-flex align-items-center gap-2 fw-semibold fs-7 py-2 px-3">
                  <MapPin size={16} />
                  <span>যোগাযোগ ও জরুরি ঠিকানা (Contact & Address)</span>
                </Nav.Link>
              </Nav.Item>

              <Nav.Item>
                <Nav.Link eventKey="account" className="d-flex align-items-center gap-2 fw-semibold fs-7 py-2 px-3">
                  <CreditCard size={16} />
                  <span>ব্যাংক ও পরিচিতি (Accounts & Bio)</span>
                </Nav.Link>
              </Nav.Item>

              <Nav.Item>
                <Nav.Link eventKey="security" className="d-flex align-items-center gap-2 fw-semibold fs-7 py-2 px-3">
                  <KeyRound size={16} />
                  <span>নিরাপত্তা ও পাসওয়ার্ড (Security)</span>
                </Nav.Link>
              </Nav.Item>

              <Nav.Item>
                <Nav.Link eventKey="history" className="d-flex align-items-center gap-2 fw-semibold fs-7 py-2 px-3">
                  <ShieldCheck size={16} />
                  <span>লগইন হিস্ট্রি ও সেশন (Login History)</span>
                </Nav.Link>
              </Nav.Item>
            </Nav>
          </Card.Header>

          <Card.Body className="p-4">
            <Tab.Content>
              {/* TAB 1: BASIC & INSTITUTIONAL INFO */}
              <Tab.Pane eventKey="basic">
                <Form onSubmit={handleProfileSubmit(onProfileSubmit)}>
                  <h6 className="fw-bold text-primary mb-3 d-flex align-items-center gap-2">
                    <UserIcon size={18} />
                    <span>১. প্রাথমিক ও প্রাতিষ্ঠানিক পরিচিতি (Institutional Identification)</span>
                  </h6>

                  <Row className="g-3 mb-4">
                    <Col md={3} xs={6}>
                      <Form.Group controlId="employee_id_display">
                        <Form.Label className="fw-semibold fs-7 text-secondary">
                          এমপ্লয়ী আইডি (EMP ID)
                        </Form.Label>
                        <Form.Control
                          type="text"
                          value={user?.employee_id || 'N/A'}
                          disabled
                          className="fs-7 font-monospace fw-bold bg-light"
                        />
                      </Form.Group>
                    </Col>

                    <Col md={3} xs={6}>
                      <Form.Group controlId="serial_number_display">
                        <Form.Label className="fw-semibold fs-7 text-secondary">
                          ক্রমিক নম্বর (SL Order)
                        </Form.Label>
                        <Form.Control
                          type="text"
                          value={user?.serial_number !== undefined ? String(user.serial_number) : 'N/A'}
                          disabled
                          className="fs-7 font-monospace fw-bold bg-light"
                        />
                      </Form.Group>
                    </Col>

                    <Col md={3} xs={6}>
                      <Form.Group controlId="salutation">
                        <Form.Label className="fw-semibold fs-7 text-secondary">
                          সম্বোধন (Salutation)
                        </Form.Label>
                        <Form.Select className="fs-7" {...registerProfile('salutation')}>
                          <option value="Sir">Sir (স্যার)</option>
                          <option value="Madam">Madam (ম্যাডাম)</option>
                          <option value="Dr.">Dr. (ড.)</option>
                          <option value="Prof.">Prof. (অধ্যাপক)</option>
                          <option value="Mr.">Mr.</option>
                          <option value="Ms.">Ms.</option>
                        </Form.Select>
                      </Form.Group>
                    </Col>

                    <Col md={3} xs={6}>
                      <Form.Group controlId="gender">
                        <Form.Label className="fw-semibold fs-7 text-secondary">
                          লিঙ্গ (Gender)
                        </Form.Label>
                        <Form.Select className="fs-7" {...registerProfile('gender')}>
                          <option value="Male">Male (পুরুষ)</option>
                          <option value="Female">Female (মহিলা)</option>
                          <option value="Other">Other</option>
                        </Form.Select>
                      </Form.Group>
                    </Col>

                    <Col md={6}>
                      <Form.Group controlId="name">
                        <Form.Label className="fw-semibold fs-7 text-secondary">
                          পূর্ণ নাম (ইংরেজি) <span className="text-danger">*</span>
                        </Form.Label>
                        <Form.Control
                          type="text"
                          placeholder="e.g. Masuma Mamataz"
                          className="fs-7 fw-semibold"
                          {...registerProfile('name', { required: 'ইংরেজি নাম আবশ্যক' })}
                        />
                      </Form.Group>
                    </Col>

                    <Col md={6}>
                      <Form.Group controlId="name_bn">
                        <Form.Label className="fw-semibold fs-7 text-secondary">
                          পূর্ণ নাম (বাংলা)
                        </Form.Label>
                        <Form.Control
                          type="text"
                          placeholder="যেমন: মাসুমা মমতাজ"
                          className="fs-7"
                          {...registerProfile('name_bn')}
                        />
                      </Form.Group>
                    </Col>

                    <Col md={3} xs={6}>
                      <Form.Group controlId="religion">
                        <Form.Label className="fw-semibold fs-7 text-secondary">
                          ধর্ম (Religion)
                        </Form.Label>
                        <Form.Select className="fs-7" {...registerProfile('religion')}>
                          <option value="Islam">Islam (ইসলাম)</option>
                          <option value="Hinduism">Hinduism (হিন্দু)</option>
                          <option value="Christianity">Christianity (খ্রিস্টান)</option>
                          <option value="Buddhism">Buddhism (বৌদ্ধ)</option>
                          <option value="Other">Other (অন্যান্য)</option>
                        </Form.Select>
                      </Form.Group>
                    </Col>

                    <Col md={3} xs={6}>
                      <Form.Group controlId="blood_group">
                        <Form.Label className="fw-semibold fs-7 text-secondary">
                          রক্তের গ্রুপ (Blood Group)
                        </Form.Label>
                        <Form.Select className="fs-7 font-monospace fw-bold" {...registerProfile('blood_group')}>
                          <option value="">-- নির্বাচন করুন --</option>
                          <option value="A+">A+</option>
                          <option value="A-">A-</option>
                          <option value="B+">B+</option>
                          <option value="B-">B-</option>
                          <option value="O+">O+</option>
                          <option value="O-">O-</option>
                          <option value="AB+">AB+</option>
                          <option value="AB-">AB-</option>
                        </Form.Select>
                      </Form.Group>
                    </Col>

                    <Col md={3} xs={6}>
                      <Form.Group controlId="date_of_birth">
                        <Form.Label className="fw-semibold fs-7 text-secondary">
                          জন্ম তারিখ (Date of Birth)
                        </Form.Label>
                        <Form.Control
                          type="date"
                          className="fs-7 font-monospace"
                          {...registerProfile('date_of_birth')}
                        />
                      </Form.Group>
                    </Col>

                    <Col md={3} xs={6}>
                      <Form.Group controlId="nationality">
                        <Form.Label className="fw-semibold fs-7 text-secondary">
                          জাতীয়তা (Nationality)
                        </Form.Label>
                        <Form.Control
                          type="text"
                          placeholder="যেমন: Bangladeshi"
                          className="fs-7"
                          {...registerProfile('nationality')}
                        />
                      </Form.Group>
                    </Col>

                    <Col md={6}>
                      <Form.Group controlId="father_name">
                        <Form.Label className="fw-semibold fs-7 text-secondary">
                          পিতার নাম (Father's Name)
                        </Form.Label>
                        <Form.Control
                          type="text"
                          placeholder="পিতার নাম লিখুন"
                          className="fs-7"
                          {...registerProfile('father_name')}
                        />
                      </Form.Group>
                    </Col>

                    <Col md={6}>
                      <Form.Group controlId="mother_name">
                        <Form.Label className="fw-semibold fs-7 text-secondary">
                          মাতার নাম (Mother's Name)
                        </Form.Label>
                        <Form.Control
                          type="text"
                          placeholder="মাতার নাম লিখুন"
                          className="fs-7"
                          {...registerProfile('mother_name')}
                        />
                      </Form.Group>
                    </Col>

                    <Col md={6}>
                      <Form.Group controlId="nid">
                        <Form.Label className="fw-semibold fs-7 text-secondary">
                          জাতীয় পরিচয়পত্র / NID
                        </Form.Label>
                        <Form.Control
                          type="text"
                          placeholder="জাতীয় পরিচয়পত্র নম্বর"
                          className="fs-7 font-monospace"
                          {...registerProfile('nid')}
                        />
                      </Form.Group>
                    </Col>

                    <Col md={6}>
                      <Form.Group controlId="join_date">
                        <Form.Label className="fw-semibold fs-7 text-secondary">
                          যোগদানের তারিখ (Join Date)
                        </Form.Label>
                        <Form.Control
                          type="date"
                          className="fs-7 font-monospace"
                          {...registerProfile('join_date')}
                        />
                      </Form.Group>
                    </Col>
                  </Row>

                  <hr className="my-4" />

                  <h6 className="fw-bold text-primary mb-3 d-flex align-items-center gap-2">
                    <Briefcase size={18} />
                    <span>২. পদবি ও একাডেমিক দায়িত্ব (Official & Academic Role)</span>
                  </h6>

                  <Row className="g-3 mb-4">
                    <Col md={6}>
                      <Form.Group controlId="designation">
                        <Form.Label className="fw-semibold fs-7 text-secondary">
                          পদবি (Designation)
                        </Form.Label>
                        <Form.Control
                          type="text"
                          placeholder="যেমন: Senior Teacher"
                          className="fs-7"
                          {...registerProfile('designation')}
                        />
                      </Form.Group>
                    </Col>

                    <Col md={6}>
                      <Form.Group controlId="employee_type">
                        <Form.Label className="fw-semibold fs-7 text-secondary">
                          কর্মসংস্থানের ধরন (Employee Type)
                        </Form.Label>
                        <Form.Select className="fs-7" {...registerProfile('employee_type')}>
                          <option value="Permanent">Permanent (স্থায়ী)</option>
                          <option value="Contractual">Contractual (চুক্তিভিত্তিক)</option>
                          <option value="Part-Time">Part-Time (খণ্ডকালীন)</option>
                          <option value="Guest Faculty">Guest Faculty</option>
                        </Form.Select>
                      </Form.Group>
                    </Col>

                    <Col md={6}>
                      <Form.Group controlId="school_hours">
                        <Form.Label className="fw-semibold fs-7 text-secondary">
                          কর্মঘণ্টা / শিফট (School Hour)
                        </Form.Label>
                        <Form.Control
                          type="text"
                          placeholder="e.g. Teacher-BSI [08:05 - 14:30]"
                          className="fs-7 font-monospace"
                          {...registerProfile('school_hours')}
                        />
                      </Form.Group>
                    </Col>

                    <Col md={6}>
                      <Form.Group controlId="appointment_subject">
                        <Form.Label className="fw-semibold fs-7 text-secondary">
                          নিয়োগের বিষয় (Appointment Subject)
                        </Form.Label>
                        <Form.Control
                          type="text"
                          placeholder="যেমন: English / Mathematics / Science"
                          className="fs-7"
                          {...registerProfile('appointment_subject')}
                        />
                      </Form.Group>
                    </Col>

                    <Col md={12}>
                      <Form.Group controlId="teaching_subject">
                        <Form.Label className="fw-semibold fs-7 text-secondary">
                          পাঠদানের বিষয় ও যোগ্যতা (Teaching Subject & Qualifications)
                        </Form.Label>
                        <Form.Control
                          type="text"
                          placeholder="যেমন: English B.Ed, M.Ed, C.Sc"
                          className="fs-7"
                          {...registerProfile('teaching_subject')}
                        />
                      </Form.Group>
                    </Col>
                  </Row>

                  <div className="d-flex justify-content-end gap-2 pt-2 border-top">
                    <Button
                      variant="primary"
                      type="submit"
                      className="px-4 py-2 rounded-3 fw-bold btn-institutional d-flex align-items-center gap-2"
                      disabled={updatingProfile}
                    >
                      {updatingProfile ? <Spinner size="sm" /> : <Save size={16} />}
                      <span>সংরক্ষণ করুন (Save Changes)</span>
                    </Button>
                  </div>
                </Form>
              </Tab.Pane>

              {/* TAB 2: CONTACT & EMERGENCY ADDRESS */}
              <Tab.Pane eventKey="contact">
                <Form onSubmit={handleProfileSubmit(onProfileSubmit)}>
                  <h6 className="fw-bold text-primary mb-3 d-flex align-items-center gap-2">
                    <Phone size={18} />
                    <span>১. সরাসরি যোগাযোগ তথ্য (Direct Contact)</span>
                  </h6>

                  <Row className="g-3 mb-4">
                    <Col md={6}>
                      <Form.Group controlId="email">
                        <Form.Label className="fw-semibold fs-7 text-secondary">
                          ইমেইল ঠিকানা (Email) <span className="text-danger">*</span>
                        </Form.Label>
                        <Form.Control
                          type="email"
                          placeholder="teacher@bsisc.edu.bd"
                          className="fs-7 font-monospace"
                          {...registerProfile('email', { required: 'ইমেইল আবশ্যক' })}
                        />
                      </Form.Group>
                    </Col>

                    <Col md={6}>
                      <Form.Group controlId="phone">
                        <Form.Label className="fw-semibold fs-7 text-secondary">
                          মোবাইল নম্বর (Phone = Login Password)
                        </Form.Label>
                        <Form.Control
                          type="text"
                          placeholder="যেমন: 01780017602"
                          className="fs-7 font-monospace fw-bold text-primary"
                          {...registerProfile('phone')}
                        />
                      </Form.Group>
                    </Col>

                    <Col md={6}>
                      <Form.Group controlId="present_address">
                        <Form.Label className="fw-semibold fs-7 text-secondary">
                          বর্তমান ঠিকানা (Present Address)
                        </Form.Label>
                        <Form.Control
                          as="textarea"
                          rows={3}
                          placeholder="বাসা নং, রোড নং, এলাকা, ঢাকা"
                          className="fs-7"
                          {...registerProfile('present_address')}
                        />
                      </Form.Group>
                    </Col>

                    <Col md={6}>
                      <Form.Group controlId="permanent_address">
                        <Form.Label className="fw-semibold fs-7 text-secondary">
                          স্থায়ী ঠিকানা (Permanent Address)
                        </Form.Label>
                        <Form.Control
                          as="textarea"
                          rows={3}
                          placeholder="গ্রাম, ডাকঘর, থানা, জেলা"
                          className="fs-7"
                          {...registerProfile('permanent_address')}
                        />
                      </Form.Group>
                    </Col>

                    <Col md={6}>
                      <Form.Group controlId="home_district">
                        <Form.Label className="fw-semibold fs-7 text-secondary">
                          নিজ জেলা (Home District)
                        </Form.Label>
                        <Form.Select className="fs-7" {...registerProfile('home_district')}>
                          <option value="">-- জেলা নির্বাচন করুন --</option>
                          {BD_DISTRICTS.map((dist) => (
                            <option key={dist} value={dist}>
                              {dist}
                            </option>
                          ))}
                        </Form.Select>
                      </Form.Group>
                    </Col>
                  </Row>

                  <hr className="my-4" />

                  <h6 className="fw-bold text-danger mb-3 d-flex align-items-center gap-2">
                    <HeartHandshake size={18} />
                    <span>২. জরুরি যোগাযোগ (Emergency Contact Details)</span>
                  </h6>

                  <Row className="g-3 mb-4">
                    <Col md={4}>
                      <Form.Group controlId="emergency_contact_name">
                        <Form.Label className="fw-semibold fs-7 text-secondary">
                          জরুরি ব্যক্তির নাম (Contact Person)
                        </Form.Label>
                        <Form.Control
                          type="text"
                          placeholder="নাম লিখুন"
                          className="fs-7"
                          {...registerProfile('emergency_contact_name')}
                        />
                      </Form.Group>
                    </Col>

                    <Col md={4}>
                      <Form.Group controlId="emergency_contact_relation">
                        <Form.Label className="fw-semibold fs-7 text-secondary">
                          সম্পর্ক (Relation)
                        </Form.Label>
                        <Form.Select className="fs-7" {...registerProfile('emergency_contact_relation')}>
                          <option value="">-- সম্পর্ক নির্বাচন করুন --</option>
                          <option value="Spouse">Spouse (স্বামী / স্ত্রী)</option>
                          <option value="Father">Father (পিতা)</option>
                          <option value="Mother">Mother (মাতা)</option>
                          <option value="Brother">Brother (ভাই)</option>
                          <option value="Sister">Sister (বোন)</option>
                          <option value="Guardian">Guardian (অভিভাবক)</option>
                          <option value="Relative">Relative (আত্মীয়)</option>
                        </Form.Select>
                      </Form.Group>
                    </Col>

                    <Col md={4}>
                      <Form.Group controlId="emergency_contact_phone">
                        <Form.Label className="fw-semibold fs-7 text-secondary">
                          জরুরি মোবাইল নম্বর (Emergency Mobile)
                        </Form.Label>
                        <Form.Control
                          type="text"
                          placeholder="যেমন: 017XXXXXXXX"
                          className="fs-7 font-monospace"
                          {...registerProfile('emergency_contact_phone')}
                        />
                      </Form.Group>
                    </Col>
                  </Row>

                  <div className="d-flex justify-content-end gap-2 pt-2 border-top">
                    <Button
                      variant="primary"
                      type="submit"
                      className="px-4 py-2 rounded-3 fw-bold btn-institutional d-flex align-items-center gap-2"
                      disabled={updatingProfile}
                    >
                      {updatingProfile ? <Spinner size="sm" /> : <Save size={16} />}
                      <span>সংরক্ষণ করুন (Save Changes)</span>
                    </Button>
                  </div>
                </Form>
              </Tab.Pane>

              {/* TAB 3: ACCOUNTS & BIO */}
              <Tab.Pane eventKey="account">
                <Form onSubmit={handleProfileSubmit(onProfileSubmit)}>
                  <h6 className="fw-bold text-primary mb-3 d-flex align-items-center gap-2">
                    <CreditCard size={18} />
                    <span>১. ব্যাংক ও স্যালারি একাউন্ট তথ্য (Salary Account)</span>
                  </h6>

                  <Row className="g-3 mb-4">
                    <Col md={6}>
                      <Form.Group controlId="bank_name">
                        <Form.Label className="fw-semibold fs-7 text-secondary">
                          ব্যাংকের নাম ও শাখা (Bank & Branch Name)
                        </Form.Label>
                        <Form.Control
                          type="text"
                          placeholder="যেমন: Trust Bank, Baridhara Branch"
                          className="fs-7"
                          {...registerProfile('bank_name')}
                        />
                      </Form.Group>
                    </Col>

                    <Col md={6}>
                      <Form.Group controlId="bank_account_no">
                        <Form.Label className="fw-semibold fs-7 text-secondary">
                          অ্যাকাউন্ট নম্বর (Account Number)
                        </Form.Label>
                        <Form.Control
                          type="text"
                          placeholder="e.g. 0012-XXXXXXXXX"
                          className="fs-7 font-monospace fw-semibold"
                          {...registerProfile('bank_account_no')}
                        />
                      </Form.Group>
                    </Col>
                  </Row>

                  <hr className="my-4" />

                  <h6 className="fw-bold text-primary mb-3 d-flex align-items-center gap-2">
                    <Globe size={18} />
                    <span>২. বায়ো ও সোশ্যাল প্রোফাইল (Bio & Social)</span>
                  </h6>

                  <Row className="g-3 mb-4">
                    <Col md={12}>
                      <Form.Group controlId="facebook_url">
                        <Form.Label className="fw-semibold fs-7 text-secondary">
                          ফেসবুক প্রোফাইল লিংক (Facebook Profile URL)
                        </Form.Label>
                        <Form.Control
                          type="url"
                          placeholder="https://facebook.com/username"
                          className="fs-7 font-monospace"
                          {...registerProfile('facebook_url')}
                        />
                      </Form.Group>
                    </Col>

                    <Col md={12}>
                      <Form.Group controlId="bio">
                        <Form.Label className="fw-semibold fs-7 text-secondary">
                          আমার সম্পর্কে / পরিচিতি ও শিক্ষাগত অর্জন (About Me / Bio)
                        </Form.Label>
                        <Form.Control
                          as="textarea"
                          rows={4}
                          placeholder="আপনার শিক্ষাগত যোগ্যতা, অভিজ্ঞতা এবং বিশেষ অর্জনসমূহ সংক্ষেপে লিখুন..."
                          className="fs-7"
                          {...registerProfile('bio')}
                        />
                      </Form.Group>
                    </Col>
                  </Row>

                  <div className="d-flex justify-content-end gap-2 pt-2 border-top">
                    <Button
                      variant="primary"
                      type="submit"
                      className="px-4 py-2 rounded-3 fw-bold btn-institutional d-flex align-items-center gap-2"
                      disabled={updatingProfile}
                    >
                      {updatingProfile ? <Spinner size="sm" /> : <Save size={16} />}
                      <span>সংরক্ষণ করুন (Save Changes)</span>
                    </Button>
                  </div>
                </Form>
              </Tab.Pane>

              {/* TAB 4: SECURITY & PASSWORD */}
              <Tab.Pane eventKey="security">
                <div style={{ maxWidth: '600px' }}>
                  <h6 className="fw-bold text-primary mb-3 d-flex align-items-center gap-2">
                    <KeyRound size={18} />
                    <span>পাসওয়ার্ড পরিবর্তন (Change Account Password)</span>
                  </h6>

                  <p className="text-muted fs-7 mb-4">
                    আপনার একাউন্ট নিরাপদ রাখতে নিয়মিত পাসওয়ার্ড পরিবর্তন করুন। পাসওয়ার্ড কমপক্ষে ৮ অক্ষরের হতে হবে।
                  </p>

                  <Form onSubmit={handlePasswordSubmit(onPasswordSubmit)} noValidate>
                    <Form.Group className="mb-3" controlId="current_password">
                      <Form.Label className="fw-semibold fs-7 text-secondary">
                        {t('auth.current_password')} <span className="text-danger">*</span>
                      </Form.Label>
                      <Form.Control
                        type="password"
                        placeholder="বর্তমান পাসওয়ার্ড দিন"
                        className={`fs-7 ${passwordErrors.current_password ? 'is-invalid' : ''}`}
                        {...registerPassword('current_password')}
                      />
                      {passwordErrors.current_password && (
                        <Form.Control.Feedback type="invalid">
                          {passwordErrors.current_password.message}
                        </Form.Control.Feedback>
                      )}
                    </Form.Group>

                    <Form.Group className="mb-3" controlId="password">
                      <Form.Label className="fw-semibold fs-7 text-secondary">
                        {t('auth.new_password')} <span className="text-danger">*</span>
                      </Form.Label>
                      <Form.Control
                        type="password"
                        placeholder="নতুন পাসওয়ার্ড (কমপক্ষে ৮ অক্ষর)"
                        className={`fs-7 ${passwordErrors.password ? 'is-invalid' : ''}`}
                        {...registerPassword('password')}
                      />
                      {passwordErrors.password && (
                        <Form.Control.Feedback type="invalid">
                          {passwordErrors.password.message}
                        </Form.Control.Feedback>
                      )}
                    </Form.Group>

                    <Form.Group className="mb-4" controlId="password_confirmation">
                      <Form.Label className="fw-semibold fs-7 text-secondary">
                        {t('auth.confirm_password')} <span className="text-danger">*</span>
                      </Form.Label>
                      <Form.Control
                        type="password"
                        placeholder="নতুন পাসওয়ার্ড পুনরায় লিখুন"
                        className={`fs-7 ${passwordErrors.password_confirmation ? 'is-invalid' : ''}`}
                        {...registerPassword('password_confirmation')}
                      />
                      {passwordErrors.password_confirmation && (
                        <Form.Control.Feedback type="invalid">
                          {passwordErrors.password_confirmation.message}
                        </Form.Control.Feedback>
                      )}
                    </Form.Group>

                    <Button
                      variant="primary"
                      type="submit"
                      className="px-4 py-2 rounded-3 fw-bold btn-institutional d-flex align-items-center gap-2"
                      disabled={changingPassword}
                    >
                      {changingPassword ? <Spinner size="sm" /> : <KeyRound size={16} />}
                      <span>{t('auth.save_password')}</span>
                    </Button>
                  </Form>
                </div>
              </Tab.Pane>

              {/* TAB 5: LOGIN HISTORY & DEVICES */}
              <Tab.Pane eventKey="history">
                <div className="login-history-section">
                  <h6 className="fw-bold text-primary mb-3 d-flex align-items-center gap-2">
                    <ShieldCheck size={18} />
                    <span>লগইন হিস্ট্রি ও অ্যাক্টিভ সেশন বিবরণী (Login Activity & Audit Logs)</span>
                  </h6>

                  {/* Summary Metric Cards */}
                  <Row className="g-3 mb-4">
                    <Col md={3} xs={6}>
                      <Card className="border-0 bg-light p-3 text-center rounded-3 shadow-xs">
                        <small className="text-muted fw-semibold fs-8">মোট সফল লগইন</small>
                        <h4 className="fw-bold text-primary mb-0 mt-1">
                          {loginHistoryData?.summary?.total_logins || user?.login_count || 1} বার
                        </h4>
                      </Card>
                    </Col>
                    <Col md={3} xs={6}>
                      <Card className="border-0 bg-light p-3 text-center rounded-3 shadow-xs">
                        <small className="text-muted fw-semibold fs-8">বর্তমান আইপি ঠিকানা</small>
                        <h6 className="fw-bold font-monospace text-dark mb-0 mt-2">
                          {loginHistoryData?.summary?.current_ip || '127.0.0.1'}
                        </h6>
                      </Card>
                    </Col>
                    <Col md={3} xs={6}>
                      <Card className="border-0 bg-light p-3 text-center rounded-3 shadow-xs">
                        <small className="text-muted fw-semibold fs-8">বর্তমান ডিভাইস</small>
                        <h6 className="fw-bold text-secondary mb-0 mt-2 text-truncate" title={loginHistoryData?.summary?.current_device || user?.last_login_device || 'Desktop (Windows)'}>
                          {loginHistoryData?.summary?.current_device || user?.last_login_device || 'Desktop (Windows)'}
                        </h6>
                      </Card>
                    </Col>
                    <Col md={3} xs={6}>
                      <Card className="border-0 bg-light p-3 text-center rounded-3 shadow-xs">
                        <small className="text-muted fw-semibold fs-8">সর্বশেষ লগইন সময়</small>
                        <small className="font-monospace text-success fw-bold d-block mt-2">
                          {formatLoginBDTime(loginHistoryData?.summary?.last_login_at || user?.last_login_at)}
                        </small>
                      </Card>
                    </Col>
                  </Row>

                  {/* Table of Logins */}
                  <div className="table-responsive border rounded-3 overflow-hidden mb-3">
                    <Table hover className="align-middle mb-0 fs-7">
                      <thead className="table-light">
                        <tr>
                          <th style={{ width: '40px' }}>#</th>
                          <th>লগইন তারিখ ও সময়</th>
                          <th>আইপি ঠিকানা</th>
                          <th>ডিভাইস ও প্ল্যাটফর্ম</th>
                          <th>ব্রাউজার</th>
                          <th>অবস্থান</th>
                          <th className="text-end">স্ট্যাটাস</th>
                        </tr>
                      </thead>
                      <tbody>
                        {loadingHistory ? (
                          <tr>
                            <td colSpan={7} className="text-center py-4 text-muted">
                              <Spinner size="sm" animation="border" className="me-2" /> লগইন তথ্য লোড হচ্ছে...
                            </td>
                          </tr>
                        ) : (loginHistoryData?.data || []).length === 0 ? (
                          <tr>
                            <td colSpan={7} className="text-center py-4 text-muted">
                              কোনো পূর্ববর্তী লগইন রেকর্ড নেই
                            </td>
                          </tr>
                        ) : (
                          loginHistoryData?.data.map((item, index) => (
                            <tr key={item.id}>
                              <td className="text-muted font-monospace">
                                {((historyPage - 1) * 15) + index + 1}
                              </td>
                              <td>
                                <div className="d-flex align-items-center gap-1.5 fw-semibold text-dark font-monospace fs-8">
                                  <Clock size={13} className="text-primary" />
                                  <span>{formatLoginBDTime(item.logged_in_at)}</span>
                                </div>
                              </td>
                              <td>
                                <span className="font-monospace text-secondary fw-semibold bg-light px-2 py-0.5 rounded border fs-8">
                                  {item.ip_address}
                                </span>
                              </td>
                              <td>
                                <div className="d-flex align-items-center gap-1.5 fs-8">
                                  {item.device_type === 'Mobile' ? (
                                    <Smartphone size={14} className="text-primary" />
                                  ) : item.device_type === 'Tablet' ? (
                                    <Tablet size={14} className="text-info" />
                                  ) : (
                                    <Laptop size={14} className="text-secondary" />
                                  )}
                                  <span className="fw-medium">{item.device_type}</span>
                                  <Badge bg="secondary" className="bg-opacity-25 text-dark fs-9">
                                    {item.platform}
                                  </Badge>
                                </div>
                              </td>
                              <td>
                                <span className="text-muted fs-8">{item.browser}</span>
                              </td>
                              <td>
                                <div className="d-flex align-items-center gap-1 fs-8 text-muted">
                                  <MapPin size={12} />
                                  <span>{item.location || 'Dhaka, Bangladesh'}</span>
                                </div>
                              </td>
                              <td className="text-end">
                                <Badge bg="success" className="bg-opacity-75 px-2 py-1 fs-9 d-inline-flex align-items-center gap-1">
                                  <CheckCircle2 size={11} /> সফল লগইন
                                </Badge>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </Table>
                  </div>

                  {/* Pagination if total pages > 1 */}
                  {loginHistoryData?.meta && loginHistoryData.meta.last_page > 1 && (
                    <div className="d-flex justify-content-between align-items-center fs-8 text-muted pt-2">
                      <span>মোট {loginHistoryData.meta.total} টি লগইন রেকর্ডের মধ্যে পাতা {historyPage} / {loginHistoryData.meta.last_page}</span>
                      <div className="btn-group btn-group-sm">
                        <Button
                          variant="outline-secondary"
                          size="sm"
                          disabled={historyPage <= 1}
                          onClick={() => setHistoryPage((p) => Math.max(1, p - 1))}
                        >
                          পূর্ববর্তী
                        </Button>
                        <Button
                          variant="outline-secondary"
                          size="sm"
                          disabled={historyPage >= loginHistoryData.meta.last_page}
                          onClick={() => setHistoryPage((p) => p + 1)}
                        >
                          পরবর্তী
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </Tab.Pane>
            </Tab.Content>
          </Card.Body>
        </Card>
      </Tab.Container>
    </div>
  );
};