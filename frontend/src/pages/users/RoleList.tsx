import React, { useState } from 'react';
import { Card, Row, Col, Badge, Button, Modal, Form } from 'react-bootstrap';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Shield, ShieldCheck, Key } from 'lucide-react';
import { rolesApi } from '../../api/roles';
import { LoadingSpinner } from '../../components/feedback/LoadingSpinner';
import { toast } from 'react-toastify';
import type { Role } from '../../types/auth';
import type { Permission } from '../../api/roles';

export const RoleList: React.FC = () => {
  const queryClient = useQueryClient();

  const [selectedRole, setSelectedRole] = useState<Role | null>(null);
  const [selectedPermissionIds, setSelectedPermissionIds] = useState<number[]>([]);

  const { data: rolesData, isLoading: rolesLoading } = useQuery({
    queryKey: ['roles'],
    queryFn: () => rolesApi.getRoles(),
  });

  const { data: permissionsData } = useQuery({
    queryKey: ['permissions'],
    queryFn: () => rolesApi.getPermissions(),
  });

  const updatePermissionsMutation = useMutation({
    mutationFn: async () => {
      if (!selectedRole) return;
      return await rolesApi.updateRolePermissions(selectedRole.id, selectedPermissionIds);
    },
    onSuccess: (res) => {
      toast.success(res?.message || 'Permissions updated successfully.');
      setSelectedRole(null);
      queryClient.invalidateQueries({ queryKey: ['roles'] });
    },
  });

  const handleOpenManage = (role: Role) => {
    setSelectedRole(role);
    rolesApi.getRole(role.id).then((res) => {
      setSelectedPermissionIds(res.data.permissions.map((p) => p.id));
    });
  };

  const handleTogglePermission = (id: number) => {
    setSelectedPermissionIds((prev) =>
      prev.includes(id) ? prev.filter((pId) => pId !== id) : [...prev, id]
    );
  };

  const handleSelectAllInModule = (modulePermissions: Permission[]) => {
    const ids = modulePermissions.map((p) => p.id);
    const allSelected = ids.every((id) => selectedPermissionIds.includes(id));

    if (allSelected) {
      setSelectedPermissionIds((prev) => prev.filter((id) => !ids.includes(id)));
    } else {
      setSelectedPermissionIds((prev) => Array.from(new Set([...prev, ...ids])));
    }
  };

  return (
    <div className="role-list-container">
      <div className="mb-4">
        <h2 className="fs-5 fw-bold text-dark mb-1">
          ভূমিকা ও অনুমতি ব্যবস্থাপনা (Roles & Permissions)
        </h2>
        <p className="text-muted fs-7 mb-0">
          সিস্টেমের বিভিন্ন ইউজার রোলের জন্য মডিউলার অ্যাক্সেস কন্ট্রোল ও অনুমতি কনফিগার করুন
        </p>
      </div>

      {rolesLoading ? (
        <LoadingSpinner message="ভূমিকা তালিকা লোড হচ্ছে..." />
      ) : (
        <Row className="g-4">
          {rolesData?.data?.map((role) => (
            <Col key={role.id} md={6} xl={3}>
              <Card className="border-0 shadow-sm rounded-4 h-100 stat-card">
                <Card.Body className="p-4 d-flex flex-column justify-content-between">
                  <div>
                    <div className="d-flex align-items-center justify-content-between mb-3">
                      <div className="avatar-circle" style={{ backgroundColor: '#0f2e5a' }}>
                        <Shield size={18} />
                      </div>
                      <Badge bg="primary-subtle" className="text-primary font-monospace fw-semibold px-2 py-1">
                        {role.name}
                      </Badge>
                    </div>

                    <h4 className="fs-6 fw-bold text-dark mb-1">{role.display_name_bn}</h4>
                    <h5 className="fs-7 text-muted mb-2">{role.display_name_en}</h5>
                    <p className="fs-8 text-secondary mb-3">
                      {role.description || 'Institutional role definition.'}
                    </p>
                  </div>

                  <div className="pt-3 border-top">
                    {role.name === 'super_admin' ? (
                      <div className="d-flex align-items-center gap-1.5 text-success fs-8 fw-semibold py-1">
                        <ShieldCheck size={16} />
                        <span>সর্বোচ্চ সিস্টেম এক্সেস (Unrestricted Access)</span>
                      </div>
                    ) : (
                      <Button
                        variant="outline-primary"
                        size="sm"
                        className="w-100 fw-semibold d-flex align-items-center justify-content-center gap-1.5"
                        onClick={() => handleOpenManage(role)}
                      >
                        <Key size={14} />
                        <span>অনুমতি পরিচালনা করুন</span>
                      </Button>
                    )}
                  </div>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
      )}

      <Modal
        show={!!selectedRole}
        onHide={() => setSelectedRole(null)}
        size="lg"
        centered
        backdrop="static"
      >
        <Modal.Header closeButton className="bg-light">
          <Modal.Title className="fs-6 fw-bold text-dark d-flex align-items-center gap-2">
            <Key size={18} className="text-primary" />
            <span>
              অনুমতি কনফিগারেশন: {selectedRole?.display_name_bn} ({selectedRole?.display_name_en})
            </span>
          </Modal.Title>
        </Modal.Header>

        <Modal.Body className="p-4" style={{ maxHeight: '70vh', overflowY: 'auto' }}>
          {permissionsData?.data &&
            Object.entries(permissionsData.data).map(([module, perms]) => {
              const allChecked = perms.every((p) => selectedPermissionIds.includes(p.id));

              return (
                <div key={module} className="mb-4 pb-3 border-bottom">
                  <div className="d-flex align-items-center justify-content-between mb-2">
                    <h6 className="fs-7 fw-bold text-uppercase text-primary mb-0">
                      📦 {module.toUpperCase()} MODULE
                    </h6>
                    <Button
                      variant="link"
                      size="sm"
                      className="p-0 fs-8 text-decoration-none fw-semibold"
                      onClick={() => handleSelectAllInModule(perms)}
                    >
                      {allChecked ? 'সব বাতিল করুন' : 'মডিউলের সব নির্বাচন করুন'}
                    </Button>
                  </div>

                  <Row className="g-2">
                    {perms.map((p) => {
                      const isChecked = selectedPermissionIds.includes(p.id);
                      return (
                        <Col key={p.id} sm={6}>
                          <div
                            className={`p-2 rounded border cursor-pointer ${
                              isChecked ? 'border-primary bg-primary-subtle' : 'border-light-subtle bg-light'
                            }`}
                            onClick={() => handleTogglePermission(p.id)}
                            style={{ cursor: 'pointer' }}
                          >
                            <Form.Check
                              type="checkbox"
                              id={`perm-${p.id}`}
                              label={
                                <div>
                                  <div className="fs-8 fw-semibold text-dark">{p.display_name_bn}</div>
                                  <small className="text-muted font-monospace fs-9">{p.name}</small>
                                </div>
                              }
                              checked={isChecked}
                              onChange={() => {}}
                            />
                          </div>
                        </Col>
                      );
                    })}
                  </Row>
                </div>
              );
            })}
        </Modal.Body>

        <Modal.Footer className="bg-light">
          <Button variant="secondary" size="sm" onClick={() => setSelectedRole(null)}>
            বাতিল
          </Button>
          <Button
            variant="primary"
            size="sm"
            className="btn-institutional"
            onClick={() => updatePermissionsMutation.mutate()}
            disabled={updatePermissionsMutation.isPending}
          >
            {updatePermissionsMutation.isPending ? 'সংরক্ষণ হচ্ছে...' : 'অনুমতি সংরক্ষণ করুন'}
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};