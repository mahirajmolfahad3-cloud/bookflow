"use client";
import { motion } from "framer-motion";
import { LucideIcon, TrendingUp, TrendingDown } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface Props {
  title: string;
  value: string | number;
  change?: number;
  icon: LucideIcon;
  color?: "purple" | "blue" | "green" | "orange";
  index?: number;
}

const colorMap = {
  purple: "from-purple-500 to-purple-700",
  blue: "from-blue-500 to-blue-700",
  green: "from-emerald-500 to-emerald-700",
  orange: "from-orange-500 to-orange-700",
};

export default function StatsCard({ title, value, change, icon: Icon, color = "purple", index = 0 }: Props) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1, duration: 0.4 }}
    >
      <Card className="overflow-hidden">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center bg-gradient-to-br", colorMap[color])}>
              <Icon className="w-5 h-5 text-white" />
            </div>
            {change !== undefined && (
              <div className={cn("flex items-center gap-1 text-xs font-medium", change >= 0 ? "text-emerald-500" : "text-red-500")}>
                {change >= 0 ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />}
                {Math.abs(change)}%
              </div>
            )}
          </div>
          <div className="text-2xl font-bold mb-1">{value}</div>
          <div className="text-sm text-muted-foreground">{title}</div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
