'use client';

import { useEffect, useState } from 'react';
import AdminLayout from '@/components/admin/AdminLayout';
import api from '@/lib/api';

interface Appointment {
  id: string;
  startTime: string;
  endTime: string;
  status: string;
  client?: {
    user?: {
      firstName: string;
      lastName: string;
    };
  };
  employee?: {
    user?: {
      firstName: string;
      lastName: string;
    };
  };
}

const DAYS_OF_WEEK = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
];

type ViewMode = 'daily' | 'weekly' | 'monthly' | 'list';

export default function AppointmentsPage() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(new Date());
  const [viewMode, setViewMode] = useState<ViewMode>('monthly');

  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        const res = await api.get('/appointments');
        setAppointments(res.data || []);
      } catch (error) {
        console.error('Failed to fetch appointments:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAppointments();
  }, []);

  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const getAppointmentsForDate = (date: Date) => {
    return appointments.filter((apt) => {
      const aptDate = new Date(apt.startTime);
      return (
        aptDate.getDate() === date.getDate() &&
        aptDate.getMonth() === date.getMonth() &&
        aptDate.getFullYear() === date.getFullYear()
      );
    });
  };

  const getSelectedDateAppointments = () => {
    if (!selectedDate) return [];
    return getAppointmentsForDate(selectedDate);
  };

  const getWeekStart = (date: Date) => {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day;
    return new Date(d.setDate(diff));
  };

  const getWeekAppointments = () => {
    if (!selectedDate) return [];
    const weekStart = getWeekStart(selectedDate);
    const weekEnd = new Date(weekStart.getTime() + 7 * 24 * 60 * 60 * 1000);
    
    return appointments.filter((apt) => {
      const aptDate = new Date(apt.startTime);
      return aptDate >= weekStart && aptDate < weekEnd;
    });
  };

  const getDayAppointments = () => {
    if (!selectedDate) return [];
    return getAppointmentsForDate(selectedDate);
  };

  const previousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1));
  };

  const todayDate = new Date();
  const daysInMonth = getDaysInMonth(currentDate);
  const firstDay = getFirstDayOfMonth(currentDate);
  const days = [];

  // Empty cells for days before month starts
  for (let i = 0; i < firstDay; i++) {
    days.push(null);
  }

  // Days of the month
  for (let i = 1; i <= daysInMonth; i++) {
    days.push(new Date(currentDate.getFullYear(), currentDate.getMonth(), i));
  }

  const isToday = (date: Date | null) => {
    if (!date) return false;
    return (
      date.getDate() === todayDate.getDate() &&
      date.getMonth() === todayDate.getMonth() &&
      date.getFullYear() === todayDate.getFullYear()
    );
  };

  const isSelected = (date: Date | null) => {
    if (!date || !selectedDate) return false;
    return (
      date.getDate() === selectedDate.getDate() &&
      date.getMonth() === selectedDate.getMonth() &&
      date.getFullYear() === selectedDate.getFullYear()
    );
  };

  const statusColors: Record<string, string> = {
    PENDING: 'bg-yellow-100 text-yellow-800',
    CONFIRMED: 'bg-blue-100 text-blue-800',
    IN_PROGRESS: 'bg-purple-100 text-purple-800',
    COMPLETED: 'bg-green-100 text-green-800',
    CANCELLED: 'bg-red-100 text-red-800',
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header with View Toggle */}
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Appointment Calendar</h1>
            <p className="text-slate-600 mt-1">Manage all salon appointments</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setViewMode('daily')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                viewMode === 'daily'
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-200 text-slate-900 hover:bg-slate-300'
              }`}
            >
              Daily
            </button>
            <button
              onClick={() => setViewMode('weekly')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                viewMode === 'weekly'
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-200 text-slate-900 hover:bg-slate-300'
              }`}
            >
              Weekly
            </button>
            <button
              onClick={() => setViewMode('monthly')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                viewMode === 'monthly'
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-200 text-slate-900 hover:bg-slate-300'
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                viewMode === 'list'
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-200 text-slate-900 hover:bg-slate-300'
              }`}
            >
              List
            </button>
          </div>
        </div>

        {/* Daily View */}
        {viewMode === 'daily' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 bg-white rounded-lg border border-slate-200 p-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-bold text-slate-900">
                    {selectedDate
                      ? selectedDate.toLocaleDateString('en-US', {
                          weekday: 'long',
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                        })
                      : 'Select a date'}
                  </h2>
                  <div className="flex gap-2">
                    <button
                      onClick={() =>
                        setSelectedDate(
                          new Date(
                            (selectedDate || new Date()).getTime() - 24 * 60 * 60 * 1000
                          )
                        )
                      }
                      className="px-3 py-2 bg-slate-200 hover:bg-slate-300 rounded-lg transition-colors"
                    >
                      ← Prev
                    </button>
                    <button
                      onClick={() => setSelectedDate(new Date())}
                      className="px-3 py-2 bg-blue-600 text-white hover:bg-blue-700 rounded-lg transition-colors"
                    >
                      Today
                    </button>
                    <button
                      onClick={() =>
                        setSelectedDate(
                          new Date(
                            (selectedDate || new Date()).getTime() + 24 * 60 * 60 * 1000
                          )
                        )
                      }
                      className="px-3 py-2 bg-slate-200 hover:bg-slate-300 rounded-lg transition-colors"
                    >
                      Next →
                    </button>
                  </div>
                </div>

                {loading ? (
                  <div className="text-center py-8 text-slate-600">Loading...</div>
                ) : getDayAppointments().length === 0 ? (
                  <div className="text-center py-8 text-slate-600">No appointments for this day</div>
                ) : (
                  <div className="space-y-3">
                    {getDayAppointments()
                      .sort(
                        (a, b) =>
                          new Date(a.startTime).getTime() - new Date(b.startTime).getTime()
                      )
                      .map((apt) => {
                        const startTime = new Date(apt.startTime);
                        const endTime = new Date(apt.endTime);
                        const clientName = apt.client?.user
                          ? `${apt.client.user.firstName} ${apt.client.user.lastName}`
                          : 'Unknown';
                        const employeeName = apt.employee?.user
                          ? `${apt.employee.user.firstName} ${apt.employee.user.lastName}`
                          : 'Unassigned';

                        return (
                          <div
                            key={apt.id}
                            className="border border-slate-200 rounded-lg p-4 bg-slate-50 hover:bg-slate-100 transition-colors"
                          >
                            <div className="flex items-start justify-between">
                              <div>
                                <div className="font-semibold text-slate-900">
                                  {startTime.getHours()}:{String(startTime.getMinutes()).padStart(2, '0')} -{' '}
                                  {endTime.getHours()}:{String(endTime.getMinutes()).padStart(2, '0')}
                                </div>
                                <div className="text-sm text-slate-600 mt-1">
                                  <div>
                                    <strong>Client:</strong> {clientName}
                                  </div>
                                  <div>
                                    <strong>Staff:</strong> {employeeName}
                                  </div>
                                </div>
                              </div>
                              <span
                                className={`text-xs font-medium px-3 py-1 rounded ${
                                  statusColors[apt.status] || 'bg-slate-100 text-slate-800'
                                }`}
                              >
                                {apt.status}
                              </span>
                            </div>
                          </div>
                        );
                      })}
                  </div>
                )}
              </div>
            </div>

            <div className="bg-white rounded-lg border border-slate-200 p-6 h-fit">
              <h3 className="font-bold text-slate-900 mb-4">Select Date</h3>
              <input
                type="date"
                value={
                  selectedDate
                    ? selectedDate.toISOString().split('T')[0]
                    : new Date().toISOString().split('T')[0]
                }
                onChange={(e) => setSelectedDate(new Date(e.target.value))}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg"
              />
            </div>
          </div>
        )}

        {/* Weekly View */}
        {viewMode === 'weekly' && (
          <div className="bg-white rounded-lg border border-slate-200 p-6">
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-slate-900">
                  Week of{' '}
                  {selectedDate
                    ? getWeekStart(selectedDate).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                      })
                    : 'N/A'}
                </h2>
                <div className="flex gap-2">
                  <button
                    onClick={() =>
                      setSelectedDate(
                        new Date(
                          (selectedDate || new Date()).getTime() - 7 * 24 * 60 * 60 * 1000
                        )
                      )
                    }
                    className="px-3 py-2 bg-slate-200 hover:bg-slate-300 rounded-lg transition-colors"
                  >
                    ← Prev Week
                  </button>
                  <button
                    onClick={() => setSelectedDate(new Date())}
                    className="px-3 py-2 bg-blue-600 text-white hover:bg-blue-700 rounded-lg transition-colors"
                  >
                    This Week
                  </button>
                  <button
                    onClick={() =>
                      setSelectedDate(
                        new Date(
                          (selectedDate || new Date()).getTime() + 7 * 24 * 60 * 60 * 1000
                        )
                      )
                    }
                    className="px-3 py-2 bg-slate-200 hover:bg-slate-300 rounded-lg transition-colors"
                  >
                    Next Week →
                  </button>
                </div>
              </div>

              {loading ? (
                <div className="text-center py-8 text-slate-600">Loading...</div>
              ) : (
                <div className="space-y-2">
                  {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day, idx) => {
                    const dayDate = new Date(
                      getWeekStart(selectedDate || new Date()).getTime() +
                        idx * 24 * 60 * 60 * 1000
                    );
                    const dayAppointments = getAppointmentsForDate(dayDate);

                    return (
                      <div key={day} className="border border-slate-200 rounded-lg p-4">
                        <div className="font-semibold text-slate-900 mb-3">
                          {day}, {dayDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                        </div>
                        {dayAppointments.length === 0 ? (
                          <div className="text-sm text-slate-600">No appointments</div>
                        ) : (
                          <div className="space-y-2">
                            {dayAppointments
                              .sort(
                                (a, b) =>
                                  new Date(a.startTime).getTime() - new Date(b.startTime).getTime()
                              )
                              .map((apt) => {
                                const startTime = new Date(apt.startTime);
                                const endTime = new Date(apt.endTime);
                                const clientName = apt.client?.user
                                  ? `${apt.client.user.firstName} ${apt.client.user.lastName}`
                                  : 'Unknown';

                                return (
                                  <div
                                    key={apt.id}
                                    className={`text-sm p-2 rounded ${
                                      statusColors[apt.status] ||
                                      'bg-slate-100 text-slate-800'
                                    }`}
                                  >
                                    {startTime.getHours()}:
                                    {String(startTime.getMinutes()).padStart(2, '0')} - {clientName}
                                  </div>
                                );
                              })}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Monthly View */}
        {viewMode === 'monthly' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 bg-white rounded-lg border border-slate-200 p-6">
              <div className="space-y-6">
                {/* Month/Year Header */}
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-bold text-slate-900">
                    {MONTHS[currentDate.getMonth()]} {currentDate.getFullYear()}
                  </h2>
                  <div className="flex gap-2">
                    <button
                      onClick={previousMonth}
                      className="px-3 py-2 bg-slate-200 hover:bg-slate-300 rounded-lg transition-colors"
                    >
                      ← Prev
                    </button>
                    <button
                      onClick={() => setCurrentDate(new Date())}
                      className="px-3 py-2 bg-blue-600 text-white hover:bg-blue-700 rounded-lg transition-colors"
                    >
                      Today
                    </button>
                    <button
                      onClick={nextMonth}
                      className="px-3 py-2 bg-slate-200 hover:bg-slate-300 rounded-lg transition-colors"
                    >
                      Next →
                    </button>
                  </div>
                </div>

                {/* Days of week */}
                <div className="grid grid-cols-7 gap-2 mb-2">
                  {DAYS_OF_WEEK.map((day) => (
                    <div
                      key={day}
                      className="text-center font-semibold text-slate-600 py-2 text-sm"
                    >
                      {day}
                    </div>
                  ))}
                </div>

                {/* Calendar grid */}
                <div className="grid grid-cols-7 gap-2">
                  {days.map((date, index) => {
                    const appointmentsForDay = date
                      ? getAppointmentsForDate(date)
                      : [];
                    const isCurrentDay = isToday(date);
                    const isCurrentSelected = isSelected(date);

                    return (
                      <button
                        key={index}
                        onClick={() => date && setSelectedDate(date)}
                        className={`min-h-24 p-2 rounded-lg border-2 transition-all text-left ${
                          date
                            ? isCurrentSelected
                              ? 'border-blue-500 bg-blue-50'
                              : isCurrentDay
                              ? 'border-blue-300 bg-blue-50'
                              : 'border-slate-200 hover:border-slate-300'
                            : 'bg-slate-50'
                        }`}
                        disabled={!date}
                      >
                        {date && (
                          <div className="space-y-1">
                            <div
                              className={`text-sm font-semibold ${
                                isCurrentDay ? 'text-blue-600' : 'text-slate-900'
                              }`}
                            >
                              {date.getDate()}
                            </div>
                            <div className="space-y-1">
                              {appointmentsForDay
                                .slice(0, 2)
                                .map((apt) => (
                                  <div
                                    key={apt.id}
                                    className="text-xs px-1 py-0.5 bg-blue-100 text-blue-800 rounded truncate"
                                  >
                                    {new Date(apt.startTime).getHours()}:
                                    {String(
                                      new Date(apt.startTime).getMinutes()
                                    ).padStart(2, '0')}
                                  </div>
                                ))}
                              {appointmentsForDay.length > 2 && (
                                <div className="text-xs text-slate-600 px-1">
                                  +{appointmentsForDay.length - 2} more
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Sidebar - Selected Date Details */}
            <div className="bg-white rounded-lg border border-slate-200 p-6 h-fit">
              <h3 className="font-bold text-slate-900 mb-4">
                {selectedDate
                  ? `${MONTHS[selectedDate.getMonth()]} ${selectedDate.getDate()}, ${selectedDate.getFullYear()}`
                  : 'Select a date'}
              </h3>

              {selectedDate && (
                <div className="space-y-3">
                  {loading ? (
                    <div className="text-sm text-slate-600">Loading...</div>
                  ) : getSelectedDateAppointments().length === 0 ? (
                    <div className="text-sm text-slate-600">
                      No appointments scheduled
                    </div>
                  ) : (
                    <div className="space-y-2 max-h-96 overflow-y-auto">
                      {getSelectedDateAppointments().map((apt) => {
                        const startTime = new Date(apt.startTime);
                        const endTime = new Date(apt.endTime);
                        const clientName = apt.client?.user
                          ? `${apt.client.user.firstName} ${apt.client.user.lastName}`
                          : 'Unknown';
                        const employeeName = apt.employee?.user
                          ? `${apt.employee.user.firstName} ${apt.employee.user.lastName}`
                          : 'Unassigned';

                        return (
                          <div
                            key={apt.id}
                            className="border border-slate-200 rounded-lg p-3 bg-slate-50"
                          >
                            <div className="font-semibold text-sm text-slate-900">
                              {startTime.getHours()}:
                              {String(startTime.getMinutes()).padStart(2, '0')} -{' '}
                              {endTime.getHours()}:
                              {String(endTime.getMinutes()).padStart(2, '0')}
                            </div>
                            <div className="text-xs text-slate-600 mt-1">
                              <div>
                                <strong>Client:</strong> {clientName}
                              </div>
                              <div>
                                <strong>Staff:</strong> {employeeName}
                              </div>
                            </div>
                            <div className="mt-2">
                              <span
                                className={`text-xs font-medium px-2 py-1 rounded ${
                                  statusColors[apt.status] ||
                                  'bg-slate-100 text-slate-800'
                                }`}
                              >
                                {apt.status}
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {/* List View */}
        {viewMode === 'list' && (
          <div className="bg-white rounded-lg border border-slate-200 p-6">
            <div className="space-y-4">
              <h2 className="text-xl font-bold text-slate-900">All Appointments</h2>

              {loading ? (
                <div className="text-center py-8 text-slate-600">Loading...</div>
              ) : appointments.length === 0 ? (
                <div className="text-center py-8 text-slate-600">No appointments scheduled</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-slate-200">
                        <th className="px-4 py-3 text-left text-sm font-semibold text-slate-900">
                          Date & Time
                        </th>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-slate-900">
                          Client
                        </th>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-slate-900">
                          Staff
                        </th>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-slate-900">
                          Duration
                        </th>
                        <th className="px-4 py-3 text-left text-sm font-semibold text-slate-900">
                          Status
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {appointments
                        .sort(
                          (a, b) =>
                            new Date(b.startTime).getTime() - new Date(a.startTime).getTime()
                        )
                        .map((apt) => {
                          const startTime = new Date(apt.startTime);
                          const endTime = new Date(apt.endTime);
                          const clientName = apt.client?.user
                            ? `${apt.client.user.firstName} ${apt.client.user.lastName}`
                            : 'Unknown';
                          const employeeName = apt.employee?.user
                            ? `${apt.employee.user.firstName} ${apt.employee.user.lastName}`
                            : 'Unassigned';
                          const duration = Math.round(
                            (endTime.getTime() - startTime.getTime()) / (60 * 1000)
                          );

                          return (
                            <tr
                              key={apt.id}
                              className="border-b border-slate-200 hover:bg-slate-50 transition-colors"
                            >
                              <td className="px-4 py-3 text-sm text-slate-900">
                                {startTime.toLocaleDateString('en-US', {
                                  month: 'short',
                                  day: 'numeric',
                                  year: 'numeric',
                                })}{' '}
                                {startTime.getHours()}:{String(startTime.getMinutes()).padStart(2, '0')}
                              </td>
                              <td className="px-4 py-3 text-sm text-slate-900">{clientName}</td>
                              <td className="px-4 py-3 text-sm text-slate-900">{employeeName}</td>
                              <td className="px-4 py-3 text-sm text-slate-600">{duration} min</td>
                              <td className="px-4 py-3 text-sm">
                                <span
                                  className={`font-medium px-3 py-1 rounded text-xs ${
                                    statusColors[apt.status] || 'bg-slate-100 text-slate-800'
                                  }`}
                                >
                                  {apt.status}
                                </span>
                              </td>
                            </tr>
                          );
                        })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
