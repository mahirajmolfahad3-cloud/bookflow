"use client";
import { useEffect, useState, useCallback, useRef } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import timeGridPlugin from "@fullcalendar/timegrid";
import interactionPlugin from "@fullcalendar/interaction";
import { format } from "date-fns";
import { Clock, User, Scissors } from "lucide-react";
import DashboardHeader from "@/components/layout/DashboardHeader";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { getBusinessByOwner, getAppointmentsByBusiness, updateAppointmentStatus } from "@/lib/queries";
import type { Appointment } from "@/types";
import { formatTime, formatCurrency } from "@/lib/utils";
import { toast } from "sonner";

const STATUS_COLORS: Record<string, string> = {
  pending: "#f59e0b",
  confirmed: "#3b82f6",
  completed: "#10b981",
  cancelled: "#ef4444",
};

export default function CalendarPage() {
  const { user } = useAuth();
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [businessId, setBusinessId] = useState<string | null>(null);
  const [selected, setSelected] = useState<Appointment | null>(null);

  const loadData = useCallback(async () => {
    if (!user) return;
    const biz = await getBusinessByOwner(user.id);
    if (biz) {
      setBusinessId(biz.id);
      const appts = await getAppointmentsByBusiness(biz.id);
      setAppointments(appts.filter((a) => a.status !== "cancelled"));
    }
  }, [user]);

  useEffect(() => { loadData(); }, [loadData]);

  const events = appointments.map((a) => ({
    id: a.id,
    title: `${a.customer?.name || "Customer"} — ${a.service?.name || "Service"}`,
    start: `${a.date}T${a.start_time}`,
    end: `${a.date}T${a.end_time}`,
    backgroundColor: STATUS_COLORS[a.status],
    borderColor: "transparent",
    extendedProps: { appointment: a },
  }));

  const handleEventClick = (info: any) => {
    setSelected(info.event.extendedProps.appointment);
  };

  const handleStatusChange = async (status: Appointment["status"]) => {
    if (!selected) return;
    try {
      await updateAppointmentStatus(selected.id, status);
      toast.success(`Appointment ${status}`);
      setSelected(null);
      loadData();
    } catch {
      toast.error("Failed to update");
    }
  };

  return (
    <div>
      <DashboardHeader title="Calendar" subtitle="View and manage your schedule" />
      <div className="p-6">
        <div className="rounded-xl border border-border bg-card overflow-hidden">
          <style>{`
            .fc { font-family: inherit; }
            .fc-theme-standard td, .fc-theme-standard th { border-color: hsl(var(--border)); }
            .fc-theme-standard .fc-scrollgrid { border-color: hsl(var(--border)); }
            .fc-col-header-cell { background: hsl(var(--muted)/0.5); padding: 8px 0; }
            .fc-col-header-cell-cushion { font-size: 12px; font-weight: 600; color: hsl(var(--muted-foreground)); text-decoration: none; }
            .fc-daygrid-day-number { font-size: 13px; color: hsl(var(--foreground)); text-decoration: none; padding: 4px 8px; }
            .fc-event { border-radius: 6px; padding: 2px 4px; font-size: 12px; cursor: pointer; }
            .fc-toolbar-title { font-size: 16px; font-weight: 600; color: hsl(var(--foreground)); }
            .fc-button { background: hsl(var(--secondary)) !important; border: 1px solid hsl(var(--border)) !important; color: hsl(var(--foreground)) !important; border-radius: 8px !important; font-size: 13px !important; font-weight: 500 !important; box-shadow: none !important; }
            .fc-button:hover { background: hsl(var(--accent)) !important; }
            .fc-button-active { background: hsl(var(--primary)) !important; color: white !important; }
            .fc-today-button { opacity: 1 !important; }
            .fc-daygrid-day.fc-day-today { background: hsl(var(--primary)/0.05); }
          `}</style>
          <FullCalendar
            plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
            initialView="timeGridWeek"
            headerToolbar={{
              left: "prev,next today",
              center: "title",
              right: "dayGridMonth,timeGridWeek,timeGridDay",
            }}
            events={events}
            eventClick={handleEventClick}
            height={680}
            slotMinTime="07:00:00"
            slotMaxTime="21:00:00"
            allDaySlot={false}
            eventTimeFormat={{ hour: "numeric", minute: "2-digit", meridiem: "short" }}
          />
        </div>

        {/* Legend */}
        <div className="flex items-center gap-4 mt-4 text-xs text-muted-foreground">
          {Object.entries(STATUS_COLORS).map(([status, color]) => (
            <div key={status} className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-full" style={{ background: color }} />
              <span className="capitalize">{status}</span>
            </div>
          ))}
        </div>
      </div>

      <Dialog open={!!selected} onOpenChange={(o) => !o && setSelected(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Appointment Details</DialogTitle>
          </DialogHeader>
          {selected && (
            <div className="space-y-4">
              <div className="flex items-center gap-3 p-4 bg-muted/50 rounded-xl">
                <div className="w-10 h-10 gradient-primary rounded-full flex items-center justify-center">
                  <User className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="font-semibold">{selected.customer?.name}</p>
                  <p className="text-sm text-muted-foreground">{selected.customer?.email}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Scissors className="w-4 h-4" />
                  <span>{selected.service?.name}</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Clock className="w-4 h-4" />
                  <span>{formatTime(selected.start_time)} — {formatTime(selected.end_time)}</span>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <Badge variant={selected.status as any}>{selected.status}</Badge>
                <span className="font-semibold text-emerald-600">{formatCurrency(selected.service?.price || 0)}</span>
              </div>

              <div className="flex gap-2">
                {selected.status === "pending" && (
                  <Button className="flex-1" onClick={() => handleStatusChange("confirmed")}>Confirm</Button>
                )}
                {selected.status !== "completed" && selected.status !== "cancelled" && (
                  <Button variant="outline" className="flex-1" onClick={() => handleStatusChange("completed")}>Complete</Button>
                )}
                {selected.status !== "cancelled" && (
                  <Button variant="outline" onClick={() => handleStatusChange("cancelled")} className="text-destructive hover:bg-destructive/10">Cancel</Button>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
