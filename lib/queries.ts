import { createClient } from "@/lib/supabase/client";
import type { Business, Service, Appointment, Review, Profile, DashboardStats } from "@/types";

const supabase = createClient();

// ─── Business ───────────────────────────────────────────────
export async function getBusinessByOwner(ownerId: string): Promise<Business | null> {
  const { data } = await supabase
    .from("businesses")
    .select("*")
    .eq("owner_id", ownerId)
    .single();
  return data;
}

export async function getAllBusinesses(): Promise<Business[]> {
  const { data } = await supabase
    .from("businesses")
    .select("*")
    .eq("is_active", true)
    .order("created_at", { ascending: false });
  return data || [];
}

export async function getBusinessById(id: string): Promise<Business | null> {
  const { data } = await supabase.from("businesses").select("*").eq("id", id).single();
  return data;
}

export async function upsertBusiness(business: Partial<Business>) {
  const { data, error } = await supabase.from("businesses").upsert(business).select().single();
  if (error) throw error;
  return data;
}

// ─── Services ────────────────────────────────────────────────
export async function getServicesByBusiness(businessId: string): Promise<Service[]> {
  const { data } = await supabase
    .from("services")
    .select("*")
    .eq("business_id", businessId)
    .order("created_at", { ascending: false });
  return data || [];
}

export async function createService(service: Omit<Service, "id" | "created_at">) {
  const { data, error } = await supabase.from("services").insert(service).select().single();
  if (error) throw error;
  return data;
}

export async function updateService(id: string, updates: Partial<Service>) {
  const { data, error } = await supabase.from("services").update(updates).eq("id", id).select().single();
  if (error) throw error;
  return data;
}

export async function deleteService(id: string) {
  const { error } = await supabase.from("services").delete().eq("id", id);
  if (error) throw error;
}

// ─── Appointments ────────────────────────────────────────────
export async function getAppointmentsByBusiness(businessId: string): Promise<Appointment[]> {
  const { data } = await supabase
    .from("appointments")
    .select(`*, service:services(*), customer:profiles(*)`)
    .eq("business_id", businessId)
    .order("date", { ascending: false })
    .order("start_time", { ascending: false });
  return data || [];
}

export async function getAppointmentsByCustomer(customerId: string): Promise<Appointment[]> {
  const { data } = await supabase
    .from("appointments")
    .select(`*, service:services(*), business:businesses(*)`)
    .eq("customer_id", customerId)
    .order("date", { ascending: false });
  return data || [];
}

export async function getTodayAppointments(businessId: string): Promise<Appointment[]> {
  const today = new Date().toISOString().split("T")[0];
  const { data } = await supabase
    .from("appointments")
    .select(`*, service:services(*), customer:profiles(*)`)
    .eq("business_id", businessId)
    .eq("date", today)
    .order("start_time", { ascending: true });
  return data || [];
}

export async function createAppointment(appt: Omit<Appointment, "id" | "created_at">) {
  const { data, error } = await supabase.from("appointments").insert(appt).select().single();
  if (error) throw error;
  return data;
}

export async function updateAppointmentStatus(id: string, status: Appointment["status"]) {
  const { data, error } = await supabase
    .from("appointments")
    .update({ status })
    .eq("id", id)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function checkSlotAvailability(
  businessId: string,
  date: string,
  startTime: string,
  endTime: string
): Promise<boolean> {
  const { data } = await supabase
    .from("appointments")
    .select("id")
    .eq("business_id", businessId)
    .eq("date", date)
    .neq("status", "cancelled")
    .or(`and(start_time.lte.${startTime},end_time.gt.${startTime}),and(start_time.lt.${endTime},end_time.gte.${endTime})`);
  return (data?.length || 0) === 0;
}

// ─── Reviews ─────────────────────────────────────────────────
export async function getReviewsByBusiness(businessId: string): Promise<Review[]> {
  const { data } = await supabase
    .from("reviews")
    .select(`*, customer:profiles(name, avatar_url)`)
    .eq("business_id", businessId)
    .order("created_at", { ascending: false });
  return data || [];
}

export async function createReview(review: Omit<Review, "id" | "created_at">) {
  const { data, error } = await supabase.from("reviews").insert(review).select().single();
  if (error) throw error;
  return data;
}

// ─── Dashboard Stats ─────────────────────────────────────────
export async function getDashboardStats(businessId: string): Promise<DashboardStats> {
  const today = new Date().toISOString().split("T")[0];
  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  const monthStart = startOfMonth.toISOString().split("T")[0];

  const [todayResult, customersResult, revenueResult, totalResult] = await Promise.all([
    supabase.from("appointments").select("id", { count: "exact" }).eq("business_id", businessId).eq("date", today).neq("status", "cancelled"),
    supabase.from("appointments").select("customer_id").eq("business_id", businessId).neq("status", "cancelled"),
    supabase.from("appointments").select("service:services(price)").eq("business_id", businessId).eq("status", "completed").gte("date", monthStart),
    supabase.from("appointments").select("id", { count: "exact" }).eq("business_id", businessId).neq("status", "cancelled"),
  ]);

  const uniqueCustomers = new Set(customersResult.data?.map((a) => a.customer_id) || []).size;
  const monthlyRevenue = (revenueResult.data || []).reduce((sum: number, a: any) => sum + (a.service?.price || 0), 0);

  return {
    todayAppointments: todayResult.count || 0,
    totalCustomers: uniqueCustomers,
    monthlyRevenue,
    totalBookings: totalResult.count || 0,
    revenueChange: 12.5,
    bookingsChange: 8.3,
  };
}

// ─── Customers ───────────────────────────────────────────────
export async function getCustomersByBusiness(businessId: string) {
  const { data } = await supabase
    .from("appointments")
    .select(`customer:profiles(id, name, email, avatar_url), service:services(price), status, date`)
    .eq("business_id", businessId)
    .neq("status", "cancelled");

  if (!data) return [];

  const customerMap = new Map<string, any>();
  data.forEach((appt: any) => {
    if (!appt.customer) return;
    const id = appt.customer.id;
    if (!customerMap.has(id)) {
      customerMap.set(id, { ...appt.customer, totalSpending: 0, appointmentCount: 0, lastVisit: appt.date });
    }
    const c = customerMap.get(id);
    c.totalSpending += appt.service?.price || 0;
    c.appointmentCount += 1;
    if (appt.date > c.lastVisit) c.lastVisit = appt.date;
  });

  return Array.from(customerMap.values());
}

// ─── Profile ─────────────────────────────────────────────────
export async function getProfile(userId: string): Promise<Profile | null> {
  const { data } = await supabase.from("profiles").select("*").eq("id", userId).single();
  return data;
}

export async function updateProfile(userId: string, updates: Partial<Profile>) {
  const { data, error } = await supabase.from("profiles").update(updates).eq("id", userId).select().single();
  if (error) throw error;
  return data;
}
