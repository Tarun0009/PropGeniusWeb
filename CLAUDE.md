# PropGenius AI — Claude Code Instructions

## Project Overview
AI-Powered Real Estate CRM + Listing Generator for the Indian market.
SaaS with subscriptions, team management, WhatsApp messaging, and analytics.

## Tech Stack
- **Framework**: Next.js 16, App Router, TypeScript strict mode
- **Styling**: Tailwind CSS v4 (use canonical classes — see Tailwind v4 notes below)
- **State**: Zustand (auth/notifications), TanStack React Query (server data)
- **Forms**: React Hook Form + Zod v4
- **Database**: Supabase (PostgreSQL + RLS + Storage + Auth)
- **AI**: Google Gemini 2.5 Flash (`@google/generative-ai`)
- **Payments**: Razorpay (subscriptions + webhooks)
- **Messaging**: Twilio WhatsApp Business API
- **Email**: Resend
- **Deployment**: Vercel

## Architecture Rules

### Server vs Client
- `src/app/api/` routes are always server-side
- `src/app/(dashboard)/` pages are client components (`"use client"`)
- `src/app/page.tsx` (landing) is a server component — keep it async
- Use `createClient()` from `@/lib/supabase/server` in API routes and server components
- Use `createClient()` from `@/lib/supabase/client` in client components and hooks
- Use `createAdminClient()` from `@/lib/supabase/admin` only in API routes (requires `SUPABASE_SERVICE_ROLE_KEY`)

### Data Fetching
- All data fetching hooks live in `src/hooks/`
- Use TanStack React Query (`useQuery`, `useMutation`) for all server data
- Auth state is in Zustand `useAuthStore` — `profile` includes nested `organization`
- The profile query: `select("*, organization:organizations(*)")` — organization is always available on profile

### Auth Flow
- Login → `/dashboard`
- Signup → `/dashboard`
- Forgot password → email with link → `/api/auth/callback?type=recovery` → `/reset-password`
- Invite member → email → `/api/auth/callback` → `/reset-password?invited=true` → `/dashboard`
- Middleware: unauthenticated users at protected routes → `/login`
- Logged-in users CAN visit `/` (landing page) — middleware does NOT redirect them

### Plan System
- Plans: `free` (Starter), `pro` (Pro), `business` (Business)
- Limits are in `src/lib/constants.ts` → `PLAN_LIMITS`
- `free`:     10 listings, 100 leads, 1 agent
- `pro`:      unlimited listings, unlimited leads, 5 agents ($10/mo)
- `business`: unlimited everything ($29/mo)
- Plan is stored on `organizations.plan` column — NOT the `subscriptions` table
- `useQuota()` hook reads from `profile.organization.plan` → resolves limits

### Team & Permissions
- Roles: `owner`, `admin`, `agent`
- `canManageOrg()` / `canManageTeam()` / `canManageBilling()` in `src/lib/permissions.ts`
- Invite flow uses `adminClient.auth.admin.inviteUserByEmail()` — requires service role key

## Coding Conventions

### Tailwind v4 — Critical
- Use spacing scale: `max-w-100` not `max-w-[400px]`, `w-85` not `w-[340px]`
- Gradients: `bg-linear-to-r` not `bg-gradient-to-r`
- Background size: `bg-size-[16px]` not `bg-[length:16px]`
- Background position: `bg-position-[right_8px_center]` not `bg-[right_8px_center]`

### Zod v4
- Use `message:` not `required_error:` in schema params
- Avoid `.default()` in schemas used with React Hook Form
- Use `valueAsNumber: true` in `register()` for numeric fields
- `z.record()` requires 2 args: `z.record(z.string(), z.unknown())`

### Components
- UI primitives in `src/components/ui/` — use these, don't create new ones
- Heavy components use `next/dynamic` for code splitting (Kanban, charts)
- `next/image` for all listing images (configured for `*.supabase.co`)

### External Services — Lazy Init
- Twilio, Resend, Razorpay clients MUST be lazy-initialized (inside functions, never at module level)
- Webhook routes use `createAdminClient()`

### Icons
- Use intentional icon choices — not generic AI defaults
- Current system: `House` (listings), `Landmark` (org/property), `Contact` (leads),
  `MessageCircleMore` (messages), `TrendingUp` (analytics), `SlidersHorizontal` (settings)

## Design System

### Colors (Violet primary)
- Primary: `#7C3AED` (violet-600) — sidebar, CTAs, active states
- Danger: Rose (`#E11D48`)
- Success: Emerald
- Info: Sky (`#0284C7`)
- Background: `#F8F7FC` (warm violet-tinted off-white)
- Sidebar: `#0F0B1E` (deep violet-black)

### Typography
- Base: 15px
- Labels: `text-[11px] font-semibold uppercase tracking-wider text-slate-400`
- Numbers/prices: `tabular-nums`

## Dev Utilities

### Test Plan Upgrade (dev only)
```js
// In browser console while logged in:
fetch('/api/billing/dev-upgrade', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ plan: 'pro' }) // 'free' | 'pro' | 'business'
}).then(r => r.json()).then(console.log)
```
Then update `organizations.plan` in Supabase to match, and hard-refresh.

### Supabase Direct Plan Update
Table Editor → `organizations` → change `plan` column → Save → hard refresh app.

## Environment Variables Required
```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=        # Required for team invites + webhook processing
GEMINI_API_KEY=
NEXT_PUBLIC_RAZORPAY_KEY_ID=
RAZORPAY_KEY_SECRET=
RAZORPAY_WEBHOOK_SECRET=
RAZORPAY_PLAN_PRO_MONTHLY=        # Create plans in Razorpay dashboard first
RAZORPAY_PLAN_PRO_ANNUAL=
RAZORPAY_PLAN_BUSINESS_MONTHLY=
RAZORPAY_PLAN_BUSINESS_ANNUAL=
TWILIO_ACCOUNT_SID=
TWILIO_AUTH_TOKEN=
TWILIO_WHATSAPP_NUMBER=
RESEND_API_KEY=
NEXT_PUBLIC_APP_URL=              # e.g. http://localhost:3000
```

## Database Tables
- `organizations` — org info + `plan` column (source of truth for plan)
- `profiles` — user profiles with `organization_id`, `role`
- `listings` — property listings with `created_by`, `organization_id`
- `leads` — CRM leads with `assigned_to`, `organization_id`
- `lead_activities` — activity timeline per lead
- `whatsapp_messages` — WhatsApp conversation history
- `subscriptions` — Razorpay subscription records (informational, not used for plan gating)

All tables have RLS policies for org isolation.

## User Preferences
- User handles all git operations (commit, push) — never auto-commit or push
- Keep responses concise and direct
- Don't add comments unless logic is non-obvious
- Don't over-engineer — solve exactly what's asked
