'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import AdminLayout from '@/components/admin/AdminLayout';
import api from '@/lib/api';

interface Employee {
  id: string;
  user: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
  };
  position: string;
  hourlyRate: number;
  isActive: boolean;
}

export default function EditEmployeePage() {
  const params = useParams();
  const router = useRouter();
  const employeeId = params.id as string;

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState<Employee>({
    id: '',
    user: {
      id: '',
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
    },
    position: '',
    hourlyRate: 0,
    isActive: true,
  });

  useEffect(() => {
    const fetchEmployee = async () => {
      try {
        const res = await api.get(`/employees/${employeeId}`);
        setFormData(res.data);
      } catch (error) {
        console.error('Failed to fetch employee:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchEmployee();
  }, [employeeId]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    if (name.startsWith('user.')) {
      const fieldName = name.replace('user.', '');
      setFormData({
        ...formData,
        user: {
          ...formData.user,
          [fieldName]: value,
        },
      });
    } else if (name === 'hourlyRate') {
      setFormData({
        ...formData,
        [name]: parseFloat(value) || 0,
      });
    } else if (name === 'isActive') {
      setFormData({
        ...formData,
        [name]: (e.target as HTMLInputElement).checked,
      });
    } else {
      setFormData({
        ...formData,
        [name]: value,
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      await api.put(`/employees/${employeeId}`, {
        position: formData.position,
        hourlyRate: formData.hourlyRate,
        isActive: formData.isActive,
      });
      router.push('/admin/employees');
    } catch (error: any) {
      console.error('Failed to update employee:', error);
      alert(error.response?.data?.message || 'Failed to update employee');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this employee? This action cannot be undone.')) {
      return;
    }

    try {
      await api.delete(`/employees/${employeeId}`);
      router.push('/admin/employees');
    } catch (error: any) {
      console.error('Failed to delete employee:', error);
      alert(error.response?.data?.message || 'Failed to delete employee');
    }
  };

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-96">
          <div className="text-slate-600">Loading employee...</div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <div className="max-w-2xl mx-auto">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Edit Employee</h1>
            <p className="text-slate-600 mt-1">Update employee information</p>
          </div>
          <button
            onClick={handleDelete}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            Delete Employee
          </button>
        </div>

        <div className="bg-white rounded-lg border border-slate-200 p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Read-only user info */}
            <div className="bg-slate-50 p-4 rounded-lg border border-slate-200">
              <h3 className="font-semibold text-slate-900 mb-3">Account Information (Read-only)</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-slate-600">First Name</label>
                  <p className="text-slate-900 font-medium">{formData.user.firstName}</p>
                </div>
                <div>
                  <label className="block text-sm text-slate-600">Last Name</label>
                  <p className="text-slate-900 font-medium">{formData.user.lastName}</p>
                </div>
                <div>
                  <label className="block text-sm text-slate-600">Email</label>
                  <p className="text-slate-900 font-medium">{formData.user.email}</p>
                </div>
                <div>
                  <label className="block text-sm text-slate-600">Phone</label>
                  <p className="text-slate-900 font-medium">{formData.user.phone || '-'}</p>
                </div>
              </div>
            </div>

            {/* Editable employee info */}
            <div>
              <h3 className="font-semibold text-slate-900 mb-3">Position & Compensation</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-slate-900 mb-2">
                    Position
                  </label>
                  <input
                    type="text"
                    name="position"
                    value={formData.position}
                    onChange={handleChange}
                    placeholder="e.g., Hairstylist, Manager"
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-900 mb-2">
                    Hourly Rate ($)
                  </label>
                  <input
                    type="number"
                    name="hourlyRate"
                    value={formData.hourlyRate}
                    onChange={handleChange}
                    step="0.01"
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="flex items-center gap-3 cursor-pointer">
                <input
                  type="checkbox"
                  name="isActive"
                  checked={formData.isActive}
                  onChange={handleChange}
                  className="w-4 h-4 rounded border-slate-300"
                />
                <span className="text-slate-900 font-medium">Active</span>
              </label>
            </div>

            <div className="flex gap-4 pt-6">
              <button
                type="submit"
                disabled={submitting}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-blue-400 transition-colors font-medium"
              >
                {submitting ? 'Saving...' : 'Save Changes'}
              </button>
              <button
                type="button"
                onClick={() => router.back()}
                className="px-6 py-2 bg-slate-200 text-slate-900 rounded-lg hover:bg-slate-300 transition-colors font-medium"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </AdminLayout>
  );
}
