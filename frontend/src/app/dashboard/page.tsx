'use client';

import { useState, useEffect } from 'react';
import { appointmentsAPI } from '@/lib/api';
import { useAuthStore } from '@/store/auth';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function DashboardPage() {
  const { user, logout } = useAuthStore();
  const router = useRouter();
  const [appointments, setAppointments] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      router.push('/login');
      return;
    }
    loadAppointments();
  }, [user, router]);

  const loadAppointments = async () => {
    try {
      const response = await appointmentsAPI.getMyAppointments();
      setAppointments(response.data);
    } catch (error) {
      console.error('Failed to load appointments:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  const handleCancel = async (appointmentId: string) => {
    try {
      await appointmentsAPI.cancel(appointmentId);
      loadAppointments();
      alert('Appointment cancelled successfully');
    } catch (error) {
      alert('Failed to cancel appointment');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50">
      {/* Header */}
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-purple-600">Dashboard</h1>
            <div className="space-x-4">
              <Link href="/booking" className="text-gray-600 hover:text-purple-600">
                Book Appointment
              </Link>
              <button
                onClick={handleLogout}
                className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Your Appointments</h2>

          {isLoading ? (
            <p className="text-gray-600">Loading...</p>
          ) : appointments.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-600 mb-4">You don't have any appointments yet</p>
              <Link
                href="/booking"
                className="inline-block bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700"
              >
                Book Your First Appointment
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {appointments.map((apt) => (
                <div
                  key={apt.id}
                  className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-semibold text-gray-900">
                        {apt.services.map((s: any) => s.service.name).join(', ')}
                      </h3>
                      <p className="text-gray-600 text-sm mt-1">
                        Stylist: {apt.employee.user.firstName} {apt.employee.user.lastName}
                      </p>
                      <p className="text-gray-600 text-sm">
                        {new Date(apt.startTime).toLocaleDateString()} at{' '}
                        {new Date(apt.startTime).toLocaleTimeString()}
                      </p>
                      <p className="text-sm mt-2">
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          apt.status === 'CONFIRMED' 
                            ? 'bg-green-100 text-green-800'
                            : apt.status === 'PENDING'
                            ? 'bg-yellow-100 text-yellow-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {apt.status}
                        </span>
                      </p>
                    </div>
                    <div className="space-x-2">
                      <Link
                        href={`/appointments/${apt.id}`}
                        className="inline-block bg-purple-600 text-white px-3 py-1 rounded hover:bg-purple-700 text-sm"
                      >
                        View
                      </Link>
                      {['PENDING', 'CONFIRMED'].includes(apt.status) && (
                        <button
                          onClick={() => handleCancel(apt.id)}
                          className="inline-block bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700 text-sm"
                        >
                          Cancel
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
