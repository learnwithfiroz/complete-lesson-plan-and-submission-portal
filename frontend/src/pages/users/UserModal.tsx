import React, { useEffect } from 'react';
import { Modal, Form, Button, Row, Col } from 'react-bootstrap';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useQuery } from '@tanstack/react-query';
import { rolesApi } from '../../api/roles';
import { departmentsApi } from '../../api/departments';
import type { User } from '../../types/auth';
import type { UserFormData } from '../../api/users';

const createUserSchema = (isEditing: boolean) =>
  z.object({
    employee_id: z.string().optional(),
    serial_number: z.any().optional(),
    name: z.string().min(2, 'নাম কমপক্ষে ২ অক্ষরের হতে হবে'),
    salutation: z.string().optional(),
    gender: z.string().optional(),
    email: z.string().email('সঠিক ইমেইল ঠিকানা দিন'),
    password: isEditing
      ? z.string().optional()
      : z.string().min(8, 'পাসওয়ার্ড কমপক্ষে ৮ অক্ষরের হতে হবে'),
    phone: z.string().optional(),
    designation: z.string().optional(),
    department_id: z.any().optional(),
    role_ids: z.array(z.number()).min(1, 'কমপক্ষে একটি ভূমিকা (Role) নির্বাচন করুন'),
    is_active: z.boolean().default(true),
  });

interface UserModalProps {
  show: boolean;
  user: User | null;
  isLoading: boolean;
  onHide: () => void;
  onSubmit: (data: UserFormData) => void;
}

