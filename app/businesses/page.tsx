"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Search, MapPin, Tag, Calendar, BookOpen } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { getAllBusinesses } from "@/lib/queries";
import type { Business } from "@/types";

export default function BusinessesPage() {
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [filtered, setFiltered] = useState<Business[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getAllBusinesses().then((data) => {
      setBusinesses(data);
      setFiltered(data);
      setLoading(false);
    });
  }, []);

  useEffect(() => {
    const q = search.toLowerCase();
    setFiltered(
      businesses.filter(
        (b) =>
          b.name.toLowerCase().includes(q) ||
          b.category.toLowerCase().includes(q) ||
          b.location?.toLowerCase().includes(q)
      )
    );
  }, [search, businesses]);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="gradient-hero py-16 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <Link href="/" className="inline-flex items-center gap-2 mb-8">
            <div className="w-8 h-8 gradient-primary rounded-lg flex items-center justify-center">
              <BookOpen className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-lg text-white">BookFlow</span>
          </Link>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">Find and book services</h1>
          <p className="text-white/60 text-lg mb-8">Discover local businesses and book appointments instantly</p>
          <div className="relative max-w-xl mx-auto">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40" />
            <Input
              placeholder="Search businesses, services, or location..."
              className="pl-12 h-12 bg-white/10 border-white/20 text-white placeholder:text-white/40 focus-visible:ring-purple-400 rounded-xl"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>
      </div>

      {/* Results */}
      <div className="max-w-6xl mx-auto px-6 py-12">
        {loading ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-48 rounded-2xl bg-muted animate-pulse" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-16">
            <Calendar className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="font-semibold text-xl mb-2">No businesses found</h3>
            <p className="text-muted-foreground">Try adjusting your search.</p>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((biz, i) => (
              <motion.div
                key={biz.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
              >
                <Card className="overflow-hidden hover:shadow-lg transition-all group">
                  <div className="h-32 gradient-primary opacity-80 group-hover:opacity-100 transition-opacity" />
                  <CardContent className="p-5">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-semibold text-lg leading-tight">{biz.name}</h3>
                      <Badge variant="outline" className="shrink-0 ml-2">
                        <Tag className="w-3 h-3 mr-1" />
                        {biz.category}
                      </Badge>
                    </div>
                    {biz.description && (
                      <p className="text-sm text-muted-foreground mb-3 line-clamp-2">{biz.description}</p>
                    )}
                    {biz.location && (
                      <div className="flex items-center gap-1 text-xs text-muted-foreground mb-4">
                        <MapPin className="w-3.5 h-3.5" />
                        {biz.location}
                      </div>
                    )}
                    <Link href={`/book/${biz.id}`}>
                      <Button className="w-full" size="sm">
                        <Calendar className="w-4 h-4" />
                        Book appointment
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
