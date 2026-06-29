# BookFlow

A production-quality appointment management SaaS for small businesses.

## Stack
- Next.js 15 (App Router) + TypeScript
- Tailwind CSS + Radix UI + Framer Motion
- Supabase (PostgreSQL + Auth + RLS)
- Recharts + FullCalendar + React Hook Form + Zod

## Quick Start

1. `npm install`
2. Create a Supabase project at supabase.com
3. Run `supabase/schema.sql` in your Supabase SQL editor
4. Copy `.env.local` and fill in your Supabase URL and anon key
5. `npm run dev`

## Environment Variables

```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

## Features
- Landing page with pricing, features, testimonials
- Email/password auth with role selection (owner / customer)
- Business owner dashboard: stats, revenue charts, calendar, services, customers, analytics, settings
- Public booking flow: browse businesses → select service → pick date/time → confirm
- Conflict-free slot availability checking
- Row Level Security on all tables
- Dark/light mode, responsive design, animations

See README_FULL.md or the inline comments for full documentation.
