import React, { useState, useEffect } from 'react';
import { Card, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { useTranslation } from '../../locales/i18n';
import { ChevronLeft, ChevronRight, Plus } from 'lucide-react';
import { calendarApi } from '../../api/calendar';
import type { LessonPlan } from '../../types/lessonPlan';

export const LessonPlanCalendar: React.FC = () => {
  const { t, language } = useTranslation();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [events, setEvents] = useState<LessonPlan[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchEvents();
  }, [currentDate]);

  const fetchEvents = async () => {
    setLoading(true);
    try {
      const year = currentDate.getFullYear();
      const month = currentDate.getMonth();
      const startDate = new Date(year, month, 1).toISOString().split('T')[0];
      const endDate = new Date(year, month + 1, 0).toISOString().split('T')[0];

      const res = await calendarApi.getCalendarEvents({ start_date: startDate, end_date: endDate });
      setEvents(res.data || []);
    } catch (err) {
      console.error('Failed to fetch calendar events', err);
    } finally {
      setLoading(false);
    }
  };

  const handlePrevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const handleToday = () => {
    setCurrentDate(new Date());
  };

  // Calendar Grid generation
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const monthName = currentDate.toLocaleString('default', { month: 'long' });

  const firstDayIndex = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const days: { dayNumber: number; dateStr: string; isCurrentMonth: boolean }[] = [];

  // Padding days from previous month
  const prevMonthDays = new Date(year, month, 0).getDate();
  for (let i = firstDayIndex - 1; i >= 0; i--) {
    const d = prevMonthDays - i;
    const m = month === 0 ? 12 : month;
    const y = month === 0 ? year - 1 : year;
    const dateStr = `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    days.push({ dayNumber: d, dateStr, isCurrentMonth: false });
  }

  // Days in current month
  for (let i = 1; i <= daysInMonth; i++) {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
    days.push({ dayNumber: i, dateStr, isCurrentMonth: true });
  }

  // Group events by date
  const eventsByDate: Record<string, LessonPlan[]> = {};
  events.forEach((ev) => {
    const d = ev.lesson_date;
    if (!eventsByDate[d]) eventsByDate[d] = [];
    eventsByDate[d].push(ev);
  });

  const getStatusColor = (st: string) => {
    switch (st) {
      case 'approved': return 'success';
      case 'submitted': return 'primary';
      case 'under_review': return 'info';
      case 'returned': return 'warning';
      case 'rejected': return 'danger';
      default: return 'secondary';
    }
  };

  const weekDayHeaders = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  if (loading) {
    return <div className="p-4 text-center">Loading curriculum calendar...</div>;
  }

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h4 className="fw-bold mb-0">Curriculum Schedule Calendar</h4>
          <span className="text-muted small">Month-at-a-glance view of scheduled classroom lesson plans</span>
        </div>
        <div className="d-flex gap-2 align-items-center">
          <Button variant="outline-secondary" size="sm" onClick={handleToday}>
            Today
          </Button>
          <div className="btn-group btn-group-sm">
            <Button variant="outline-primary" onClick={handlePrevMonth}>
              <ChevronLeft size={16} />
            </Button>
            <span className="btn btn-outline-primary active fw-bold px-3">
              {monthName} {year}
            </span>
            <Button variant="outline-primary" onClick={handleNextMonth}>
              <ChevronRight size={16} />
            </Button>
          </div>
          <Link to="/lesson-plans/create" className="btn btn-primary btn-sm ms-2">
            <Plus size={16} className="me-1" /> {t('nav.create_lesson_plan')}
          </Link>
        </div>
      </div>

      <Card className="border shadow-sm">
        <Card.Body className="p-0">
          {/* Weekday Header */}
          <div className="d-grid" style={{ gridTemplateColumns: 'repeat(7, 1fr)', borderBottom: '2px solid #0f2e5a' }}>
            {weekDayHeaders.map((wd) => (
              <div key={wd} className="text-center py-2 fw-bold text-primary bg-light small">
                {wd}
              </div>
            ))}
          </div>

          {/* Calendar Day Grid */}
          <div className="d-grid" style={{ gridTemplateColumns: 'repeat(7, 1fr)' }}>
            {days.map((d, idx) => {
              const dayEvents = eventsByDate[d.dateStr] || [];
              const isToday = d.dateStr === new Date().toISOString().split('T')[0];

              return (
                <div
                  key={idx}
                  className={`p-2 border-end border-bottom ${d.isCurrentMonth ? (isToday ? 'bg-light' : 'bg-white') : 'bg-light opacity-50'}`}
                  style={{ minHeight: '120px' }}
                >
                  <div className="d-flex justify-content-between align-items-center mb-1">
                    <span className={`small fw-bold ${isToday ? 'badge bg-primary rounded-circle p-1' : 'text-muted'}`} style={isToday ? { width: 22, height: 22 } : {}}>
                      {d.dayNumber}
                    </span>
                    {dayEvents.length > 0 && (
                      <span className="badge bg-secondary-subtle text-secondary" style={{ fontSize: '10px' }}>
                        {dayEvents.length} Plan{dayEvents.length > 1 ? 's' : ''}
                      </span>
                    )}
                  </div>

                  <div className="d-flex flex-column gap-1 overflow-auto" style={{ maxHeight: '90px' }}>
                    {dayEvents.map((ev) => (
                      <Link
                        key={ev.id}
                        to={`/lesson-plans/${ev.id}`}
                        className="text-decoration-none"
                      >
                        <div
                          className={`p-1 rounded small border-start border-3 border-${getStatusColor(ev.status)} bg-light text-dark shadow-xs`}
                          style={{ fontSize: '11px', lineHeight: '1.2' }}
                        >
                          <div className="fw-semibold text-truncate">{ev.title}</div>
                          <div className="text-muted" style={{ fontSize: '10px' }}>
                            P{ev.period_number} | {language === 'bn' ? ev.subject?.name_bn : ev.subject?.name_en}
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </Card.Body>
      </Card>
    </div>
  );
};