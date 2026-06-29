"use client";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, Star, Zap, Shield, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Hero() {
  return (
    <section className="relative min-h-screen gradient-hero flex items-center overflow-hidden">
      {/* Background grid */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(139,92,246,0.06)_1px,transparent_1px),linear-gradient(90deg,rgba(139,92,246,0.06)_1px,transparent_1px)] bg-[size:64px_64px]" />

      {/* Glow effects */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-[120px]" />
      <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-pink-500/10 rounded-full blur-[80px]" />

      <div className="relative max-w-6xl mx-auto px-6 pt-24 pb-16">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          className="text-center max-w-4xl mx-auto"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 }}
            className="inline-flex items-center gap-2 glass rounded-full px-4 py-2 text-sm text-white/80 mb-8"
          >
            <Zap className="w-3.5 h-3.5 text-purple-400" />
            Trusted by 10,000+ small businesses
            <ArrowRight className="w-3.5 h-3.5" />
          </motion.div>

          <h1 className="text-5xl md:text-7xl font-bold text-white leading-tight mb-6">
            Manage appointments.{" "}
            <span className="text-gradient">Grow your business.</span>
          </h1>

          <p className="text-lg md:text-xl text-white/60 mb-10 max-w-2xl mx-auto leading-relaxed">
            BookFlow gives salons, clinics, trainers, and consultants a complete booking system
            that clients actually enjoy using.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
            <Link href="/signup">
              <Button size="xl" className="group">
                Start for free
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
            <Link href="#features">
              <Button size="xl" variant="glass" className="text-white">
                See how it works
              </Button>
            </Link>
          </div>

          {/* Social proof */}
          <div className="flex items-center justify-center gap-8 text-white/50 text-sm">
            <div className="flex items-center gap-1">
              <div className="flex">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                ))}
              </div>
              <span className="ml-1">4.9/5 rating</span>
            </div>
            <div className="w-px h-4 bg-white/20" />
            <span>No credit card required</span>
            <div className="hidden sm:block w-px h-4 bg-white/20" />
            <span className="hidden sm:block">Cancel anytime</span>
          </div>
        </motion.div>

        {/* Dashboard preview */}
        <motion.div
          initial={{ opacity: 0, y: 60 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.8 }}
          className="mt-16 max-w-5xl mx-auto"
        >
          <div className="glass rounded-2xl p-2 shadow-2xl shadow-purple-500/10">
            <div className="bg-card rounded-xl p-6 min-h-64">
              <div className="grid grid-cols-4 gap-4 mb-6">
                {[
                  { label: "Today", value: "12", color: "from-purple-500 to-purple-700" },
                  { label: "Revenue", value: "$2,840", color: "from-blue-500 to-blue-700" },
                  { label: "Customers", value: "847", color: "from-emerald-500 to-emerald-700" },
                  { label: "Bookings", value: "1,204", color: "from-orange-500 to-orange-700" },
                ].map((stat) => (
                  <div key={stat.label} className="bg-background rounded-xl p-4 border border-border">
                    <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${stat.color} mb-3`} />
                    <div className="text-xl font-bold">{stat.value}</div>
                    <div className="text-xs text-muted-foreground">{stat.label}</div>
                  </div>
                ))}
              </div>
              <div className="flex gap-2">
                {[85, 60, 90, 45, 75, 95, 65].map((h, i) => (
                  <div key={i} className="flex-1 bg-muted rounded overflow-hidden h-20 flex items-end">
                    <div
                      className="w-full gradient-primary rounded opacity-80"
                      style={{ height: `${h}%` }}
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
