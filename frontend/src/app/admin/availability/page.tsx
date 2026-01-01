'use client';

import AdminLayout from '@/components/admin/AdminLayout';

export default function AvailabilityPage() {
  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Availability Management</h1>
          <p className="text-slate-600 mt-1">Set work hours and availability rules for employees</p>
        </div>

        {/* Coming Soon */}
        <div className="bg-white rounded-lg border border-slate-200 p-12 text-center">
          <div className="text-6xl mb-4">⏰</div>
          <h2 className="text-2xl font-bold text-slate-900 mb-2">Availability Management</h2>
          <p className="text-slate-600 mb-6">
            Manage employee schedules and set working hours and days off
          </p>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 text-left max-w-md mx-auto">
            <h3 className="font-semibold text-blue-900 mb-3">Features to implement:</h3>
            <ul className="space-y-2 text-blue-800 text-sm">
              <li>✓ Employee work schedules</li>
              <li>✓ Set daily working hours</li>
              <li>✓ Days off management</li>
              <li>✓ Break times configuration</li>
              <li>✓ Availability rules</li>
              <li>✓ Exception dates</li>
            </ul>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
