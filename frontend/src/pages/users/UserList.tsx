import React, { useState } from 'react';
import { Card, Button, Row, Col, Badge, Table, Form } from 'react-bootstrap';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { UserPlus, Edit2, Trash2, Power, GraduationCap, Briefcase, Wrench, Users, Copy, Check } from 'lucide-react';
import { usersApi } from '../../api/users';
import { rolesApi } from '../../api/roles';
import { departmentsApi } from '../../api/departments';
import { SearchInput } from '../../components/common/SearchInput';
import { Pagination } from '../../components/common/Pagination';
import { ConfirmDialog } from '../../components/common/ConfirmDialog';
import { LoadingSpinner } from '../../components/feedback/LoadingSpinner';
import { UserModal } from './UserModal';
import { toast } from 'react-toastify';
import type { User } from '../../types/auth';
import type { UserFormData, UserFilterParams } from '../../api/users';

export const UserList: React.FC = () => {
  const queryClient = useQueryClient();
  const [copiedId, setCopiedId] = useState<number | null>(null);

  const [filters, setFilters] = useState<UserFilterParams>({
    search: '',
    role: '',
    role_group: '', // Default to ALL users so everyone appears
    department_id: '',
    is_active: '',
    page: 1,
    per_page: 50, // Default 50 users per page
  });

  const [modalOpen, setModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  const [deleteConfirm, setDeleteConfirm] = useState<{ show: boolean; user: User | null }>({
    show: false,
    user: null,
  });

  const { data: usersData, isLoading } = useQuery({
    queryKey: ['users', filters],
    queryFn: () => usersApi.getUsers(filters),
  });

  const { data: rolesData } = useQuery({
    queryKey: ['roles'],
    queryFn: () => rolesApi.getRoles(),
  });

  const { data: deptsData } = useQuery({
    queryKey: ['departments'],
    queryFn: () => departmentsApi.getDepartments(),
  });

  const saveMutation = useMutation({
    mutationFn: async (data: UserFormData) => {
      if (selectedUser) {
        return await usersApi.updateUser(selectedUser.id, data);
      }
      return await usersApi.createUser(data);
    },
    onSuccess: (res) => {
      toast.success(res.message || 'User saved successfully.');
      setModalOpen(false);
      setSelectedUser(null);
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
  });

  const toggleStatusMutation = useMutation({
    mutationFn: async (id: number) => {
      return await usersApi.toggleStatus(id);
    },
    onSuccess: (res) => {
      toast.success(res.message || 'Status updated.');
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      return await usersApi.deleteUser(id);
    },
    onSuccess: () => {
      toast.success('User deleted successfully.');
      setDeleteConfirm({ show: false, user: null });
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
  });

  const handleOpenCreate = () => {
    setSelectedUser(null);
    setModalOpen(true);
  };

  const handleOpenEdit = (user: User) => {
    setSelectedUser(user);
    setModalOpen(true);
  };

  const handleFilterChange = (key: keyof UserFilterParams, val: any) => {
    setFilters((prev) => ({ ...prev, [key]: val, page: 1 }));
  };

  const copyPhonePassword = (u: User) => {
    if (u.phone) {
      navigator.clipboard.writeText(u.phone);
      setCopiedId(u.id);
      toast.info(`Copied password for ${u.name}: ${u.phone}`);
      setTimeout(() => setCopiedId(null), 2000);
    }
  };

  const counts = usersData?.meta?.counts;

  return (
    <div className="user-list-container">
      <div className="d-flex flex-column flex-sm-row align-items-stretch align-items-sm-center justify-content-between gap-3 mb-3">
        <div>
          <h2 className="fs-5 fw-bold text-dark mb-1">
            শিক্ষক ও কর্মী তালিকা (Faculty & Staff Management)
          </h2>
          <p className="text-muted fs-7 mb-0">
            বারিধারা স্কলার্স ইন্টারন্যাশনাল স্কুল অ্যান্ড কলেজ (BSISC) | মোট ব্যবহারকারী: <strong>{usersData?.meta?.total || counts?.all || 0}</strong> জন
          </p>
        </div>

        <Button
          variant="primary"
          className="d-flex align-items-center justify-content-center gap-2 rounded-3 fw-bold btn-institutional px-3 py-2 shadow-sm text-nowrap"
          onClick={handleOpenCreate}
        >
          <UserPlus size={18} />
          <span>নতুন ব্যবহারকারী যোগ করুন</span>
        </Button>
      </div>

      {/* Role Group Category Pills (All, Teachers, Leadership, Staff, Support) */}
      <div className="d-flex align-items-center gap-2 overflow-x-auto text-nowrap pb-2 mb-3">
        <Button
          variant={!filters.role_group ? 'dark' : 'outline-secondary'}
          size="sm"
          className="rounded-pill px-3 d-flex align-items-center gap-1.5 shadow-xs fw-semibold flex-shrink-0"
          onClick={() => handleFilterChange('role_group', '')}
        >
          <Users size={15} /> 👥 সকল কর্মী {counts?.all !== undefined ? `(${counts.all})` : ''}
        </Button>

        <Button
          variant={filters.role_group === 'teachers' ? 'success' : 'outline-secondary'}
          size="sm"
          className="rounded-pill px-3 d-flex align-items-center gap-1.5 shadow-xs fw-semibold flex-shrink-0"
          onClick={() => handleFilterChange('role_group', 'teachers')}
        >
          <GraduationCap size={15} /> 👨‍🏫 শিক্ষকবৃন্দ {counts?.teachers !== undefined ? `(${counts.teachers})` : ''}
        </Button>

        <Button
          variant={filters.role_group === 'leadership' ? 'primary' : 'outline-secondary'}
          size="sm"
          className="rounded-pill px-3 d-flex align-items-center gap-1.5 shadow-xs fw-semibold flex-shrink-0"
          onClick={() => handleFilterChange('role_group', 'leadership')}
        >
          🎓 অধ্যক্ষ ও উপাধ্যক্ষ {counts?.leadership !== undefined ? `(${counts.leadership})` : ''}
        </Button>

        <Button
          variant={filters.role_group === 'staff' ? 'info' : 'outline-secondary'}
          size="sm"
          className="rounded-pill px-3 d-flex align-items-center gap-1.5 shadow-xs fw-semibold text-dark flex-shrink-0"
          onClick={() => handleFilterChange('role_group', 'staff')}
        >
          <Briefcase size={15} /> 🏢 কর্মকর্তা ও অফিস {counts?.staff !== undefined ? `(${counts.staff})` : ''}
        </Button>

        <Button
          variant={filters.role_group === 'support' ? 'warning' : 'outline-secondary'}
          size="sm"
          className="rounded-pill px-3 d-flex align-items-center gap-1.5 shadow-xs fw-semibold text-dark flex-shrink-0"
          onClick={() => handleFilterChange('role_group', 'support')}
        >
          <Wrench size={15} /> 🛠️ সহায়ক কর্মী ও এটেনডেন্ট {counts?.support !== undefined ? `(${counts.support})` : ''}
        </Button>
      </div>

      <Card className="border-0 shadow-sm rounded-4 mb-4">
        <Card.Body className="p-3">
          <Row className="g-2 align-items-center">
            <Col xs={12} md={6} lg={4}>
              <SearchInput
                value={filters.search || ''}
                onChange={(val) => handleFilterChange('search', val)}
                placeholder="নাম, মোবাইল নম্বর, পদবি দিয়ে খুঁজুন..."
              />
            </Col>

            <Col xs={12} sm={6} md={3} lg={3}>
              <Form.Select
                size="sm"
                value={filters.role || ''}
                onChange={(e) => handleFilterChange('role', e.target.value)}
                className="fs-7"
              >
                <option value="">-- সুনির্দিষ্ট রোল (Role) --</option>
                {rolesData?.data?.map((r) => (
                  <option key={r.id} value={r.name}>
                    {r.display_name_bn}
                  </option>
                ))}
              </Form.Select>
            </Col>

            <Col xs={12} sm={6} md={3} lg={2}>
              <Form.Select
                size="sm"
                value={filters.department_id ? String(filters.department_id) : ''}
                onChange={(e) => handleFilterChange('department_id', e.target.value)}
                className="fs-7"
              >
                <option value="">-- সকল বিভাগ --</option>
                {deptsData?.data?.map((d) => (
                  <option key={d.id} value={String(d.id)}>
                    {d.name_bn}
                  </option>
                ))}
              </Form.Select>
            </Col>

            <Col xs={6} sm={6} md={6} lg={2}>
              <Form.Select
                size="sm"
                value={filters.is_active !== undefined ? String(filters.is_active) : ''}
                onChange={(e) => handleFilterChange('is_active', e.target.value)}
                className="fs-7"
              >
                <option value="">সকল স্ট্যাটাস</option>
                <option value="true">সক্রিয় (Active)</option>
                <option value="false">নিষ্ক্রিয় (Inactive)</option>
              </Form.Select>
            </Col>

            <Col xs={6} sm={6} md={6} lg={1} className="text-end">
              <Button
                variant="outline-secondary"
                size="sm"
                className="w-100 fs-7"
                onClick={() => setFilters({ search: '', role: '', role_group: '', department_id: '', is_active: '', page: 1, per_page: 50 })}
                title="ফিল্টার মুছুন"
              >
                রিসেট
              </Button>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      <Card className="border-0 shadow-sm rounded-4 overflow-hidden mb-4">
        <Card.Body className="p-0">
          {isLoading ? (
            <LoadingSpinner message="ব্যবহারকারীদের তালিকা লোড হচ্ছে..." />
          ) : (
            <>
              {/* Desktop & Tablet Table View (Hidden on Mobile) */}
              <div className="table-responsive d-none d-md-block">
                <Table hover className="align-middle mb-0 fs-7">
                  <thead className="table-light">
                    <tr>
                      <th className="ps-3 text-center" style={{ width: '70px' }}>SL</th>
                      <th style={{ width: '100px' }}>EMP ID</th>
                      <th>নাম, সম্বোধন ও পদবি</th>
                      <th>যোগাযোগ ও লগইন তথ্য (Phone = Password)</th>
                      <th>বিভাগ</th>
                      <th>ভূমিকা (Role)</th>
                      <th>স্ট্যাটাস</th>
                      <th className="text-end pe-4">অ্যাকশন</th>
                    </tr>
                  </thead>
                  <tbody>
                    {usersData?.data && usersData.data.length > 0 ? (
                      usersData.data.map((u) => (
                        <tr key={u.id}>
                          <td className="ps-3 text-center">
                            {u.serial_number !== undefined && u.serial_number !== null ? (
                              <span className="badge bg-light text-dark border fw-bold font-monospace px-2 py-1 fs-8">
                                {u.serial_number}
                              </span>
                            ) : (
                              <span className="text-muted fs-8">-</span>
                            )}
                          </td>

                          <td>
                            {u.employee_id ? (
                              <span className="badge bg-primary-subtle text-primary border border-primary-subtle font-monospace px-2 py-1 fs-8">
                                {u.employee_id}
                              </span>
                            ) : (
                              <span className="text-muted fs-8">-</span>
                            )}
                          </td>

                          <td>
                            <div className="d-flex align-items-center gap-2.5">
                              <div className={`avatar-circle ${u.gender === 'Female' ? 'bg-danger-subtle text-danger' : 'bg-primary-subtle text-primary'} fw-bold`}>
                                {u.name.charAt(0).toUpperCase()}
                              </div>
                              <div>
                                <div className="d-flex align-items-center gap-1.5 flex-wrap">
                                  {u.salutation && (
                                    <Badge
                                      bg={u.salutation.toLowerCase().includes('madam') ? 'danger' : 'primary'}
                                      className="fs-9 fw-bold px-1.5 py-0.5"
                                    >
                                      {u.salutation}
                                    </Badge>
                                  )}
                                  <span className="fw-bold text-dark">{u.name}</span>
                                  {u.gender && (
                                    <Badge bg="light" className="text-muted border fs-9 px-1">
                                      {u.gender === 'Female' ? '♀ Female' : '♂ Male'}
                                    </Badge>
                                  )}
                                </div>
                                <small className="text-secondary fw-medium d-block mt-0.5">
                                  {u.designation || 'Faculty Member'}
                                </small>
                              </div>
                            </div>
                          </td>

                          <td>
                            <div className="font-monospace text-dark fs-8">{u.email}</div>
                            {u.phone ? (
                              <div className="d-flex align-items-center gap-1 mt-1">
                                <span className="font-monospace text-primary fw-semibold fs-8">
                                  📱 {u.phone}
                                </span>
                                <Button
                                  variant="outline-secondary"
                                  size="sm"
                                  className="py-0 px-1 fs-9 d-inline-flex align-items-center gap-1 text-muted"
                                  title="লগইন পাসওয়ার্ড (ফোন নম্বর) কপি করুন"
                                  onClick={() => copyPhonePassword(u)}
                                >
                                  {copiedId === u.id ? <Check size={11} className="text-success" /> : <Copy size={11} />}
                                  <span>{copiedId === u.id ? 'কপি হয়েছে' : 'কপি পাস'}</span>
                                </Button>
                              </div>
                            ) : (
                              <small className="text-muted">ফোন নম্বর নেই</small>
                            )}
                          </td>

                          <td>
                            {u.department ? (
                              <span className="badge bg-light text-dark border fw-medium">
                                {u.department.name_bn}
                              </span>
                            ) : (
                              <span className="text-muted fs-8">সাধারণ / প্রশাসন</span>
                            )}
                          </td>

                          <td>
                            <div className="d-flex flex-wrap gap-1">
                              {u.roles.map((r) => (
                                <Badge
                                  key={r.id}
                                  bg={
                                    r.name === 'super_admin'
                                      ? 'danger'
                                      : r.name === 'principal'
                                      ? 'primary'
                                      : r.name === 'academic_coordinator'
                                      ? 'info'
                                      : r.name === 'teacher'
                                      ? 'success'
                                      : r.name === 'staff'
                                      ? 'secondary'
                                      : 'warning'
                                  }
                                  className="fw-medium px-2 py-1"
                                >
                                  {r.display_name_bn}
                                </Badge>
                              ))}
                            </div>
                          </td>

                          <td>
                            <Badge
                              bg={u.is_active ? 'success' : 'secondary'}
                              className="fw-semibold px-2 py-1"
                            >
                              {u.is_active ? 'সক্রিয় (Active)' : 'নিষ্ক্রিয়'}
                            </Badge>
                          </td>

                          <td className="text-end pe-4">
                            <div className="d-inline-flex align-items-center gap-1">
                              <Button
                                variant="outline-primary"
                                size="sm"
                                className="p-1 px-2 fs-8"
                                title="সম্পাদনা করুন"
                                onClick={() => handleOpenEdit(u)}
                              >
                                <Edit2 size={14} />
                              </Button>

                              <Button
                                variant={u.is_active ? 'outline-warning' : 'outline-success'}
                                size="sm"
                                className="p-1 px-2 fs-8"
                                title={u.is_active ? 'নিষ্ক্রিয় করুন' : 'সক্রিয় করুন'}
                                onClick={() => toggleStatusMutation.mutate(u.id)}
                              >
                                <Power size={14} />
                              </Button>

                              <Button
                                variant="outline-danger"
                                size="sm"
                                className="p-1 px-2 fs-8"
                                title="মুছে ফেলুন"
                                onClick={() => setDeleteConfirm({ show: true, user: u })}
                              >
                                <Trash2 size={14} />
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={8} className="text-center py-5 text-muted">
                          কোন ব্যবহারকারী পাওয়া যায়নি।
                        </td>
                      </tr>
                    )}
                  </tbody>
                </Table>
              </div>

              {/* Mobile Card List View (Visible on Mobile Only) */}
              <div className="d-md-none p-2 d-flex flex-column gap-2.5">
                {usersData?.data && usersData.data.length > 0 ? (
                  usersData.data.map((u) => (
                    <Card key={u.id} className="border border-light-subtle shadow-xs rounded-3 overflow-hidden">
                      <Card.Body className="p-3">
                        {/* Card Header: Avatar, Name, Gender, Status */}
                        <div className="d-flex align-items-start justify-content-between gap-2 mb-2">
                          <div className="d-flex align-items-center gap-2">
                            <div className={`avatar-circle ${u.gender === 'Female' ? 'bg-danger-subtle text-danger' : 'bg-primary-subtle text-primary'} fw-bold`}>
                              {u.name.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <div className="d-flex align-items-center gap-1 flex-wrap">
                                {u.salutation && (
                                  <Badge
                                    bg={u.salutation.toLowerCase().includes('madam') ? 'danger' : 'primary'}
                                    className="fs-9 fw-bold px-1.5 py-0.5"
                                  >
                                    {u.salutation}
                                  </Badge>
                                )}
                                <span className="fw-bold text-dark fs-7">{u.name}</span>
                              </div>
                              <div className="d-flex align-items-center gap-1 text-secondary fs-8 mt-0.5">
                                <span>{u.designation || 'Faculty Member'}</span>
                                {u.department && (
                                  <>
                                    <span>•</span>
                                    <span className="text-primary fw-medium">{u.department.name_bn}</span>
                                  </>
                                )}
                              </div>
                            </div>
                          </div>

                          <div className="d-flex flex-column align-items-end gap-1">
                            {u.serial_number !== undefined && u.serial_number !== null ? (
                              <span className="badge bg-light text-dark border font-monospace fs-9">
                                #{u.serial_number}
                              </span>
                            ) : null}
                            <Badge bg={u.is_active ? 'success' : 'secondary'} className="fs-9 px-1.5 py-0.5">
                              {u.is_active ? 'সক্রিয়' : 'নিষ্ক্রিয়'}
                            </Badge>
                          </div>
                        </div>

                        {/* Contact & Password details */}
                        <div className="bg-light p-2 rounded-2 mb-2 fs-8">
                          <div className="text-muted text-truncate mb-1">
                            ✉️ <span className="font-monospace text-dark">{u.email}</span>
                          </div>
                          {u.phone ? (
                            <div className="d-flex align-items-center justify-content-between gap-1">
                              <span className="font-monospace text-primary fw-bold">
                                📱 {u.phone}
                              </span>
                              <Button
                                variant="outline-primary"
                                size="sm"
                                className="py-0 px-2 fs-9 d-inline-flex align-items-center gap-1"
                                onClick={() => copyPhonePassword(u)}
                              >
                                {copiedId === u.id ? <Check size={11} className="text-success" /> : <Copy size={11} />}
                                <span>{copiedId === u.id ? 'কপি হয়েছে' : 'পাসওয়ার্ড কপি'}</span>
                              </Button>
                            </div>
                          ) : (
                            <span className="text-muted fs-9">ফোন নম্বর নেই</span>
                          )}
                        </div>

                        {/* Roles */}
                        <div className="d-flex flex-wrap gap-1 mb-3">
                          {u.roles.map((r) => (
                            <Badge
                              key={r.id}
                              bg={
                                r.name === 'super_admin'
                                  ? 'danger'
                                  : r.name === 'principal'
                                  ? 'primary'
                                  : r.name === 'academic_coordinator'
                                  ? 'info'
                                  : r.name === 'teacher'
                                  ? 'success'
                                  : r.name === 'staff'
                                  ? 'secondary'
                                  : 'warning'
                              }
                              className="fw-medium fs-9 px-2 py-0.5"
                            >
                              {r.display_name_bn}
                            </Badge>
                          ))}
                        </div>

                        {/* Mobile Action Buttons */}
                        <div className="d-grid grid-cols-3 gap-1 pt-2 border-top" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr' }}>
                          <Button
                            variant="outline-primary"
                            size="sm"
                            className="fs-8 py-1.5 d-flex align-items-center justify-content-center gap-1 rounded-2"
                            onClick={() => handleOpenEdit(u)}
                          >
                            <Edit2 size={13} />
                            <span>এডিট</span>
                          </Button>

                          <Button
                            variant={u.is_active ? 'outline-warning' : 'outline-success'}
                            size="sm"
                            className="fs-8 py-1.5 d-flex align-items-center justify-content-center gap-1 rounded-2"
                            onClick={() => toggleStatusMutation.mutate(u.id)}
                          >
                            <Power size={13} />
                            <span>{u.is_active ? 'বন্ধ করুন' : 'সক্রিয়'}</span>
                          </Button>

                          <Button
                            variant="outline-danger"
                            size="sm"
                            className="fs-8 py-1.5 d-flex align-items-center justify-content-center gap-1 rounded-2"
                            onClick={() => setDeleteConfirm({ show: true, user: u })}
                          >
                            <Trash2 size={13} />
                            <span>মুছুন</span>
                          </Button>
                        </div>
                      </Card.Body>
                    </Card>
                  ))
                ) : (
                  <div className="text-center py-5 text-muted fs-7">
                    কোন ব্যবহারকারী পাওয়া যায়নি।
                  </div>
                )}
              </div>
            </>
          )}
        </Card.Body>

        {usersData?.meta && (
          <Card.Footer className="bg-white border-top">
            <Pagination
              currentPage={usersData.meta.current_page}
              lastPage={usersData.meta.last_page}
              total={usersData.meta.total}
              perPage={usersData.meta.per_page}
              onPageChange={(p) => handleFilterChange('page', p)}
              onPerPageChange={(pp) => handleFilterChange('per_page', pp)}
            />
          </Card.Footer>
        )}
      </Card>

      <UserModal
        show={modalOpen}
        user={selectedUser}
        isLoading={saveMutation.isPending}
        onHide={() => {
          setModalOpen(false);
          setSelectedUser(null);
        }}
        onSubmit={(data) => saveMutation.mutate(data)}
      />

      <ConfirmDialog
        show={deleteConfirm.show}
        title="ব্যবহারকারী মুছে ফেলার নিশ্চিতকরণ"
        message={`আপনি কি নিশ্চিতভাবে "${deleteConfirm.user?.name}"-এর অ্যাকাউন্ট মুছে ফেলতে চান?`}
        confirmText="মুছে ফেলুন"
        variant="danger"
        isLoading={deleteMutation.isPending}
        onConfirm={() => deleteConfirm.user && deleteMutation.mutate(deleteConfirm.user.id)}
        onCancel={() => setDeleteConfirm({ show: false, user: null })}
      />
    </div>
  );
};