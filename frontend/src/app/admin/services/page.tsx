'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import AdminLayout from '@/components/admin/AdminLayout';
import api from '@/lib/api';

interface Service {
  id: string;
  name: string;
  description: string;
  price: number;
  baseDuration: number;
  isActive: boolean;
  category?: {
    name: string;
  };
}

export default function ServicesPage() {
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchServices = async () => {
      try {
        const res = await api.get('/services');
        setServices(res.data || []);
      } catch (error) {
        console.error('Failed to fetch services:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchServices();
  }, []);

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Service Management</h1>
            <p className="text-slate-600 mt-1">Manage your salon services and pricing</p>
          </div>
          <Link
            href="/admin/services/new"
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            + Add Service
          </Link>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {loading ? (
            <div className="col-span-full text-center py-8 text-slate-600">
              Loading services...
            </div>
          ) : services.length === 0 ? (
            <div className="col-span-full text-center py-8 text-slate-600">
              <p>No services found</p>
              <Link href="/admin/services/new" className="text-blue-600 hover:underline mt-2 inline-block">
                Create your first service
              </Link>
            </div>
          ) : (
            services.map((service) => (
              <div
                key={service.id}
                className="bg-white rounded-lg border border-slate-200 p-6 hover:shadow-lg transition-shadow"
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="font-bold text-slate-900">{service.name}</h3>
                    {service.category && (
                      <p className="text-sm text-slate-600 mt-1">{service.category.name}</p>
                    )}
                  </div>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-medium ${
                      service.isActive
                        ? 'bg-green-100 text-green-800'
                        : 'bg-slate-100 text-slate-800'
                    }`}
                  >
                    {service.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>

                <p className="text-sm text-slate-600 mb-4">{service.description}</p>

                <div className="flex items-center justify-between py-3 border-t border-slate-200 pt-4">
                  <div>
                    <p className="text-2xl font-bold text-slate-900">
                      ${service.price.toFixed(2)}
                    </p>
                    <p className="text-xs text-slate-600">{service.baseDuration} min</p>
                  </div>
                  <div className="space-x-2">
                    <Link
                      href={`/admin/services/${service.id}`}
                      className="text-blue-600 hover:underline text-sm"
                    >
                      Edit
                    </Link>
                    <button className="text-red-600 hover:underline text-sm">Delete</button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </AdminLayout>
  );
}
