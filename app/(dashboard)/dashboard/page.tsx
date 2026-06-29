"use client";
import { useEffect, useState, useCallback } from "react";
import { Calendar, Users, DollarSign, TrendingUp } from "lucide-react";
import DashboardHeader from "@/components/layout/DashboardHeader";
import StatsCard from "@/components/dashboard/StatsCard";
import RevenueChart from "@/components/dashboard/RevenueChart";
import BookingsChart from "@/components/dashboard/BookingsChart";
import AppointmentList from "@/components/dashboard/AppointmentList";
import { useAuth } from "@/hooks/useAuth";
import { getBusinessByOwner, getDashboardStats, getTodayAppointments } from "@/lib/queries";
import type { DashboardStats, Appointment } from "@/types";
import { formatCurrency } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";

export default function DashboardPage() {
  const { user, profile } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [businessId, setBusinessId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async () => {
    if (!user) return;
    try {
      const business = await getBusinessByOwner(user.id);
      if (!business) {
        setLoading(false);
        return;
      }
      setBusinessId(business.id);
      const [s, appts] = await Promise.all([
        getDashboardStats(business.id),
        getTodayAppointments(business.id),
      ]);
      setStats(s);
      setAppointments(appts);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  if (loading) {
    return (
      <div>
        <DashboardHeader title="Overview" subtitle="Welcome back" />
        <div className="p-6 space-y-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-32" />)}
          </div>
          <div className="grid lg:grid-cols-2 gap-6">
            <Skeleton className="h-80" />
            <Skeleton className="h-80" />
          </div>
        </div>
      </div>
    );
  }

  const statsConfig = [
    {
      title: "Today's appointments",
      value: stats?.todayAppointments || 0,
      icon: Calendar,
      color: "purple" as const,
      change: undefined,
    },
    {
      title: "Total customers",
      value: stats?.totalCustomers || 0,
      icon: Users,
      color: "blue" as const,
      change: undefined,
    },
    {
      title: "Monthly revenue",
      value: formatCurrency(stats?.monthlyRevenue || 0),
      icon: DollarSign,
      color: "green" as const,
      change: stats?.revenueChange,
    },
    {
      title: "Total bookings",
      value: stats?.totalBookings || 0,
      icon: TrendingUp,
      color: "orange" as const,
      change: stats?.bookingsChange,
    },
  ];

  return (
    <div>
      <DashboardHeader
        title="Overview"
        subtitle={`Good ${new Date().getHours() < 12 ? "morning" : "afternoon"}, ${profile?.name?.split(" ")[0] || "there"}`}
      />
      <div className="p-6 space-y-6">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {statsConfig.map((s, i) => (
            <StatsCard key={s.title} {...s} index={i} />
          ))}
        </div>

        {!businessId ? (
          <div className="text-center py-16 rounded-2xl border border-dashed border-border">
            <Calendar className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="font-semibold text-lg mb-2">Set up your business</h3>
            <p className="text-muted-foreground text-sm mb-4">
              Go to Settings to create your business profile and start accepting bookings.
            </p>
          </div>
        ) : (
          <>
            <div className="grid lg:grid-cols-2 gap-6">
              <RevenueChart />
              <BookingsChart />
            </div>
            <AppointmentList appointments={appointments} onRefresh={loadData} />
          </>
        )}
      </div>
    </div>
  );
}
