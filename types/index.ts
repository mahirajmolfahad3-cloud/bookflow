export type UserRole = "owner" | "customer" | "admin";

export type AppointmentStatus = "pending" | "confirmed" | "completed" | "cancelled";

export interface Profile {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar_url?: string;
  phone?: string;
  created_at: string;
}

export interface Business {
  id: string;
  owner_id: string;
  name: string;
  category: string;
  description?: string;
  location?: string;
  phone?: string;
  email?: string;
  logo_url?: string;
  cover_url?: string;
  is_active: boolean;
  working_hours?: WorkingHours;
  created_at: string;
}

export interface WorkingHours {
  [key: string]: { open: string; close: string; enabled: boolean };
}

export interface Service {
  id: string;
  business_id: string;
  name: string;
  description?: string;
  price: number;
  duration: number;
  is_available: boolean;
  created_at: string;
}

export interface Appointment {
  id: string;
  business_id: string;
  customer_id: string;
  service_id: string;
  date: string;
  start_time: string;
  end_time: string;
  status: AppointmentStatus;
  notes?: string;
  created_at: string;
  service?: Service;
  customer?: Profile;
  business?: Business;
}

export interface Review {
  id: string;
  appointment_id: string;
  customer_id: string;
  business_id: string;
  rating: number;
  comment?: string;
  created_at: string;
  customer?: Profile;
}

export interface DashboardStats {
  todayAppointments: number;
  totalCustomers: number;
  monthlyRevenue: number;
  totalBookings: number;
  revenueChange: number;
  bookingsChange: number;
}
