"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  LayoutDashboard, Calendar, Scissors, Users, BarChart3,
  Settings, LogOut, BookOpen, ChevronLeft, Menu, Bell,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { createClient } from "@/lib/supabase/client";
import { useState } from "react";
import { getInitials } from "@/lib/utils";

const navItems = [
  { href: "/dashboard", icon: LayoutDashboard, label: "Overview" },
  { href: "/dashboard/calendar", icon: Calendar, label: "Calendar" },
  { href: "/dashboard/services", icon: Scissors, label: "Services" },
  { href: "/dashboard/customers", icon: Users, label: "Customers" },
  { href: "/dashboard/analytics", icon: BarChart3, label: "Analytics" },
  { href: "/dashboard/settings", icon: Settings, label: "Settings" },
];

interface Props {
  profile: { name: string; email: string; avatar_url?: string; role: string } | null;
}

export default function DashboardSidebar({ profile }: Props) {
  const pathname = usePathname();
  const router = useRouter();
  const [collapsed, setCollapsed] = useState(false);
  const supabase = createClient();

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push("/");
  };

  return (
    <motion.aside
      animate={{ width: collapsed ? 72 : 256 }}
      transition={{ duration: 0.2, ease: "easeInOut" }}
      className="relative flex flex-col h-screen bg-card border-r border-border overflow-hidden shrink-0"
    >
      {/* Logo */}
      <div className="flex items-center justify-between p-4 h-16 border-b border-border">
        {!collapsed && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex items-center gap-2"
          >
            <div className="w-8 h-8 gradient-primary rounded-lg flex items-center justify-center">
              <BookOpen className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-lg">BookFlow</span>
          </motion.div>
        )}
        {collapsed && (
          <div className="w-8 h-8 gradient-primary rounded-lg flex items-center justify-center mx-auto">
            <BookOpen className="w-4 h-4 text-white" />
          </div>
        )}
        {!collapsed && (
          <Button variant="ghost" size="icon" onClick={() => setCollapsed(true)} className="ml-auto">
            <ChevronLeft className="w-4 h-4" />
          </Button>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        {collapsed && (
          <Button variant="ghost" size="icon" onClick={() => setCollapsed(false)} className="w-full mb-2">
            <Menu className="w-4 h-4" />
          </Button>
        )}
        {navItems.map((item) => {
          const isActive = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href));
          return (
            <Link key={item.href} href={item.href}>
              <motion.div
                whileHover={{ x: 2 }}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors cursor-pointer",
                  isActive
                    ? "gradient-primary text-white shadow-sm"
                    : "text-muted-foreground hover:text-foreground hover:bg-accent"
                )}
              >
                <item.icon className="w-4 h-4 shrink-0" />
                {!collapsed && <span>{item.label}</span>}
              </motion.div>
            </Link>
          );
        })}
      </nav>

      {/* User section */}
      <div className="p-3 border-t border-border">
        {!collapsed ? (
          <div className="flex items-center gap-3 px-2 py-2">
            <Avatar className="h-8 w-8">
              <AvatarImage src={profile?.avatar_url} />
              <AvatarFallback className="text-xs gradient-primary text-white">
                {getInitials(profile?.name || "U")}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{profile?.name}</p>
              <p className="text-xs text-muted-foreground truncate">{profile?.email}</p>
            </div>
            <Button variant="ghost" size="icon" onClick={handleSignOut} className="shrink-0">
              <LogOut className="w-4 h-4" />
            </Button>
          </div>
        ) : (
          <Button variant="ghost" size="icon" onClick={handleSignOut} className="w-full">
            <LogOut className="w-4 h-4" />
          </Button>
        )}
      </div>
    </motion.aside>
  );
}
