"use client";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

const data = [
  { day: "Mon", bookings: 5 },
  { day: "Tue", bookings: 8 },
  { day: "Wed", bookings: 12 },
  { day: "Thu", bookings: 7 },
  { day: "Fri", bookings: 14 },
  { day: "Sat", bookings: 18 },
  { day: "Sun", bookings: 9 },
];

export default function BookingsChart() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Weekly Bookings</CardTitle>
        <CardDescription>Appointments booked this week</CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={data} margin={{ top: 4, right: 4, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
            <XAxis dataKey="day" tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 12 }} axisLine={false} tickLine={false} />
            <Tooltip
              contentStyle={{ borderRadius: "0.75rem", border: "1px solid hsl(var(--border))", background: "hsl(var(--card))" }}
              formatter={(v: any) => [v, "Bookings"]}
            />
            <Bar dataKey="bookings" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
