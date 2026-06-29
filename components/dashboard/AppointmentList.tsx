"use client";
import { motion } from "framer-motion";
import { Clock, User, CheckCircle, XCircle, MoreHorizontal } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { formatTime, getInitials } from "@/lib/utils";
import type { Appointment } from "@/types";
import { updateAppointmentStatus } from "@/lib/queries";
import { toast } from "sonner";

interface Props {
  appointments: Appointment[];
  onRefresh?: () => void;
}

export default function AppointmentList({ appointments, onRefresh }: Props) {
  const handleStatusChange = async (id: string, status: Appointment["status"]) => {
    try {
      await updateAppointmentStatus(id, status);
      toast.success(`Appointment ${status}`);
      onRefresh?.();
    } catch {
      toast.error("Failed to update appointment");
    }
  };

  if (appointments.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Today's Appointments</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-4">
              <Clock className="w-6 h-6 text-muted-foreground" />
            </div>
            <p className="font-medium">No appointments today</p>
            <p className="text-sm text-muted-foreground mt-1">Enjoy your free day!</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Today's Appointments</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {appointments.map((appt, i) => (
          <motion.div
            key={appt.id}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.05 }}
            className="flex items-center gap-4 p-3 rounded-xl border border-border hover:bg-accent/50 transition-colors"
          >
            <Avatar className="h-9 w-9 shrink-0">
              <AvatarFallback className="text-xs gradient-primary text-white">
                {getInitials(appt.customer?.name || "?")}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-sm truncate">{appt.customer?.name}</p>
              <p className="text-xs text-muted-foreground truncate">{appt.service?.name}</p>
            </div>
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Clock className="w-3 h-3" />
              {formatTime(appt.start_time)}
            </div>
            <Badge variant={appt.status as any}>{appt.status}</Badge>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <MoreHorizontal className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => handleStatusChange(appt.id, "confirmed")}>
                  <CheckCircle className="w-4 h-4" /> Confirm
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleStatusChange(appt.id, "completed")}>
                  <CheckCircle className="w-4 h-4" /> Mark Complete
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => handleStatusChange(appt.id, "cancelled")}
                  className="text-destructive focus:text-destructive"
                >
                  <XCircle className="w-4 h-4" /> Cancel
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </motion.div>
        ))}
      </CardContent>
    </Card>
  );
}
