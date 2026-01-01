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

export default function AppointmentsPage() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        // This would need proper API endpoint for admin to get all appointments
        setAppointments([]);
      } catch (error) {
        console.error('Failed to fetch appointments:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAppointments();
  }, []);

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Appointments</h1>
          <p className="text-slate-600 mt-1">Manage all salon appointments</p>
        </div>

        {/* Calendar View */}
        <div className="bg-white rounded-lg border border-slate-200 p-6">
          <h2 className="text-xl font-bold text-slate-900 mb-4">Calendar</h2>
          <div className="h-96 bg-slate-50 rounded flex items-center justify-center text-slate-400">
            📅 Calendar view coming soon - Integrate with React Calendar or FullCalendar
          </div>
        </div>

        {/* Appointments List */}
        <div className="bg-white rounded-lg border border-slate-200 p-6">
          <h2 className="text-xl font-bold text-slate-900 mb-4">Today's Appointments</h2>
          {loading ? (
            <div className="text-center py-8 text-slate-600">Loading appointments...</div>
          ) : appointments.length === 0 ? (
            <div className="text-center py-8 text-slate-600">
              No appointments scheduled for today
            </div>
          ) : (
            <table className="w-full">
              <thead>
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-slate-900">Time</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-slate-900">Client</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-slate-900">Employee</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-slate-900">Status</th>
                </tr>
              </thead>
              <tbody>
                {appointments.map((apt) => (
                  <tr key={apt.id} className="border-t border-slate-200">
                    <td className="px-4 py-3 text-sm text-slate-600">
                      {new Date(apt.startTime).toLocaleTimeString()}
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-900">
                      {apt.client?.user?.firstName} {apt.client?.user?.lastName}
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-900">
                      {apt.employee?.user?.firstName} {apt.employee?.user?.lastName}
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <span className="px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        {apt.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}
