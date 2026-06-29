import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import DashboardSidebar from "@/components/layout/DashboardSidebar";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("name, email, avatar_url, role")
    .eq("id", user.id)
    .single();

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      <DashboardSidebar profile={profile} />
      <div className="flex-1 overflow-y-auto">
        {children}
      </div>
    </div>
  );
}
