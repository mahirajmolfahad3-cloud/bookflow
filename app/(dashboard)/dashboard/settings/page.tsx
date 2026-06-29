"use client";
import { useEffect, useState, useCallback } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2, Building2, User, Clock } from "lucide-react";
import DashboardHeader from "@/components/layout/DashboardHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { useAuth } from "@/hooks/useAuth";
import { getBusinessByOwner, upsertBusiness, updateProfile } from "@/lib/queries";
import { toast } from "sonner";

const businessSchema = z.object({
  name: z.string().min(1, "Business name is required"),
  category: z.string().min(1, "Category is required"),
  description: z.string().optional(),
  location: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().email("Invalid email").optional().or(z.literal("")),
});

const profileSchema = z.object({
  name: z.string().min(2, "Name is required"),
  phone: z.string().optional(),
});

const DAYS = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"];

const defaultHours = DAYS.reduce((acc, day) => ({
  ...acc,
  [day]: { open: "09:00", close: "17:00", enabled: day !== "sunday" },
}), {} as Record<string, { open: string; close: string; enabled: boolean }>);

export default function SettingsPage() {
  const { user, profile } = useAuth();
  const [businessId, setBusinessId] = useState<string | null>(null);
  const [workingHours, setWorkingHours] = useState(defaultHours);

  const businessForm = useForm({ resolver: zodResolver(businessSchema) });
  const profileForm = useForm({
    resolver: zodResolver(profileSchema),
    defaultValues: { name: profile?.name || "", phone: profile?.phone || "" },
  });

  const loadBusiness = useCallback(async () => {
    if (!user) return;
    const biz = await getBusinessByOwner(user.id);
    if (biz) {
      setBusinessId(biz.id);
      businessForm.reset({
        name: biz.name,
        category: biz.category,
        description: biz.description || "",
        location: biz.location || "",
        phone: biz.phone || "",
        email: biz.email || "",
      });
      if (biz.working_hours) setWorkingHours(biz.working_hours as typeof defaultHours);
    }
  }, [user]);

  useEffect(() => { loadBusiness(); }, [loadBusiness]);

  useEffect(() => {
    if (profile) {
      profileForm.reset({ name: profile.name, phone: profile.phone || "" });
    }
  }, [profile]);

  const onSaveBusiness = async (data: any) => {
    if (!user) return;
    try {
      await upsertBusiness({
        ...(businessId ? { id: businessId } : {}),
        owner_id: user.id,
        is_active: true,
        working_hours: workingHours,
        ...data,
      });
      toast.success("Business settings saved");
      loadBusiness();
    } catch {
      toast.error("Failed to save settings");
    }
  };

  const onSaveProfile = async (data: any) => {
    if (!user) return;
    try {
      await updateProfile(user.id, data);
      toast.success("Profile updated");
    } catch {
      toast.error("Failed to update profile");
    }
  };

  const toggleDay = (day: string) => {
    setWorkingHours((prev) => ({
      ...prev,
      [day]: { ...prev[day], enabled: !prev[day].enabled },
    }));
  };

  const updateHour = (day: string, field: "open" | "close", value: string) => {
    setWorkingHours((prev) => ({
      ...prev,
      [day]: { ...prev[day], [field]: value },
    }));
  };

  return (
    <div>
      <DashboardHeader title="Settings" subtitle="Manage your account and business" />
      <div className="p-6 max-w-3xl">
        <Tabs defaultValue="business">
          <TabsList className="mb-6">
            <TabsTrigger value="business"><Building2 className="w-4 h-4 mr-2" />Business</TabsTrigger>
            <TabsTrigger value="hours"><Clock className="w-4 h-4 mr-2" />Hours</TabsTrigger>
            <TabsTrigger value="profile"><User className="w-4 h-4 mr-2" />Profile</TabsTrigger>
          </TabsList>

          <TabsContent value="business">
            <Card>
              <CardHeader>
                <CardTitle>Business Profile</CardTitle>
                <CardDescription>How clients see your business</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={businessForm.handleSubmit(onSaveBusiness)} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Business Name</Label>
                      <Input placeholder="Bloom Salon" {...businessForm.register("name")} />
                      {businessForm.formState.errors.name && (
                        <p className="text-xs text-destructive">{String(businessForm.formState.errors.name.message)}</p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label>Category</Label>
                      <Input placeholder="e.g. Salon, Clinic, Fitness" {...businessForm.register("category")} />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Description</Label>
                    <Textarea rows={3} placeholder="Tell clients about your business..." {...businessForm.register("description")} />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Location</Label>
                      <Input placeholder="123 Main St, City" {...businessForm.register("location")} />
                    </div>
                    <div className="space-y-2">
                      <Label>Phone</Label>
                      <Input placeholder="+1 (555) 000-0000" {...businessForm.register("phone")} />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Business Email</Label>
                    <Input type="email" placeholder="hello@yourbusiness.com" {...businessForm.register("email")} />
                  </div>
                  <Button type="submit" disabled={businessForm.formState.isSubmitting}>
                    {businessForm.formState.isSubmitting ? <><Loader2 className="w-4 h-4 animate-spin" /> Saving...</> : "Save changes"}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="hours">
            <Card>
              <CardHeader>
                <CardTitle>Working Hours</CardTitle>
                <CardDescription>Set when clients can book appointments</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {DAYS.map((day) => (
                  <div key={day} className="flex items-center gap-4">
                    <div className="w-28 flex items-center gap-2">
                      <Switch checked={workingHours[day]?.enabled} onCheckedChange={() => toggleDay(day)} />
                      <span className="text-sm font-medium capitalize">{day.slice(0, 3)}</span>
                    </div>
                    {workingHours[day]?.enabled ? (
                      <div className="flex items-center gap-2">
                        <Input
                          type="time"
                          className="w-32 h-8 text-sm"
                          value={workingHours[day]?.open}
                          onChange={(e) => updateHour(day, "open", e.target.value)}
                        />
                        <span className="text-muted-foreground text-sm">to</span>
                        <Input
                          type="time"
                          className="w-32 h-8 text-sm"
                          value={workingHours[day]?.close}
                          onChange={(e) => updateHour(day, "close", e.target.value)}
                        />
                      </div>
                    ) : (
                      <span className="text-sm text-muted-foreground">Closed</span>
                    )}
                  </div>
                ))}
                <Button
                  className="mt-4"
                  onClick={() => businessForm.handleSubmit(onSaveBusiness)()}
                  disabled={businessForm.formState.isSubmitting}
                >
                  Save hours
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="profile">
            <Card>
              <CardHeader>
                <CardTitle>Personal Profile</CardTitle>
                <CardDescription>Update your account details</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={profileForm.handleSubmit(onSaveProfile)} className="space-y-4">
                  <div className="space-y-2">
                    <Label>Full Name</Label>
                    <Input {...profileForm.register("name")} />
                    {profileForm.formState.errors.name && (
                      <p className="text-xs text-destructive">{String(profileForm.formState.errors.name.message)}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label>Email</Label>
                    <Input value={profile?.email || ""} disabled className="opacity-60" />
                    <p className="text-xs text-muted-foreground">Email cannot be changed here.</p>
                  </div>
                  <div className="space-y-2">
                    <Label>Phone</Label>
                    <Input placeholder="+1 (555) 000-0000" {...profileForm.register("phone")} />
                  </div>
                  <Button type="submit" disabled={profileForm.formState.isSubmitting}>
                    {profileForm.formState.isSubmitting ? <><Loader2 className="w-4 h-4 animate-spin" /> Saving...</> : "Update profile"}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
