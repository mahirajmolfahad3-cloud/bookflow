"use client";
import { useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Edit, Trash2, Clock, DollarSign, ToggleLeft, ToggleRight, Scissors } from "lucide-react";
import DashboardHeader from "@/components/layout/DashboardHeader";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import ServiceForm from "@/components/dashboard/ServiceForm";
import { useAuth } from "@/hooks/useAuth";
import { getBusinessByOwner, getServicesByBusiness, deleteService, updateService } from "@/lib/queries";
import type { Service } from "@/types";
import { formatCurrency } from "@/lib/utils";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";

export default function ServicesPage() {
  const { user } = useAuth();
  const [services, setServices] = useState<Service[]>([]);
  const [businessId, setBusinessId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingService, setEditingService] = useState<Service | undefined>();

  const loadData = useCallback(async () => {
    if (!user) return;
    const business = await getBusinessByOwner(user.id);
    if (business) {
      setBusinessId(business.id);
      const data = await getServicesByBusiness(business.id);
      setServices(data);
    }
    setLoading(false);
  }, [user]);

  useEffect(() => { loadData(); }, [loadData]);

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this service? This cannot be undone.")) return;
    try {
      await deleteService(id);
      setServices((prev) => prev.filter((s) => s.id !== id));
      toast.success("Service deleted");
    } catch {
      toast.error("Failed to delete service");
    }
  };

  const handleToggle = async (service: Service) => {
    try {
      await updateService(service.id, { is_available: !service.is_available });
      setServices((prev) => prev.map((s) => s.id === service.id ? { ...s, is_available: !s.is_available } : s));
      toast.success(`Service ${service.is_available ? "disabled" : "enabled"}`);
    } catch {
      toast.error("Failed to update service");
    }
  };

  const openCreate = () => { setEditingService(undefined); setDialogOpen(true); };
  const openEdit = (service: Service) => { setEditingService(service); setDialogOpen(true); };

  return (
    <div>
      <DashboardHeader title="Services" subtitle="Manage what you offer" />
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <p className="text-muted-foreground text-sm">{services.length} service{services.length !== 1 ? "s" : ""} configured</p>
          </div>
          <Button onClick={openCreate} disabled={!businessId}>
            <Plus className="w-4 h-4" /> Add Service
          </Button>
        </div>

        {loading ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(3)].map((_, i) => <Skeleton key={i} className="h-48" />)}
          </div>
        ) : !businessId ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-16 text-center">
              <Scissors className="w-12 h-12 text-muted-foreground mb-4" />
              <h3 className="font-semibold text-lg mb-2">Set up your business first</h3>
              <p className="text-muted-foreground text-sm">Go to Settings to create your business profile.</p>
            </CardContent>
          </Card>
        ) : services.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-16 text-center">
              <Scissors className="w-12 h-12 text-muted-foreground mb-4" />
              <h3 className="font-semibold text-lg mb-2">No services yet</h3>
              <p className="text-muted-foreground text-sm mb-4">Add your first service to start accepting bookings.</p>
              <Button onClick={openCreate}><Plus className="w-4 h-4" /> Add your first service</Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <AnimatePresence>
              {services.map((service, i) => (
                <motion.div
                  key={service.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ delay: i * 0.05 }}
                >
                  <Card className="overflow-hidden">
                    <div className="h-2 gradient-primary" />
                    <CardContent className="p-5">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1 min-w-0 mr-2">
                          <h3 className="font-semibold truncate">{service.name}</h3>
                          {service.description && (
                            <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{service.description}</p>
                          )}
                        </div>
                        <Badge variant={service.is_available ? "completed" : "cancelled"} className="shrink-0">
                          {service.is_available ? "Active" : "Inactive"}
                        </Badge>
                      </div>

                      <div className="flex items-center gap-4 mb-4 text-sm">
                        <div className="flex items-center gap-1.5 text-muted-foreground">
                          <DollarSign className="w-4 h-4" />
                          <span className="font-semibold text-foreground">{formatCurrency(service.price)}</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-muted-foreground">
                          <Clock className="w-4 h-4" />
                          <span>{service.duration} min</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm" className="flex-1" onClick={() => openEdit(service)}>
                          <Edit className="w-3.5 h-3.5" /> Edit
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => handleToggle(service)}>
                          {service.is_available ? <ToggleRight className="w-4 h-4 text-primary" /> : <ToggleLeft className="w-4 h-4" />}
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDelete(service.id)}
                          className="text-destructive hover:text-destructive hover:bg-destructive/10"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingService ? "Edit Service" : "Add New Service"}</DialogTitle>
          </DialogHeader>
          {businessId && (
            <ServiceForm
              businessId={businessId}
              service={editingService}
              onSuccess={() => { setDialogOpen(false); loadData(); }}
              onCancel={() => setDialogOpen(false)}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
