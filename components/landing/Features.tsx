"use client";
import { motion } from "framer-motion";
import { Calendar, Users, BarChart3, Bell, Smartphone, Shield, Zap, Clock } from "lucide-react";

const features = [
  {
    icon: Calendar,
    title: "Smart Scheduling",
    description: "Drag-and-drop calendar with conflict detection. Clients book 24/7 without back-and-forth.",
    color: "from-purple-500 to-purple-700",
  },
  {
    icon: Users,
    title: "Customer Profiles",
    description: "Complete history, preferences, and spending data for every customer in one place.",
    color: "from-blue-500 to-blue-700",
  },
  {
    icon: BarChart3,
    title: "Business Analytics",
    description: "Revenue trends, peak hours, and performance metrics that actually inform decisions.",
    color: "from-emerald-500 to-emerald-700",
  },
  {
    icon: Bell,
    title: "Automated Reminders",
    description: "Email and SMS reminders slash no-shows by up to 70% with zero manual work.",
    color: "from-orange-500 to-orange-700",
  },
  {
    icon: Smartphone,
    title: "Mobile Ready",
    description: "Your customers can book from any device. Looks perfect on phones, tablets, and desktops.",
    color: "from-pink-500 to-pink-700",
  },
  {
    icon: Shield,
    title: "Secure Payments",
    description: "PCI-compliant payment processing. Collect deposits or full payment at booking.",
    color: "from-teal-500 to-teal-700",
  },
];

export default function Features() {
  return (
    <section id="features" className="py-24 px-6 bg-background">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <p className="text-primary text-sm font-semibold uppercase tracking-widest mb-4">Features</p>
          <h2 className="text-4xl md:text-5xl font-bold mb-4">Everything you need, nothing you don't</h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Built specifically for service businesses that need reliability over complexity.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, i) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              whileHover={{ y: -4 }}
              className="p-6 rounded-2xl border border-border bg-card hover:shadow-lg transition-all"
            >
              <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${feature.color} flex items-center justify-center mb-4`}>
                <feature.icon className="w-6 h-6 text-white" />
              </div>
              <h3 className="font-semibold text-lg mb-2">{feature.title}</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
