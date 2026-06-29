"use client";
import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { format, addDays, isBefore, startOfDay } from "date-fns";
import {
  ChevronLeft, ChevronRight, Clock, DollarSign,
  CheckCircle, Calendar, Scissors, BookOpen, Loader2
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { getBusinessById, getServicesByBusiness, createAppointment, checkSlotAvailability } from "@/lib/queries";
import { createClient } from "@/lib/supabase/client";
import type { Business, Service } from "@/types";
import { formatCurrency, formatTime } from "@/lib/utils";
import { toast } from "sonner";

const TIME_SLOTS = [
  "09:00", "09:30", "10:00", "10:30", "11:00", "11:30",
  "12:00", "12:30", "13:00", "13:30", "14:00", "14:30",
  "15:00", "15:30", "16:00", "16:30", "17:00",
];

type Step = "service" | "datetime" | "confirm" | "done";

export default function BookingPage() {
  const { businessId } = useParams<{ businessId: string }>();
  const router = useRouter();
  const supabase = createClient();

  const [business, setBusiness] = useState<Business | null>(null);
  const [services, setServices] = useState<Service[]>([]);
  const [step, setStep] = useState<Step>("service");
  const [selectedService, setSelectedService] = useState<Service | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [notes, setNotes] = useState("");
  const [availableSlots, setAvailableSlots] = useState<Record<string, boolean>>({});
  const [submitting, setSubmitting] = useState(false);
  const [calendarOffset, setCalendarOffset] = useState(0);

  useEffect(() => {
    const load = async () => {
      const [biz, svcs] = await Promise.all([
        getBusinessById(businessId),
        getServicesByBusiness(businessId),
      ]);
      setBusiness(biz);
      setServices(svcs.filter((s) => s.is_available));
    };
    load();
  }, [businessId]);

  const checkSlots = useCallback(async () => {
    if (!selectedService) return;
    const dateStr = format(selectedDate, "yyyy-MM-dd");
    const results: Record<string, boolean> = {};
    await Promise.all(
      TIME_SLOTS.map(async (slot) => {
        const [h, m] = slot.split(":").map(Number);
        const endMin = h * 60 + m + selectedService.duration;
        const endH = Math.floor(endMin / 60).toString().padStart(2, "0");
        const endM = (endMin % 60).toString().padStart(2, "0");
        const end = `${endH}:${endM}`;
        results[slot] = await checkSlotAvailability(businessId, dateStr, slot, end);
      })
    );
    setAvailableSlots(results);
  }, [selectedDate, selectedService, businessId]);

  useEffect(() => {
    if (step === "datetime") checkSlots();
  }, [step, checkSlots]);

  const handleBook = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      toast.error("Please sign in to book an appointment");
      router.push("/login");
      return;
    }
    if (!selectedService || !selectedTime) return;

    setSubmitting(true);
    try {
      const dateStr = format(selectedDate, "yyyy-MM-dd");
      const [h, m] = selectedTime.split(":").map(Number);
      const endMin = h * 60 + m + selectedService.duration;
      const endH = Math.floor(endMin / 60).toString().padStart(2, "0");
      const endM = (endMin % 60).toString().padStart(2, "0");

      await createAppointment({
        business_id: businessId,
        customer_id: user.id,
        service_id: selectedService.id,
        date: dateStr,
        start_time: selectedTime,
        end_time: `${endH}:${endM}`,
        status: "pending",
        notes,
      });
      setStep("done");
    } catch {
      toast.error("Booking failed. That slot may have just been taken.");
    } finally {
      setSubmitting(false);
    }
  };

  const days = Array.from({ length: 14 }, (_, i) => addDays(new Date(), i + calendarOffset));

  return (
    <div className="min-h-screen bg-background">
      {/* Top bar */}
      <div className="gradient-hero py-8 px-6">
        <div className="max-w-2xl mx-auto flex items-center gap-3">
          <Link href="/businesses">
            <Button variant="glass" size="sm" className="text-white border-white/20">
              <ChevronLeft className="w-4 h-4" /> Back
            </Button>
          </Link>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 gradient-primary rounded-lg flex items-center justify-center">
              <BookOpen className="w-4 h-4 text-white" />
            </div>
            <div>
              <p className="font-semibold text-white text-sm">{business?.name}</p>
              <p className="text-white/60 text-xs">{business?.category}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-6 py-8">
        {/* Progress */}
        {step !== "done" && (
          <div className="flex items-center gap-2 mb-8">
            {(["service", "datetime", "confirm"] as Step[]).map((s, i) => (
              <div key={s} className="flex items-center gap-2">
                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-medium transition-all ${
                  step === s ? "gradient-primary text-white" :
                  ["service", "datetime", "confirm"].indexOf(step) > i ? "bg-primary/20 text-primary" : "bg-muted text-muted-foreground"
                }`}>
                  {i + 1}
                </div>
                <span className="text-xs font-medium capitalize hidden sm:block text-muted-foreground">{s}</span>
                {i < 2 && <div className="w-8 h-px bg-border" />}
              </div>
            ))}
          </div>
        )}

        <AnimatePresence mode="wait">
          {/* Step 1: Service */}
          {step === "service" && (
            <motion.div key="service" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
              <h2 className="text-2xl font-bold mb-6">Choose a service</h2>
              <div className="space-y-3">
                {services.map((service) => (
                  <button
                    key={service.id}
                    onClick={() => { setSelectedService(service); setStep("datetime"); }}
                    className={`w-full text-left p-4 rounded-xl border transition-all hover:shadow-md ${
                      selectedService?.id === service.id ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-semibold">{service.name}</p>
                        {service.description && <p className="text-sm text-muted-foreground mt-0.5">{service.description}</p>}
                        <div className="flex items-center gap-3 mt-2">
                          <span className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Clock className="w-3.5 h-3.5" /> {service.duration} min
                          </span>
                        </div>
                      </div>
                      <span className="font-bold text-lg text-primary">{formatCurrency(service.price)}</span>
                    </div>
                  </button>
                ))}
              </div>
            </motion.div>
          )}

          {/* Step 2: Date & Time */}
          {step === "datetime" && (
            <motion.div key="datetime" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
              <div className="flex items-center gap-3 mb-6">
                <button onClick={() => setStep("service")} className="text-muted-foreground hover:text-foreground">
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <h2 className="text-2xl font-bold">Pick a date & time</h2>
              </div>

              {/* Date picker */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-3">
                  <p className="font-medium text-sm">Select date</p>
                  <div className="flex gap-1">
                    <Button variant="outline" size="icon" className="h-7 w-7" onClick={() => setCalendarOffset(Math.max(0, calendarOffset - 7))}>
                      <ChevronLeft className="w-3.5 h-3.5" />
                    </Button>
                    <Button variant="outline" size="icon" className="h-7 w-7" onClick={() => setCalendarOffset(calendarOffset + 7)}>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </div>
                <div className="grid grid-cols-7 gap-1.5">
                  {days.slice(0, 7).map((day) => {
                    const isPast = isBefore(startOfDay(day), startOfDay(new Date()));
                    const isSelected = format(day, "yyyy-MM-dd") === format(selectedDate, "yyyy-MM-dd");
                    return (
                      <button
                        key={day.toISOString()}
                        disabled={isPast}
                        onClick={() => { setSelectedDate(day); setSelectedTime(null); }}
                        className={`flex flex-col items-center py-2 rounded-xl text-xs transition-all ${
                          isSelected ? "gradient-primary text-white" :
                          isPast ? "opacity-30 cursor-not-allowed" :
                          "hover:bg-accent"
                        }`}
                      >
                        <span className="font-medium">{format(day, "EEE")}</span>
                        <span className="text-base font-bold">{format(day, "d")}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Time slots */}
              <div>
                <p className="font-medium text-sm mb-3">Available times</p>
                <div className="grid grid-cols-4 sm:grid-cols-5 gap-2">
                  {TIME_SLOTS.map((slot) => {
                    const available = availableSlots[slot] !== false;
                    const isSelected = slot === selectedTime;
                    return (
                      <button
                        key={slot}
                        disabled={!available}
                        onClick={() => setSelectedTime(slot)}
                        className={`py-2 rounded-lg text-sm font-medium transition-all ${
                          isSelected ? "gradient-primary text-white" :
                          !available ? "opacity-30 cursor-not-allowed bg-muted line-through" :
                          "border border-border hover:border-primary/50 hover:bg-accent"
                        }`}
                      >
                        {formatTime(slot)}
                      </button>
                    );
                  })}
                </div>
              </div>

              <Button
                className="w-full mt-6"
                size="lg"
                disabled={!selectedTime}
                onClick={() => setStep("confirm")}
              >
                Continue
              </Button>
            </motion.div>
          )}

          {/* Step 3: Confirm */}
          {step === "confirm" && (
            <motion.div key="confirm" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
              <div className="flex items-center gap-3 mb-6">
                <button onClick={() => setStep("datetime")} className="text-muted-foreground hover:text-foreground">
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <h2 className="text-2xl font-bold">Confirm booking</h2>
              </div>

              <div className="rounded-xl border border-border p-5 mb-4 space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 gradient-primary rounded-xl flex items-center justify-center">
                    <Scissors className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="font-semibold">{selectedService?.name}</p>
                    <p className="text-sm text-muted-foreground">{business?.name}</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3 pt-2 border-t border-border text-sm">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Calendar className="w-4 h-4" />
                    {format(selectedDate, "EEEE, MMM d")}
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Clock className="w-4 h-4" />
                    {selectedTime ? formatTime(selectedTime) : ""}
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Clock className="w-4 h-4" />
                    {selectedService?.duration} min
                  </div>
                  <div className="flex items-center gap-2 font-semibold text-emerald-600">
                    <DollarSign className="w-4 h-4" />
                    {formatCurrency(selectedService?.price || 0)}
                  </div>
                </div>
              </div>

              <div className="space-y-2 mb-6">
                <label className="text-sm font-medium">Notes (optional)</label>
                <Textarea
                  placeholder="Any special requests or information..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={3}
                />
              </div>

              <Button className="w-full" size="lg" onClick={handleBook} disabled={submitting}>
                {submitting ? <><Loader2 className="w-4 h-4 animate-spin" /> Booking...</> : "Confirm booking"}
              </Button>
              <p className="text-xs text-muted-foreground text-center mt-3">
                You&apos;ll receive a confirmation once the business approves your request.
              </p>
            </motion.div>
          )}

          {/* Done */}
          {step === "done" && (
            <motion.div
              key="done"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-8"
            >
              <div className="w-20 h-20 rounded-full bg-emerald-100 dark:bg-emerald-900/20 flex items-center justify-center mx-auto mb-6">
                <CheckCircle className="w-10 h-10 text-emerald-500" />
              </div>
              <h2 className="text-3xl font-bold mb-2">You&apos;re booked!</h2>
              <p className="text-muted-foreground mb-2">
                {selectedService?.name} at {business?.name}
              </p>
              <p className="text-muted-foreground mb-8">
                {format(selectedDate, "EEEE, MMMM d")} at {selectedTime ? formatTime(selectedTime) : ""}
              </p>
              <Badge variant="pending" className="text-sm px-4 py-1.5 mb-8">Pending confirmation</Badge>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Link href="/businesses">
                  <Button variant="outline" size="lg">Browse more businesses</Button>
                </Link>
                <Link href="/dashboard">
                  <Button size="lg">View my appointments</Button>
                </Link>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
