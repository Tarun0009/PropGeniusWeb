---
title: "PropGenius AI — Product Documentation"
subtitle: "AI-Powered Real Estate CRM Platform for India"
date: "March 2026"
---

<div style="text-align:center; padding: 80px 0 40px;">
<h1 style="font-size:36px; font-weight:800; margin-bottom:8px;">PropGenius AI</h1>
<p style="font-size:18px; color:#64748b;">AI-Powered Real Estate CRM Platform</p>
<p style="font-size:14px; color:#94a3b8; margin-top:32px;">Product Documentation &amp; Feature Guide</p>
<p style="font-size:13px; color:#94a3b8;">Version 1.0 &bull; March 2026</p>
</div>

<div style="page-break-after: always;"></div>

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Problem Statement](#2-problem-statement)
3. [Solution Overview](#3-solution-overview)
4. [Tech Stack & Architecture](#4-tech-stack--architecture)
5. [Features & Functionality](#5-features--functionality)
   - 5.1 Authentication & Onboarding
   - 5.2 Dashboard
   - 5.3 AI Listing Generator
   - 5.4 Listing Management
   - 5.5 CRM & Lead Management
   - 5.6 WhatsApp Messaging
   - 5.7 Analytics Dashboard
   - 5.8 Billing & Subscriptions
   - 5.9 Settings
6. [AI Capabilities](#6-ai-capabilities)
7. [Database Schema](#7-database-schema)
8. [API Reference](#8-api-reference)
9. [Security & Privacy](#9-security--privacy)
10. [Pricing Plans](#10-pricing-plans)
11. [Deployment & Infrastructure](#11-deployment--infrastructure)
12. [Roadmap](#12-roadmap)

<div style="page-break-after: always;"></div>

## 1. Executive Summary

**PropGenius AI** is a comprehensive SaaS platform purpose-built for the Indian real estate market. It combines AI-powered listing generation with a full-featured CRM, WhatsApp Business integration, analytics dashboard, and subscription billing — giving real estate agents, brokers, and agencies everything they need in one platform.

The platform leverages **Google Gemini AI** to automate time-consuming tasks like writing property descriptions, scoring leads, suggesting WhatsApp replies, and optimizing listings for better performance. It is built on modern web technologies and deployed on Vercel for global edge performance.

### Key Highlights

- **AI-First Approach**: 6 distinct AI features powered by Google Gemini
- **India-Focused**: INR pricing, Indian property types, integration with 99acres/MagicBricks, WhatsApp-first communication
- **Full SaaS**: Authentication, team management, subscription billing, role-based access
- **Modern Stack**: Next.js 16, TypeScript, Supabase, Tailwind CSS 4

<div style="page-break-after: always;"></div>

## 2. Problem Statement

Indian real estate agents face several critical challenges that reduce their productivity and cost them deals:

### 2.1 Manual Listing Creation
Creating professional property listings is time-consuming. Agents spend 30–45 minutes per listing writing titles, descriptions, and social media content. Most agents lack copywriting skills, resulting in poorly written listings that fail to attract buyers.

### 2.2 Disorganized Lead Management
Agents manage leads through spreadsheets, WhatsApp chat lists, or memory. This leads to:
- Missed follow-ups and lost deals
- No visibility into pipeline health
- Inability to prioritize high-value leads
- No team coordination

### 2.3 Fragmented Communication
WhatsApp is the primary communication channel in Indian real estate, but agents juggle between WhatsApp, portals (99acres, MagicBricks), email, and phone — with no centralized conversation history.

### 2.4 Lack of Data-Driven Decisions
Most agents have no analytics on their listings' performance, lead conversion rates, or revenue trends. Decisions are made on gut feeling rather than data.

### 2.5 Expensive Existing Solutions
International CRM platforms like Salesforce or HubSpot are too expensive for Indian agents (₹5,000–₹25,000/month) and lack India-specific features like WhatsApp integration, INR pricing, and support for Indian property portals.

<div style="page-break-after: always;"></div>

## 3. Solution Overview

PropGenius AI addresses each of these problems with a unified platform:

| Problem | PropGenius Solution |
|---------|-------------------|
| Manual listing creation | AI generates professional titles, descriptions, social posts & SEO tags in <10 seconds |
| Disorganized leads | Visual Kanban pipeline with 7 stages, AI scoring (0–100), activity timeline |
| Fragmented communication | Built-in WhatsApp chat via Twilio, AI smart replies, message templates |
| No analytics | Real-time dashboard with lead trends, conversion metrics, revenue charts |
| Expensive CRM tools | Free plan available; Pro at ₹500/month; Business at ₹999/month |

### How It Works

1. **Sign Up** → Create an account and organization in seconds
2. **Create Listings** → Enter property details, AI generates all content
3. **Import Leads** → Add leads manually or import CSV from any portal
4. **Communicate** → Chat with leads on WhatsApp directly from the platform
5. **Track & Close** → Use the Kanban pipeline, AI scoring, and analytics to close deals

<div style="page-break-after: always;"></div>

## 4. Tech Stack & Architecture

### Frontend
| Technology | Purpose |
|-----------|---------|
| Next.js 16 (App Router) | Full-stack React framework with server components |
| TypeScript | Type safety across the entire codebase |
| Tailwind CSS 4 | Utility-first styling with custom design system |
| React Hook Form + Zod v4 | Form handling with schema-based validation |
| Zustand | Client-side state management |
| TanStack React Query | Server state, caching, and data fetching |
| @dnd-kit | Drag-and-drop for Kanban board |
| Recharts | Analytics charts and data visualization |

### Backend & Services
| Service | Purpose |
|---------|---------|
| Supabase | PostgreSQL database, authentication, row-level security, storage |
| Google Gemini 2.5 Flash | AI text generation (listings, scoring, replies, optimization) |
| Razorpay | Indian payment gateway for subscription billing |
| Twilio | WhatsApp Business API for two-way messaging |
| Resend | Transactional email notifications |
| Vercel | Edge deployment, serverless functions, CI/CD |

### Architecture Diagram

```
┌─────────────────────────────────────────────────────┐
│                    Client (Browser)                   │
│  Next.js App Router → React Components → Tailwind    │
└──────────────────────┬──────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────┐
│              Vercel Edge Network                      │
│  Server Components │ API Routes │ Middleware          │
└────┬────────┬───────┬──────────┬───────────────┬────┘
     │        │       │          │               │
     ▼        ▼       ▼          ▼               ▼
 Supabase  Gemini  Razorpay   Twilio         Resend
 (DB/Auth) (AI)    (Payments) (WhatsApp)     (Email)
```

<div style="page-break-after: always;"></div>

## 5. Features & Functionality

### 5.1 Authentication & Onboarding

**Routes**: `/login`, `/signup`, `/forgot-password`

PropGenius uses Supabase Auth for secure authentication with the following flows:

- **Sign Up**: Email + password registration. Automatically creates an organization and user profile. Users land on the dashboard after signup.
- **Sign In**: Email + password login with "Remember me" option.
- **Forgot Password**: Email-based password reset flow via Supabase.
- **Route Protection**: Middleware redirects unauthenticated users to `/login` and authenticated users from `/` to `/dashboard`.
- **Session Management**: JWT-based sessions managed by Supabase with automatic token refresh.

### 5.2 Dashboard

**Route**: `/dashboard`

The main dashboard provides an at-a-glance overview of the user's business:

- **Stat Cards**: Active listings count, total leads, recent conversions, average AI score
- **Quick Actions**: Create new listing, add lead, view messages
- **Recent Activity**: Latest leads and listing updates
- **Navigation**: Sidebar with links to all modules (Listings, Leads, Messages, Analytics, Settings)

The dashboard shell is a client component with a collapsible sidebar (256px expanded, 64px collapsed) and a 64px top bar.

---

### 5.3 AI Listing Generator

**Route**: `/listings/new`

The core AI feature of PropGenius. A multi-step form guides users through property details, then AI generates all listing content.

#### Multi-Step Form (4 Steps)

**Step 1 — Basic Details**
| Field | Type | Required |
|-------|------|----------|
| Title | Text | Yes |
| Property Type | Select (Apartment, House, Villa, Plot, Commercial, PG/Hostel) | Yes |
| Transaction Type | Select (Sale, Rent, Lease) | Yes |
| Price | Number (₹) | Yes |
| City | Text | Yes |
| State | Select (30 Indian states) | Yes |
| Address | Textarea | No |

**Step 2 — Property Details**
| Field | Type | Required |
|-------|------|----------|
| Bedrooms | Number | No |
| Bathrooms | Number | No |
| Area (sq ft) | Number | No |
| Furnishing | Select (Unfurnished, Semi, Fully) | No |
| Floor Number | Number | No |
| Total Floors | Number | No |
| Facing Direction | Text | No |
| Parking | Number | No |

**Step 3 — Amenities & Description**
| Field | Type | Required |
|-------|------|----------|
| Amenities | Multi-select chips | No |
| Description | Textarea | No |
| Nearby Landmarks | Text | No |

**Step 4 — AI Generation**
- Preview of entered details
- "Generate with AI" button
- AI generates: **Title**, **Description**, **Social Media Post**, **SEO Keywords**
- User can accept, edit, or regenerate each field
- Submit creates the listing

#### AI Generation API

**Endpoint**: `POST /api/ai/generate-listing`

**Input**: Property details (type, price, city, bedrooms, area, amenities, etc.)

**Output**:
```json
{
  "title": "Luxurious 3BHK Sea-View Apartment in Bandra West",
  "description": "Experience coastal luxury in this...",
  "social_post": "🏠 Just Listed! Premium 3BHK in Bandra...",
  "seo_keywords": ["3bhk bandra west", "sea view apartment mumbai", ...]
}
```

The AI uses **Google Gemini 2.5 Flash** with a carefully crafted system prompt that instructs it to write compelling Indian real estate copy with proper formatting, Hindi/English bilingual appeal, and market-relevant details.

---

### 5.4 Listing Management

**Routes**: `/listings` (list), `/listings/[id]` (detail), `/listings/[id]/edit` (edit)

#### Listing List Page
- **Data Table** with sortable columns: Title, Type, Price, City, Status, Created
- **Filters**: By status (Draft, Active, Sold, Rented, Archived), property type, city
- **Search**: Full-text search across title and description
- **Bulk Actions**: Delete multiple listings
- **Status Management**: Change status (Draft → Active → Sold/Rented/Archived)

#### Listing Detail Page
- Full property details with images
- AI-generated content display (title, description, social post, SEO keywords)
- Copy-to-clipboard buttons for each generated field
- **Platform Publishing**: Track which portals (99acres, MagicBricks, Housing.com, NoBroker, OLX, Facebook, Instagram) a listing is published on, with external URLs
- **AI Listing Optimizer**: Analyze listing performance and get improvement suggestions
- Edit and delete functionality
- Image gallery with Supabase Storage integration

#### Listing Optimizer

**Endpoint**: `POST /api/ai/optimize-listing`

Analyses an existing listing's performance metrics (views, inquiries, days active) and suggests specific improvements:
- Title optimization (e.g., "Add carpet area to title — +28% views")
- Description enhancements
- Price positioning relative to market
- Missing information that would boost engagement

---

### 5.5 CRM & Lead Management

**Routes**: `/leads` (list + kanban), `/leads/[id]` (detail)

The CRM module is the operational backbone of PropGenius, enabling agents to track every lead from first contact to deal closure.

#### Lead List & Kanban Views

Two views are available:
- **Table View**: Sortable data table with columns for Name, Source, AI Score, Status, Next Follow-up, Created
- **Kanban Board**: Drag-and-drop pipeline with 7 stages:

| Stage | Color | Purpose |
|-------|-------|---------|
| New | Blue | Freshly added leads |
| Contacted | Purple | Initial outreach done |
| Interested | Indigo | Lead expressed interest |
| Site Visit | Cyan | Property viewing scheduled/done |
| Negotiation | Orange | Price/terms discussion |
| Converted | Green | Deal closed |
| Lost | Red | Lead not converting |

The Kanban board uses **@dnd-kit** for smooth drag-and-drop. Moving a card between columns automatically updates the lead status.

#### Lead Creation & Import

**Manual Creation**: Form with fields:
| Field | Type |
|-------|------|
| Name | Text (required) |
| Email | Email |
| Phone | Phone number |
| Source | Select (Website, WhatsApp, Phone, Walk-in, Referral, 99acres, MagicBricks, Housing.com, Other) |
| Status | Select (7 stages) |
| Budget Min/Max | Number (₹) |
| Preferred Location | Text |
| Notes | Textarea |
| Next Follow-up | Date/Time |

**CSV Import**: Bulk import leads from any portal:
- Upload CSV file
- Map CSV columns to PropGenius fields
- Auto-deduplication by phone/email
- Imported leads are automatically queued for AI scoring

#### AI Lead Scoring

**Endpoint**: `POST /api/ai/score-lead`

Each lead receives an AI-generated score from 0–100 based on:
- Budget match with available listings
- Response time and engagement level
- Lead source quality (referrals score higher)
- Property preference specificity
- Communication frequency

**Score Tiers**:
| Score | Tier | Color |
|-------|------|-------|
| 80–100 | Hot | Red |
| 60–79 | Warm | Orange |
| 40–59 | Medium | Yellow |
| 0–39 | Cold | Blue |

#### Activity Timeline

Every lead has a chronological activity log that tracks:
- Status changes (with before/after)
- Notes added by agents
- WhatsApp messages sent/received
- AI score updates
- Follow-up scheduled/completed
- Property viewings

Activities are created automatically and manually, providing a complete audit trail for each lead interaction.

---

### 5.6 WhatsApp Messaging

**Route**: `/messages`

PropGenius integrates WhatsApp Business API via **Twilio** for two-way messaging directly within the platform.

#### Chat Interface
- **Conversation List**: All active WhatsApp conversations, sorted by most recent
- **Chat View**: Full message history with a lead, WhatsApp-style bubbles
- **Message Input**: Type and send messages directly
- **Read Status**: Delivered/read indicators

#### Message Templates

5 pre-built templates for common scenarios:
| Template | Use Case |
|----------|----------|
| Greeting | Initial contact with new lead |
| Site Visit Invitation | Schedule property viewing |
| Follow Up | Re-engage inactive lead |
| Price Update | Notify about price changes |
| Thank You | Post-visit appreciation |

Templates support variables (`{{name}}`, `{{property}}`, `{{price}}`) that are auto-filled from lead and listing data.

#### AI Smart Reply

**Endpoint**: `POST /api/ai/smart-reply`

When a new WhatsApp message arrives, AI analyses the conversation context and generates **3 contextual reply suggestions**. The agent can tap to send any suggestion or write a custom reply.

Example:
> **Incoming**: "Is the 3BHK in Andheri still available?"
>
> **AI Suggestions**:
> 1. "Yes, it's available! Would you like to schedule a visit this weekend?"
> 2. "The flat is available. It's 1,200 sqft with a sea view. Shall I share photos?"
> 3. "Yes! The asking price is ₹1.2 Cr. Would you like to discuss further?"

#### Twilio Webhook

**Endpoint**: `POST /api/whatsapp/webhook`

Receives incoming WhatsApp messages from Twilio, stores them in the database, and triggers:
- Email notification to the assigned agent (via Resend)
- AI smart reply generation
- Activity log entry on the lead's timeline

---

### 5.7 Analytics Dashboard

**Route**: `/analytics`

The analytics module provides data-driven insights using **Recharts** for visualization.

#### Metrics & Charts

| Metric | Chart Type | Description |
|--------|-----------|-------------|
| Leads Over Time | Area Chart | Daily/weekly/monthly lead acquisition trend |
| Lead Sources | Pie Chart | Distribution of leads by source (99acres, WhatsApp, etc.) |
| Conversion Funnel | Bar Chart | Leads at each pipeline stage |
| Revenue | Line Chart | Monthly revenue from converted deals |
| AI Score Distribution | Histogram | Distribution of lead scores across tiers |
| Top Performing Listings | Table | Listings ranked by views and inquiries |
| Response Time | Metric Card | Average time to first response |
| Conversion Rate | Metric Card | Percentage of leads reaching Converted stage |

Charts are loaded with **dynamic imports** (`next/dynamic`) for optimal code splitting — the Recharts library is only loaded when the analytics page is visited.

---

### 5.8 Billing & Subscriptions

**Route**: `/settings` (billing tab)

PropGenius uses **Razorpay** for subscription management, supporting all major Indian payment methods.

#### Subscription Flow

1. User selects a plan (Pro or Business) from the pricing page
2. Chooses billing cycle (Monthly or Annual — 20% discount for annual)
3. Razorpay checkout modal opens (supports UPI, cards, net banking, wallets)
4. On successful payment, webhook updates subscription and organization records
5. Plan limits are immediately applied

#### Billing Management

- **Current Plan Display**: Shows active plan, billing cycle, next renewal date
- **Plan Upgrade/Downgrade**: Switch between plans from the billing settings
- **Cancel Subscription**: Cancel with optional feedback; access continues until period end
- **Payment History**: View past transactions

#### API Routes

| Route | Purpose |
|-------|---------|
| `POST /api/billing/checkout` | Create Razorpay subscription session |
| `POST /api/billing/verify` | Verify payment signature and activate subscription |
| `POST /api/billing/webhook` | Handle Razorpay webhook events (payment success/failure/cancellation) |

---

### 5.9 Settings

**Route**: `/settings`

| Section | What It Configures |
|---------|-------------------|
| Profile | Name, email, phone, avatar |
| Organization | Company name, address, phone, logo |
| Billing | Current plan, upgrade, cancel |
| Team | Invite/manage agents (Business plan) |

<div style="page-break-after: always;"></div>

## 6. AI Capabilities

PropGenius uses **Google Gemini 2.5 Flash** for all AI features. Each feature has a dedicated API route with a specialized system prompt.

### 6.1 AI Listing Generator
- **Input**: Property details (type, price, location, bedrooms, area, amenities)
- **Output**: Title, description, social media post, SEO keywords
- **Quality**: Professional Indian real estate copywriting style
- **Speed**: Under 10 seconds

### 6.2 AI Lead Scoring
- **Input**: Lead data (budget, source, engagement, preferences)
- **Output**: Score (0–100) with tier classification and reasoning
- **Factors**: Budget match, source quality, response time, engagement, specificity

### 6.3 AI Smart Reply
- **Input**: Conversation history + lead context
- **Output**: 3 contextual reply suggestions
- **Style**: Professional yet conversational Indian English

### 6.4 AI Listing Optimizer
- **Input**: Listing details + performance metrics (views, inquiries, days active)
- **Output**: Score (1–10) with specific improvement suggestions
- **Focus**: Title optimization, description enhancement, pricing advice

### 6.5 AI Property Matching (Planned)
- **Input**: Lead preferences + available listings
- **Output**: Ranked list of matching properties with match percentage

### 6.6 AI Follow-Up Engine (Planned)
- **Input**: Lead activity timeline + communication history
- **Output**: Recommended follow-up time, channel, and talking points

<div style="page-break-after: always;"></div>

## 7. Database Schema

PropGenius uses **Supabase PostgreSQL** with **7 tables**, all protected by Row-Level Security (RLS) policies for organization-level data isolation.

### Tables

#### organizations
| Column | Type | Description |
|--------|------|-------------|
| id | UUID (PK) | Unique identifier |
| name | TEXT | Company name |
| slug | TEXT | URL-safe identifier |
| logo_url | TEXT | Logo image URL |
| address | TEXT | Business address |
| city | TEXT | City |
| phone | TEXT | Contact phone |
| email | TEXT | Contact email |
| plan | TEXT | Current plan (free/pro/business) |
| razorpay_customer_id | TEXT | Razorpay customer reference |
| razorpay_subscription_id | TEXT | Active subscription ID |
| max_listings | INTEGER | Plan listing limit |
| max_leads | INTEGER | Plan lead limit |
| max_agents | INTEGER | Plan team size limit |
| created_at | TIMESTAMPTZ | Created timestamp |
| updated_at | TIMESTAMPTZ | Last updated |

#### profiles
| Column | Type | Description |
|--------|------|-------------|
| id | UUID (PK) | Same as Supabase auth.users.id |
| organization_id | UUID (FK) | Link to organization |
| full_name | TEXT | Display name |
| email | TEXT | Email address |
| phone | TEXT | Phone number |
| avatar_url | TEXT | Profile image URL |
| role | TEXT | owner / admin / agent |
| monthly_listing_count | INTEGER | AI listings used this month |
| is_active | BOOLEAN | Account active status |
| created_at | TIMESTAMPTZ | Created timestamp |
| updated_at | TIMESTAMPTZ | Last updated |

#### listings
| Column | Type | Description |
|--------|------|-------------|
| id | UUID (PK) | Unique identifier |
| organization_id | UUID (FK) | Organization owner |
| created_by | UUID (FK) | Agent who created |
| title | TEXT | Property title |
| description | TEXT | User-written description |
| ai_description | TEXT | AI-generated description |
| ai_social_post | TEXT | AI-generated social media content |
| ai_seo_keywords | TEXT[] | AI-generated SEO keywords |
| property_type | TEXT | apartment/house/villa/plot/commercial/pg |
| transaction_type | TEXT | sale/rent/lease |
| price | NUMERIC | Price in INR |
| city | TEXT | City name |
| state | TEXT | State name |
| address | TEXT | Full address |
| bedrooms | INTEGER | Number of bedrooms |
| bathrooms | INTEGER | Number of bathrooms |
| area_sqft | NUMERIC | Area in square feet |
| furnishing | TEXT | Furnishing status |
| floor_number | INTEGER | Floor of the property |
| total_floors | INTEGER | Total floors in building |
| facing | TEXT | Direction facing |
| parking | INTEGER | Parking spots |
| amenities | TEXT[] | Array of amenity names |
| images | TEXT[] | Image URLs (Supabase Storage) |
| status | TEXT | draft/active/sold/rented/archived |
| published_platforms | TEXT[] | Portals where listed |
| external_urls | JSONB | URLs on external platforms |
| views_count | INTEGER | Number of views |
| inquiries_count | INTEGER | Number of inquiries |
| created_at | TIMESTAMPTZ | Created timestamp |
| updated_at | TIMESTAMPTZ | Last updated |

#### leads
| Column | Type | Description |
|--------|------|-------------|
| id | UUID (PK) | Unique identifier |
| organization_id | UUID (FK) | Organization owner |
| assigned_to | UUID (FK) | Assigned agent |
| name | TEXT | Lead's name |
| email | TEXT | Email address |
| phone | TEXT | Phone number |
| source | TEXT | Lead source |
| status | TEXT | Pipeline stage |
| ai_score | INTEGER | AI score (0–100) |
| ai_score_reason | TEXT | AI scoring rationale |
| budget_min | NUMERIC | Minimum budget |
| budget_max | NUMERIC | Maximum budget |
| preferred_location | TEXT | Preferred area/city |
| notes | TEXT | Agent notes |
| next_followup_at | TIMESTAMPTZ | Scheduled follow-up |
| created_at | TIMESTAMPTZ | Created timestamp |
| updated_at | TIMESTAMPTZ | Last updated |

#### lead_activities
| Column | Type | Description |
|--------|------|-------------|
| id | UUID (PK) | Unique identifier |
| lead_id | UUID (FK) | Associated lead |
| organization_id | UUID (FK) | Organization |
| type | TEXT | Activity type (note/status_change/call/email/whatsapp/meeting) |
| content | TEXT | Activity description |
| metadata | JSONB | Additional structured data |
| created_by | UUID (FK) | Agent who created |
| created_at | TIMESTAMPTZ | Created timestamp |

#### whatsapp_messages
| Column | Type | Description |
|--------|------|-------------|
| id | UUID (PK) | Unique identifier |
| organization_id | UUID (FK) | Organization |
| lead_id | UUID (FK) | Associated lead |
| direction | TEXT | inbound / outbound |
| content | TEXT | Message text |
| twilio_sid | TEXT | Twilio message SID |
| status | TEXT | sent/delivered/read/failed |
| created_at | TIMESTAMPTZ | Created timestamp |

#### subscriptions
| Column | Type | Description |
|--------|------|-------------|
| id | UUID (PK) | Unique identifier |
| organization_id | UUID (FK) | Organization |
| razorpay_subscription_id | TEXT | Razorpay reference |
| razorpay_payment_id | TEXT | Payment reference |
| plan | TEXT | Plan name |
| status | TEXT | created/active/paused/cancelled/expired |
| amount | NUMERIC | Payment amount |
| currency | TEXT | Currency code (INR) |
| current_period_start | TIMESTAMPTZ | Billing period start |
| current_period_end | TIMESTAMPTZ | Billing period end |
| cancelled_at | TIMESTAMPTZ | Cancellation timestamp |
| created_at | TIMESTAMPTZ | Created timestamp |
| updated_at | TIMESTAMPTZ | Last updated |

<div style="page-break-after: always;"></div>

## 8. API Reference

### AI Routes

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/ai/generate-listing` | POST | Generate AI listing content from property details |
| `/api/ai/score-lead` | POST | Score a lead (0–100) based on profile and behavior |
| `/api/ai/smart-reply` | POST | Generate 3 contextual WhatsApp reply suggestions |
| `/api/ai/optimize-listing` | POST | Analyze listing and suggest improvements |

### Listing Routes

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/listings` | GET | Fetch all listings for the organization |
| `/api/listings` | POST | Create a new listing |
| `/api/listings/[id]` | GET | Fetch a single listing by ID |
| `/api/listings/[id]` | PATCH | Update a listing |
| `/api/listings/[id]` | DELETE | Delete a listing |

### Lead Routes

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/leads` | GET | Fetch all leads for the organization |
| `/api/leads` | POST | Create a new lead |
| `/api/leads/[id]` | PATCH | Update a lead |
| `/api/leads/[id]` | DELETE | Delete a lead |
| `/api/leads/import` | POST | Bulk import leads from CSV |

### Messaging Routes

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/whatsapp/send` | POST | Send a WhatsApp message via Twilio |
| `/api/whatsapp/webhook` | POST | Receive incoming WhatsApp messages |
| `/api/email/notify` | POST | Send email notification via Resend |

### Billing Routes

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/billing/checkout` | POST | Create Razorpay checkout session |
| `/api/billing/verify` | POST | Verify payment and activate subscription |
| `/api/billing/webhook` | POST | Handle Razorpay webhook events |

<div style="page-break-after: always;"></div>

## 9. Security & Privacy

### Authentication
- **Supabase Auth** with email/password
- JWT-based session tokens with automatic refresh
- Secure HTTP-only cookies for session storage

### Authorization
- **Row-Level Security (RLS)** on all 7 tables
- Every query is scoped to the user's `organization_id`
- Users can only see data belonging to their organization
- Role-based access: Owner > Admin > Agent

### HTTP Security Headers
| Header | Value | Purpose |
|--------|-------|---------|
| X-Frame-Options | DENY | Prevent clickjacking |
| X-Content-Type-Options | nosniff | Prevent MIME type sniffing |
| Referrer-Policy | strict-origin-when-cross-origin | Control referrer information |

### Data Protection
- All data encrypted at rest (Supabase/PostgreSQL)
- All data encrypted in transit (TLS/HTTPS)
- No customer data used for AI model training
- Webhook signature verification for Razorpay and Twilio
- Input validation with Zod schemas on all API routes
- Admin client used only for webhook routes (service role key server-side only)

### Middleware
- Route protection: unauthenticated users redirected to `/login`
- Authenticated users at `/` redirected to `/dashboard`
- API routes validate authentication before processing

<div style="page-break-after: always;"></div>

## 10. Pricing Plans

PropGenius offers three plans. Pricing is available in both INR and USD.

### Free Plan
- **Price**: ₹0 / $0
- 5 AI listings per month
- Up to 50 leads
- Basic CRM features
- Email support

### Pro Plan (Most Popular)
- **Price**: ₹500/month ($8/month) or ₹4,800/year ($77/year)
- Unlimited AI listings
- Up to 500 leads
- WhatsApp Business integration
- AI lead scoring
- Priority support

### Business Plan
- **Price**: ₹999/month ($49/month) or ₹9,588/year ($470/year)
- Everything in Pro
- Team support (up to 5 agents)
- Analytics dashboard
- Bulk operations
- Custom message templates

### Payment Methods
All major Indian payment methods accepted via Razorpay:
- Credit/Debit cards (Visa, Mastercard, RuPay)
- UPI (Google Pay, PhonePe, Paytm)
- Net Banking (all major banks)
- Wallets

Annual billing saves 20%. All prices include GST.

<div style="page-break-after: always;"></div>

## 11. Deployment & Infrastructure

### Hosting
- **Vercel**: Edge deployment across global CDN
- **Region**: Optimized for India (Mumbai edge)
- **Serverless Functions**: All API routes run as serverless functions

### CI/CD Pipeline
- **GitHub Actions**: Automated CI/CD workflow (`.github/workflows/ci.yml`)
- **Checks**: Lint (ESLint), type check (TypeScript), build verification
- **Auto-deploy**: Push to `main` triggers production deployment on Vercel

### Performance Optimizations
- **Dynamic Imports**: Heavy components (Recharts, Kanban) loaded on demand
- **Image Optimization**: `next/image` with Supabase CDN
- **Server Components**: Landing page and layouts are server components (zero client JS)
- **Code Splitting**: Automatic route-based code splitting by Next.js

### Environment Variables Required
| Variable | Service | Purpose |
|----------|---------|---------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase | Database URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase | Public API key |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase | Admin key (webhooks only) |
| `GOOGLE_GENERATIVE_AI_API_KEY` | Google | Gemini AI API key |
| `NEXT_PUBLIC_RAZORPAY_KEY_ID` | Razorpay | Public payment key |
| `RAZORPAY_KEY_SECRET` | Razorpay | Payment secret |
| `RAZORPAY_PLAN_PRO_MONTHLY` | Razorpay | Pro plan ID (monthly) |
| `RAZORPAY_PLAN_PRO_ANNUAL` | Razorpay | Pro plan ID (annual) |
| `RAZORPAY_PLAN_BUSINESS_MONTHLY` | Razorpay | Business plan ID (monthly) |
| `RAZORPAY_PLAN_BUSINESS_ANNUAL` | Razorpay | Business plan ID (annual) |
| `TWILIO_ACCOUNT_SID` | Twilio | Account identifier |
| `TWILIO_AUTH_TOKEN` | Twilio | Authentication token |
| `TWILIO_WHATSAPP_NUMBER` | Twilio | WhatsApp sender number |
| `RESEND_API_KEY` | Resend | Email API key |

<div style="page-break-after: always;"></div>

## 12. Roadmap

### Completed (v1.0)
- [x] Authentication & onboarding
- [x] AI listing generator (Gemini)
- [x] Listing CRUD with multi-step form
- [x] CRM with Kanban pipeline
- [x] AI lead scoring
- [x] CSV lead import
- [x] WhatsApp two-way messaging (Twilio)
- [x] AI smart reply suggestions
- [x] Message templates
- [x] Analytics dashboard (Recharts)
- [x] Razorpay subscription billing
- [x] Landing page with pricing
- [x] SEO metadata & image optimization
- [x] Security headers & error boundaries
- [x] CI/CD pipeline

### Planned (v2.0)
- [ ] AI property matching (lead ↔ listing)
- [ ] AI follow-up engine (time, channel, talking points)
- [ ] Multi-language support (Hindi, Marathi, Tamil)
- [ ] Mobile app (React Native)
- [ ] Advanced reporting & exports
- [ ] Custom branding for agencies
- [ ] API access for integrations
- [ ] Automated lead nurturing sequences

---

<div style="text-align:center; padding: 40px 0;">
<p style="color:#94a3b8; font-size:14px;">PropGenius AI &copy; 2026. All rights reserved.</p>
<p style="color:#cbd5e1; font-size:12px;">Built with Next.js, Supabase, Google Gemini AI, and Razorpay.</p>
</div>
