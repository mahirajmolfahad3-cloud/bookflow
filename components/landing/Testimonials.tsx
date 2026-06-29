"use client";
import { motion } from "framer-motion";
import { Star } from "lucide-react";

const testimonials = [
  {
    name: "Sarah Chen",
    role: "Owner, Bloom Salon",
    avatar: "SC",
    rating: 5,
    text: "BookFlow completely transformed how we manage appointments. No-shows dropped by 60% and our front desk staff finally has time to focus on guests.",
  },
  {
    name: "Dr. Marcus Webb",
    role: "Physical Therapist",
    avatar: "MW",
    rating: 5,
    text: "The analytics dashboard showed me my peak hours were Tuesday evenings — something I never would have known. Optimized my schedule and increased revenue by 30%.",
  },
  {
    name: "Priya Nair",
    role: "Fitness Trainer",
    avatar: "PN",
    rating: 5,
    text: "My clients love how easy the booking page is. I've got clients booking at 2am while I sleep. It's like having a receptionist that never takes a day off.",
  },
];

export default function Testimonials() {
  return (
    <section className="py-24 px-6 bg-background">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <p className="text-primary text-sm font-semibold uppercase tracking-widest mb-4">Testimonials</p>
          <h2 className="text-4xl md:text-5xl font-bold mb-4">Loved by small businesses</h2>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-6">
          {testimonials.map((t, i) => (
            <motion.div
              key={t.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="p-6 rounded-2xl border border-border bg-card"
            >
              <div className="flex mb-4">
                {[...Array(t.rating)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-yellow-400 text-yellow-400" />
                ))}
              </div>
              <p className="text-muted-foreground text-sm leading-relaxed mb-6">"{t.text}"</p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full gradient-primary flex items-center justify-center text-white text-sm font-semibold">
                  {t.avatar}
                </div>
                <div>
                  <p className="font-semibold text-sm">{t.name}</p>
                  <p className="text-xs text-muted-foreground">{t.role}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
