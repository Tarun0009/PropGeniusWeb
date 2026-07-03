# PropGenius AI

AI-powered real estate CRM and listing generator for the Indian market, built with Next.js App Router, Supabase, TanStack Query, Tailwind CSS, Gemini, Razorpay, and Twilio WhatsApp.

## Folder Structure

```text
src/
  app/                  Next.js routes, layouts, pages, and API route handlers
  components/
    ui/                 Shared UI primitives
    layout/             App shell components such as sidebar, topbar, providers
  features/
    analytics/          Analytics charts, hooks, and types
    auth/               Auth provider and auth store
    billing/            Billing UI, subscription hooks, quota hook, and types
    dashboard/          Dashboard-specific UI
    landing/            Landing page sections
    leads/              Lead UI, hooks, and types
    listings/           Listing UI, hooks, and types
    messages/           WhatsApp/message UI, hooks, templates, and types
    onboarding/         Onboarding tour UI and hook
    search/             Global search UI
    team/               Team hooks and member lookup helpers
    users/              User/profile/organization types
  lib/                  Shared infrastructure, utilities, services, validations
  stores/               Cross-cutting UI stores
```

Keep new feature-specific components, hooks, and types inside the matching `src/features/<feature>/` folder. Keep only reusable primitives in `src/components/ui` and route files in `src/app`.

## Scripts

```bash
npm run dev
npm run build
npm run lint
npm run type-check
```

## Environment

Copy `.env.example` to `.env.local` and fill Supabase, Gemini, Razorpay, Twilio, Resend, and app URL values before running the app locally.