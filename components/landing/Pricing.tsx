"use client";
import { motion } from "framer-motion";
import Link from "next/link";
import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";

const plans = [
  {
    name: "Starter",
    price: "Free",
    period: "forever",
    description: "Perfect for solo practitioners just getting started.",
    features: ["Up to 50 appointments/month", "1 service", "Basic calendar", "Email confirmations", "Customer portal"],
    cta: "Start free",
    href: "/signup",
    popular: false,
  },
  {
    name: "Pro",
    price: "$29",
    period: "per month",
    description: "Everything a growing business needs to scale.",
    features: ["Unlimited appointments", "Unlimited services", "Advanced analytics", "SMS reminders", "Custom booking page", "Priority support", "Stripe payments"],
    cta: "Start 14-day trial",
    href: "/signup?plan=pro",
    popular: true,
  },
  {
    name: "Business",
    price: "$79",
    period: "per month",
    description: "For teams and multi-location businesses.",
    features: ["Everything in Pro", "Up to 10 staff members", "Multi-location support", "White-label booking", "API access", "Dedicated account manager"],
    cta: "Contact sales",
    href: "/contact",
    popular: false,
  },
];

export default function Pricing() {
  return (
    <section id="pricing" className="py-24 px-6 bg-muted/30">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <p className="text-primary text-sm font-semibold uppercase tracking-widest mb-4">Pricing</p>
          <h2 className="text-4xl md:text-5xl font-bold mb-4">Simple, transparent pricing</h2>
          <p className="text-muted-foreground text-lg">No hidden fees. Upgrade or downgrade at any time.</p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8 items-start">
          {plans.map((plan, i) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className={`relative rounded-2xl border p-8 ${
                plan.popular
                  ? "border-primary shadow-xl shadow-primary/10 bg-card scale-105"
                  : "border-border bg-card"
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="gradient-primary text-white text-xs font-semibold px-3 py-1 rounded-full">
                    Most popular
                  </span>
                </div>
              )}
              <div className="mb-6">
                <h3 className="font-bold text-lg mb-1">{plan.name}</h3>
                <div className="flex items-baseline gap-1 mb-2">
                  <span className="text-4xl font-bold">{plan.price}</span>
                  <span className="text-muted-foreground text-sm">/{plan.period}</span>
                </div>
                <p className="text-muted-foreground text-sm">{plan.description}</p>
              </div>
              <ul className="space-y-3 mb-8">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-center gap-3 text-sm">
                    <Check className="w-4 h-4 text-primary shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>
              <Link href={plan.href}>
                <Button
                  className="w-full"
                  variant={plan.popular ? "default" : "outline"}
                  size="lg"
                >
                  {plan.cta}
                </Button>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
