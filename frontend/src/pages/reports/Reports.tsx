import React, { useState, useEffect } from 'react';
import { Card, Table, Button, Tab, Tabs } from 'react-bootstrap';
import { useTranslation } from '../../locales/i18n';
import { Download } from 'lucide-react';
import { reportsApi } from '../../api/reports';
import type { ReportSummaryData } from '../../types/report';

export const Reports: React.FC = () => {
  const { t } = useTranslation();
  const [data, setData] = useState<ReportSummaryData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadReports();
  }, []);

  const loadReports = async () => {
    try {
      const res = await reportsApi.getSummary();
      setData(res.data);
    } catch (err) {
      console.error('Failed to load reports', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="p-4 text-center">Loading academic compliance reports...</div>;
  }

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h4 className="fw-bold mb-0">{t('nav.reports')}</h4>
          <span className="text-muted small">
            Departmental & Teacher Lesson Plan Compliance, Quality Metrics & Data Export
          </span>
        </div>
        <Button
          variant="success"
          size="sm"
          onClick={() => window.open('/api/v1/reports/export/excel', '_blank')}
        >
          <Download size={15} className="me-1" /> Export Master CSV/Excel
        </Button>
      </div>

      <Tabs defaultActiveKey="departments" className="mb-4">
        <Tab eventKey="departments" title="Departmental Compliance">
          <Card className="border shadow-sm">
            <Card.Header className="bg-white py-3">
              <h6 className="fw-bold mb-0">Departmental Submission & Approval Matrix</h6>
            </Card.Header>
            <Card.Body className="p-0">
              <Table responsive hover className="align-middle mb-0">
                <thead className="table-light">
                  <tr>
                    <th>Department</th>
                    <th>Code</th>
                    <th className="text-center">Total Plans</th>
                    <th className="text-center">Approved</th>
                    <th className="text-center">Pending Review</th>
                    <th className="text-center">Returned</th>
                    <th className="text-center">Approval Rate</th>
                  </tr>
                </thead>
                <tbody>
                  {data?.department_summary.map((dept) => {
                    const rate = dept.total_plans > 0 ? Math.round((dept.approved_plans / dept.total_plans) * 100) : 0;
                    return (
                      <tr key={dept.id}>
                        <td className="fw-bold">{dept.name_en} ({dept.name_bn})</td>
                        <td><span className="badge bg-light text-dark border">{dept.code}</span></td>
                        <td className="text-center fw-bold">{dept.total_plans}</td>
                        <td className="text-center text-success fw-bold">{dept.approved_plans}</td>
                        <td className="text-center text-info fw-bold">{dept.submitted_plans}</td>
                        <td className="text-center text-warning fw-bold">{dept.returned_plans}</td>
                        <td className="text-center">
                          <span className={`badge ${rate >= 80 ? 'bg-success' : rate >= 50 ? 'bg-warning' : 'bg-secondary'}`}>
                            {rate}%
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </Table>
            </Card.Body>
          </Card>
        </Tab>

        <Tab eventKey="teachers" title="Teacher Performance & Submission Logs">
          <Card className="border shadow-sm">
            <Card.Header className="bg-white py-3">
              <h6 className="fw-bold mb-0">Teacher Compliance Overview</h6>
            </Card.Header>
            <Card.Body className="p-0">
              <Table responsive hover className="align-middle mb-0">
                <thead className="table-light">
                  <tr>
                    <th>Teacher Name</th>
                    <th>Department</th>
                    <th className="text-center">Total Created</th>
                    <th className="text-center">Approved</th>
                    <th className="text-center">Pending Review</th>
                    <th className="text-center">Needs Correction</th>
                    <th className="text-center">Approval Rate</th>
                  </tr>
                </thead>
                <tbody>
                  {data?.teachers_summary.map((tch) => {
                    const rate = tch.total_plans > 0 ? Math.round((tch.approved_plans / tch.total_plans) * 100) : 0;
                    return (
                      <tr key={tch.id}>
                        <td>
                          <div className="fw-bold">{tch.name}</div>
                          <div className="text-muted small">{tch.email}</div>
                        </td>
                        <td>{tch.department?.name_en || 'General'}</td>
                        <td className="text-center fw-bold">{tch.total_plans}</td>
                        <td className="text-center text-success fw-bold">{tch.approved_plans}</td>
                        <td className="text-center text-info fw-bold">{tch.pending_plans}</td>
                        <td className="text-center text-warning fw-bold">{tch.returned_plans}</td>
                        <td className="text-center">
                          <span className={`badge ${rate >= 80 ? 'bg-success' : rate >= 50 ? 'bg-warning' : 'bg-secondary'}`}>
                            {rate}%
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </Table>
            </Card.Body>
          </Card>
        </Tab>
      </Tabs>
    </div>
  );
};