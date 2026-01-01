'use client';

import { useState, useEffect } from 'react';
import { servicesAPI, employeesAPI, appointmentsAPI, availabilityAPI } from '@/lib/api';
import { useAuthStore } from '@/store/auth';
import { useRouter } from 'next/navigation';

export default function BookingPage() {
  const { user } = useAuthStore();
  const router = useRouter();
  const [services, setServices] = useState<any[]>([]);
  const [employees, setEmployees] = useState<any[]>([]);
  const [selectedService, setSelectedService] = useState('');
  const [selectedEmployee, setSelectedEmployee] = useState('');
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [availableSlots, setAvailableSlots] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!user) {
      router.push('/login');
      return;
    }
    loadServices();
    loadEmployees();
  }, [user, router]);

  const loadServices = async () => {
    try {
      const response = await servicesAPI.getAll();
      setServices(response.data);
    } catch (error) {
      console.error('Failed to load services:', error);
    }
  };

  const loadEmployees = async () => {
    try {
      const response = await employeesAPI.getAll();
      setEmployees(response.data);
    } catch (error) {
      console.error('Failed to load employees:', error);
    }
  };

  const loadAvailableSlots = async () => {
    if (!selectedEmployee || !selectedDate) return;

    try {
      const response = await availabilityAPI.checkSlots(selectedEmployee, selectedDate);
      setAvailableSlots(response.data);
    } catch (error) {
      console.error('Failed to load available slots:', error);
    }
  };

  useEffect(() => {
    loadAvailableSlots();
  }, [selectedEmployee, selectedDate]);

  const handleBooking = async () => {
    if (!selectedService || !selectedEmployee || !selectedDate || !selectedTime) {
      alert('Please fill all fields');
      return;
    }

    setIsLoading(true);
    try {
      const startTime = new Date(`${selectedDate}T${selectedTime}`);
      const service = services.find((s) => s.id === selectedService);
      const endTime = new Date(startTime.getTime() + service.baseDuration * 60000);

      await appointmentsAPI.create({
        clientId: user?.id,
        employeeId: selectedEmployee,
        startTime,
        endTime,
        serviceIds: [selectedService],
      });

      alert('Appointment booked successfully!');
      router.push('/dashboard');
    } catch (error: any) {
      alert(error.response?.data?.message || 'Booking failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 py-12">
      <div className="max-w-2xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">Book an Appointment</h1>

          <div className="space-y-6">
            {/* Service Selection */}
            <div>
              <label className="block text-gray-700 font-medium mb-2">Select Service</label>
              <select
                value={selectedService}
                onChange={(e) => setSelectedService(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="">Choose a service...</option>
                {services.map((service) => (
                  <option key={service.id} value={service.id}>
                    {service.name} - ${service.price} ({service.baseDuration} mins)
                  </option>
                ))}
              </select>
            </div>

            {/* Employee Selection */}
            <div>
              <label className="block text-gray-700 font-medium mb-2">Select Stylist</label>
              <select
                value={selectedEmployee}
                onChange={(e) => setSelectedEmployee(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="">Choose a stylist...</option>
                {employees.map((emp) => (
                  <option key={emp.id} value={emp.id}>
                    {emp.user.firstName} {emp.user.lastName}
                  </option>
                ))}
              </select>
            </div>

            {/* Date Selection */}
            <div>
              <label className="block text-gray-700 font-medium mb-2">Select Date</label>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                min={new Date().toISOString().split('T')[0]}
              />
            </div>

            {/* Time Selection */}
            {availableSlots.length > 0 && (
              <div>
                <label className="block text-gray-700 font-medium mb-2">Select Time</label>
                <div className="grid grid-cols-3 gap-2">
                  {availableSlots.map((slot, idx) => (
                    <button
                      key={idx}
                      onClick={() => setSelectedTime(slot.start.split('T')[1].substring(0, 5))}
                      className={`p-2 rounded-lg border-2 transition ${
                        selectedTime === slot.start.split('T')[1].substring(0, 5)
                          ? 'border-purple-500 bg-purple-50'
                          : 'border-gray-300 hover:border-purple-500'
                      }`}
                    >
                      {slot.start.split('T')[1].substring(0, 5)}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Book Button */}
            <button
              onClick={handleBooking}
              disabled={isLoading || !selectedService || !selectedEmployee || !selectedDate || !selectedTime}
              className="w-full bg-purple-600 text-white font-semibold py-3 rounded-lg hover:bg-purple-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Booking...' : 'Book Appointment'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
