"use client";
import { motion } from "framer-motion";
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend
} from "recharts";
import DashboardHeader from "@/components/layout/DashboardHeader";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

const revenueData = [
  { month: "Jan", revenue: 3200, bookings: 42 },
  { month: "Feb", revenue: 2800, bookings: 38 },
  { month: "Mar", revenue: 4100, bookings: 55 },
  { month: "Apr", revenue: 3700, bookings: 49 },
  { month: "May", revenue: 5200, bookings: 68 },
  { month: "Jun", revenue: 4800, bookings: 62 },
  { month: "Jul", revenue: 6100, bookings: 79 },
  { month: "Aug", revenue: 5700, bookings: 73 },
];

const serviceData = [
  { name: "Haircut", value: 35 },
  { name: "Color", value: 28 },
  { name: "Facial", value: 20 },
  { name: "Massage", value: 17 },
];

const COLORS = ["#8b5cf6", "#3b82f6", "#10b981", "#f59e0b"];

const hourData = [
  { hour: "9am", count: 3 },
  { hour: "10am", count: 8 },
  { hour: "11am", count: 12 },
  { hour: "12pm", count: 6 },
  { hour: "1pm", count: 4 },
  { hour: "2pm", count: 9 },
  { hour: "3pm", count: 14 },
  { hour: "4pm", count: 11 },
  { hour: "5pm", count: 7 },
];

export default function AnalyticsPage() {
  return (
    <div>
      <DashboardHeader title="Analytics" subtitle="Business performance insights" />
      <div className="p-6 space-y-6">
        {/* KPI row */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: "Avg. booking value", value: "$78.40", change: "+12%", positive: true },
            { label: "Conversion rate", value: "68%", change: "+4%", positive: true },
            { label: "Repeat customers", value: "54%", change: "+8%", positive: true },
            { label: "Avg. wait time", value: "1.2 days", change: "-0.3d", positive: true },
          ].map((kpi, i) => (
            <motion.div
              key={kpi.label}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
            >
              <Card>
                <CardContent className="p-5">
                  <p className="text-xs text-muted-foreground mb-1">{kpi.label}</p>
                  <p className="text-2xl font-bold">{kpi.value}</p>
                  <p className={`text-xs mt-1 font-medium ${kpi.positive ? "text-emerald-500" : "text-red-500"}`}>
                    {kpi.change} vs last month
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Revenue + bookings chart */}
        <Card>
          <CardHeader>
            <CardTitle>Revenue & Bookings</CardTitle>
            <CardDescription>Monthly overview for the past 8 months</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={revenueData}>
                <defs>
                  <linearGradient id="gradRev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="gradBook" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                <XAxis dataKey="month" tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis yAxisId="rev" tick={{ fontSize: 12 }} axisLine={false} tickLine={false} tickFormatter={(v) => `$${v}`} />
                <YAxis yAxisId="book" orientation="right" tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{ borderRadius: "0.75rem", border: "1px solid hsl(var(--border))", background: "hsl(var(--card))" }}
                />
                <Legend />
                <Area yAxisId="rev" type="monotone" dataKey="revenue" name="Revenue ($)" stroke="#8b5cf6" strokeWidth={2} fill="url(#gradRev)" />
                <Area yAxisId="book" type="monotone" dataKey="bookings" name="Bookings" stroke="#3b82f6" strokeWidth={2} fill="url(#gradBook)" />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <div className="grid lg:grid-cols-2 gap-6">
          {/* Service breakdown */}
          <Card>
            <CardHeader>
              <CardTitle>Services breakdown</CardTitle>
              <CardDescription>Bookings by service type</CardDescription>
            </CardHeader>
            <CardContent className="flex items-center justify-center">
              <ResponsiveContainer width="100%" height={260}>
                <PieChart>
                  <Pie
                    data={serviceData}
                    cx="50%"
                    cy="50%"
                    innerRadius={70}
                    outerRadius={100}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {serviceData.map((_, index) => (
                      <Cell key={index} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ borderRadius: "0.75rem", border: "1px solid hsl(var(--border))", background: "hsl(var(--card))" }}
                    formatter={(v: any) => [`${v}%`, "Share"]}
                  />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Peak hours */}
          <Card>
            <CardHeader>
              <CardTitle>Peak booking hours</CardTitle>
              <CardDescription>When your customers book most</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={hourData}>
                  <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                  <XAxis dataKey="hour" tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
                  <Tooltip
                    contentStyle={{ borderRadius: "0.75rem", border: "1px solid hsl(var(--border))", background: "hsl(var(--card))" }}
                    formatter={(v: any) => [v, "Appointments"]}
                  />
                  <Bar dataKey="count" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
