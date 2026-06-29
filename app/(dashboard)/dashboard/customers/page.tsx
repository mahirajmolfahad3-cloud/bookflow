"use client";
import { useEffect, useState, useCallback } from "react";
import { motion } from "framer-motion";
import { Search, Users, Mail, Calendar, DollarSign } from "lucide-react";
import DashboardHeader from "@/components/layout/DashboardHeader";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useAuth } from "@/hooks/useAuth";
import { getBusinessByOwner, getCustomersByBusiness } from "@/lib/queries";
import { formatCurrency, formatDate, getInitials } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";

export default function CustomersPage() {
  const { user } = useAuth();
  const [customers, setCustomers] = useState<any[]>([]);
  const [filtered, setFiltered] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async () => {
    if (!user) return;
    const business = await getBusinessByOwner(user.id);
    if (business) {
      const data = await getCustomersByBusiness(business.id);
      setCustomers(data);
      setFiltered(data);
    }
    setLoading(false);
  }, [user]);

  useEffect(() => { loadData(); }, [loadData]);

  useEffect(() => {
    const q = search.toLowerCase();
    setFiltered(
      customers.filter(
        (c) => c.name?.toLowerCase().includes(q) || c.email?.toLowerCase().includes(q)
      )
    );
  }, [search, customers]);

  return (
    <div>
      <DashboardHeader title="Customers" subtitle="Your customer base" />
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <p className="text-muted-foreground text-sm">{customers.length} total customers</p>
          <div className="relative w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search customers..."
              className="pl-9"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        {loading ? (
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-20" />)}
          </div>
        ) : filtered.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-16 text-center">
              <Users className="w-12 h-12 text-muted-foreground mb-4" />
              <h3 className="font-semibold text-lg mb-2">
                {search ? "No customers found" : "No customers yet"}
              </h3>
              <p className="text-muted-foreground text-sm">
                {search ? "Try a different search term." : "Customers will appear here after their first booking."}
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="rounded-xl border border-border overflow-hidden">
            <div className="hidden md:grid grid-cols-5 px-6 py-3 bg-muted/50 text-xs font-medium text-muted-foreground uppercase tracking-wider">
              <div className="col-span-2">Customer</div>
              <div>Last visit</div>
              <div>Appointments</div>
              <div>Total spent</div>
            </div>
            {filtered.map((customer, i) => (
              <motion.div
                key={customer.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: i * 0.03 }}
                className="grid md:grid-cols-5 gap-4 px-6 py-4 border-t border-border hover:bg-accent/30 transition-colors items-center"
              >
                <div className="col-span-2 flex items-center gap-3">
                  <Avatar className="h-9 w-9 shrink-0">
                    <AvatarFallback className="text-xs gradient-primary text-white">
                      {getInitials(customer.name || "?")}
                    </AvatarFallback>
                  </Avatar>
                  <div className="min-w-0">
                    <p className="font-medium text-sm truncate">{customer.name}</p>
                    <p className="text-xs text-muted-foreground truncate flex items-center gap-1">
                      <Mail className="w-3 h-3" />
                      {customer.email}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                  <Calendar className="w-3.5 h-3.5" />
                  {customer.lastVisit ? formatDate(customer.lastVisit) : "—"}
                </div>
                <div className="text-sm font-medium">{customer.appointmentCount}</div>
                <div className="flex items-center gap-1.5 text-sm font-semibold text-emerald-600">
                  <DollarSign className="w-3.5 h-3.5" />
                  {formatCurrency(customer.totalSpending)}
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