export const UserModal: React.FC<UserModalProps> = ({
  show,
  user,
  isLoading,
  onHide,
  onSubmit,
}) => {
  const isEditing = !!user;
  const schema = createUserSchema(isEditing);

  const { data: rolesData } = useQuery({
    queryKey: ['roles'],
    queryFn: () => rolesApi.getRoles(),
  });

  const { data: deptsData } = useQuery({
    queryKey: ['departments'],
    queryFn: () => departmentsApi.getDepartments(),
  });

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<any>({
    resolver: zodResolver(schema),
    defaultValues: {
      employee_id: '',
      serial_number: '',
      name: '',
      salutation: 'Sir',
      gender: 'Male',
      email: '',
      password: '',
      phone: '',
      designation: '',
      department_id: '',
      role_ids: [],
      is_active: true,
    },
  });

  const selectedRoleIds = watch('role_ids') || [];

  useEffect(() => {
    if (user) {
      reset({
        employee_id: user.employee_id || '',
        serial_number: user.serial_number !== undefined && user.serial_number !== null ? String(user.serial_number) : '',
        name: user.name,
        salutation: user.salutation || 'Sir',
        gender: user.gender || 'Male',
        email: user.email,
        password: '',
        phone: user.phone || '',
        designation: user.designation || '',
        department_id: user.department?.id || '',
        role_ids: user.roles.map((r) => r.id),
        is_active: user.is_active,
      });
    } else {
      reset({
        employee_id: '',
        serial_number: '',
        name: '',
        salutation: 'Sir',
        gender: 'Male',
        email: '',
        password: '',
        phone: '',
        designation: '',
        department_id: '',
        role_ids: [],
        is_active: true,
      });
    }
  }, [user, reset]);

  const handleRoleToggle = (roleId: number) => {
    const current = [...selectedRoleIds];
    const index = current.indexOf(roleId);
    if (index > -1) {
      current.splice(index, 1);
    } else {
      current.push(roleId);
    }
    setValue('role_ids', current, { shouldValidate: true });
  };

  const handleFormSubmit = (data: any) => {
    const payload: UserFormData = {
      employee_id: data.employee_id || undefined,
      serial_number: data.serial_number !== '' && data.serial_number !== undefined ? Number(data.serial_number) : undefined,
      name: data.name,
      salutation: data.salutation || undefined,
      gender: data.gender || undefined,
      email: data.email,
      phone: data.phone || undefined,
      designation: data.designation || undefined,
      department_id: data.department_id ? Number(data.department_id) : null,
      role_ids: data.role_ids,
      is_active: data.is_active,
    };

    if (data.password && data.password.trim().length > 0) {
      payload.password = data.password;
    }

    onSubmit(payload);
  };

  return (
    <Modal show={show} onHide={onHide} size="lg" centered backdrop="static">
      <Modal.Header closeButton className="bg-light">
        <Modal.Title className="fs-6 fw-bold text-dark">
          {isEditing ? 'ব্যবহারকারীর তথ্য সম্পাদনা (Edit User)' : 'নতুন ব্যবহারকারী তৈরি (Create User)'}
        </Modal.Title>
      </Modal.Header>

      <Form onSubmit={handleSubmit(handleFormSubmit)} noValidate>
        <Modal.Body className="p-4">
          <Row className="g-3">

            <Col md={3}>
              <Form.Group controlId="serial_number">
                <Form.Label className="fw-semibold fs-7 text-secondary">
                  ক্রমিক নং (SL Order)
                </Form.Label>
                <Form.Control
                  type="number"
                  placeholder="যেমন: 1, 2, 3..."
                  className="fs-7 fw-bold"
                  {...register('serial_number')}
                />
              </Form.Group>
            </Col>

            <Col md={3}>
              <Form.Group controlId="employee_id">
                <Form.Label className="fw-semibold fs-7 text-secondary">
                  এমপ্লয়ী আইডি (EMP ID)
                </Form.Label>
                <Form.Control
                  type="text"
                  placeholder="যেমন: 100012"
                  className="fs-7 font-monospace fw-bold"
                  {...register('employee_id')}
                />
              </Form.Group>
            </Col>

            <Col md={3}>
              <Form.Group controlId="salutation">
                <Form.Label className="fw-semibold fs-7 text-secondary">
                  সম্বোধন (Salutation)
                </Form.Label>
                <Form.Select className="fs-7" {...register('salutation')}>
                  <option value="Sir">Sir (স্যার)</option>
                  <option value="Madam">Madam (ম্যাডাম)</option>
                  <option value="Dr.">Dr. (ড.)</option>
                  <option value="Prof.">Prof. (অধ্যাপক)</option>
                  <option value="Mr.">Mr.</option>
                  <option value="Ms.">Ms.</option>
                </Form.Select>
              </Form.Group>
            </Col>

            <Col md={3}>
              <Form.Group controlId="gender">
                <Form.Label className="fw-semibold fs-7 text-secondary">
                  লিঙ্গ (Gender)
                </Form.Label>
                <Form.Select className="fs-7" {...register('gender')}>
                  <option value="Male">Male (পুরুষ)</option>
                  <option value="Female">Female (মহিলা)</option>
                  <option value="Other">Other</option>
                </Form.Select>
              </Form.Group>
            </Col>

            <Col md={6}>
              <Form.Group controlId="name">
                <Form.Label className="fw-semibold fs-7 text-secondary">
                  পূর্ণ নাম (Full Name) <span className="text-danger">*</span>
                </Form.Label>
                <Form.Control
                  type="text"
                  placeholder="যেমন: মাসুমা মমতাজ"
                  className={`fs-7 ${errors.name ? 'is-invalid' : ''}`}
                  {...register('name')}
                />
                {errors.name && (
                  <Form.Control.Feedback type="invalid">
                    {errors.name.message as string}
                  </Form.Control.Feedback>
                )}
              </Form.Group>
            </Col>

            <Col md={6}>
              <Form.Group controlId="email">
                <Form.Label className="fw-semibold fs-7 text-secondary">
                  ইমেইল ঠিকানা (Email) <span className="text-danger">*</span>
                </Form.Label>
                <Form.Control
                  type="email"
                  placeholder="যেমন: teacher@bsisc.edu.bd"
                  className={`fs-7 ${errors.email ? 'is-invalid' : ''}`}
                  {...register('email')}
                />
                {errors.email && (
                  <Form.Control.Feedback type="invalid">
                    {errors.email.message as string}
                  </Form.Control.Feedback>
                )}
              </Form.Group>
            </Col>

            <Col md={6}>
              <Form.Group controlId="phone">
                <Form.Label className="fw-semibold fs-7 text-secondary">
                  ফোন নম্বর (Phone)
                </Form.Label>
                <Form.Control
                  type="text"
                  placeholder="যেমন: +880 1711-000000"
                  className="fs-7"
                  {...register('phone')}
                />
              </Form.Group>
            </Col>

            <Col md={6}>
              <Form.Group controlId="designation">
                <Form.Label className="fw-semibold fs-7 text-secondary">
                  পদবি (Designation)
                </Form.Label>
                <Form.Control
                  type="text"
                  placeholder="যেমন: সিনিয়র শিক্ষক / প্রভাষক"
                  className="fs-7"
                  {...register('designation')}
                />
              </Form.Group>
            </Col>

            <Col md={6}>
              <Form.Group controlId="department_id">
                <Form.Label className="fw-semibold fs-7 text-secondary">
                  বিভাগ (Department)
                </Form.Label>
                <Form.Select className="fs-7" {...register('department_id')}>
                  <option value="">-- বিভাগ নির্বাচন করুন --</option>
                  {deptsData?.data?.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.name_bn} ({d.name_en})
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>
            </Col>

            <Col md={6}>
              <Form.Group controlId="password">
                <Form.Label className="fw-semibold fs-7 text-secondary">
                  পাসওয়ার্ড {isEditing ? '(পরিবর্তন করতে চাইলে লিখুন)' : <span className="text-danger">*</span>}
                </Form.Label>
                <Form.Control
                  type="password"
                  placeholder={isEditing ? 'অপরিবর্তিত রাখতে ফাঁকা রাখুন' : 'কমপক্ষে ৮ অক্ষর'}
                  className={`fs-7 ${errors.password ? 'is-invalid' : ''}`}
                  {...register('password')}
                />
                {errors.password && (
                  <Form.Control.Feedback type="invalid">
                    {errors.password.message as string}
                  </Form.Control.Feedback>
                )}
              </Form.Group>
            </Col>

            {/* Role Assignment */}
            <Col xs={12}>
              <Form.Group>
                <Form.Label className="fw-semibold fs-7 text-secondary d-block mb-2">
                  ভূমিকা / রোল নির্ধারণ (Assign Roles) <span className="text-danger">*</span>
                </Form.Label>
                <div className="d-flex flex-wrap gap-2">
                  {rolesData?.data?.map((role) => {
                    const isChecked = selectedRoleIds.includes(role.id);
                    return (
                      <div
                        key={role.id}
                        className={`p-2 px-3 rounded border cursor-pointer ${
                          isChecked ? 'border-primary bg-primary-subtle' : 'border-light-subtle bg-light'
                        }`}
                        onClick={() => handleRoleToggle(role.id)}
                        style={{ cursor: 'pointer' }}
                      >
                        <Form.Check
                          type="checkbox"
                          id={`role-${role.id}`}
                          label={
                            <span className="fs-7 fw-semibold text-dark">
                              {role.display_name_bn} ({role.display_name_en})
                            </span>
                          }
                          checked={isChecked}
                          onChange={() => {}} // Handled by div click
                        />
                      </div>
                    );
                  })}
                </div>
                {errors.role_ids && (
                  <div className="text-danger fs-8 mt-1">
                    {errors.role_ids.message as string}
                  </div>
                )}
              </Form.Group>
            </Col>

            {/* Active Status */}
            <Col xs={12}>
              <Form.Check
                type="switch"
                id="is_active"
                label={<span className="fw-semibold fs-7 text-dark">অ্যাকাউন্ট সক্রিয় রাখুন (Active Status)</span>}
                {...register('is_active')}
              />
            </Col>

          </Row>
        </Modal.Body>

        <Modal.Footer className="bg-light">
          <Button variant="secondary" size="sm" onClick={onHide} disabled={isLoading}>
            বাতিল
          </Button>
          <Button variant="primary" type="submit" size="sm" className="btn-institutional" disabled={isLoading}>
            {isLoading ? 'সংরক্ষণ হচ্ছে...' : isEditing ? 'তথ্য আপডেট করুন' : 'ব্যবহারকারী তৈরি করুন'}
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
};