import Link from "next/link";
import {
  ArrowRight,
  Building2,
  Check,
  LayoutDashboard,
  MessageCircle,
} from "lucide-react";
import { PricingSection } from "@/features/landing/components/pricing-toggle";
import { FaqAccordion } from "@/features/landing/components/faq-accordion";
import {
  FAQ_ITEMS,
  FEATURE_CARDS,
  MESSAGING_FEATURES,
  OPERATIONS,
  PIPELINE_FEATURES,
  WORKFLOW_STEPS,
} from "@/features/landing/content";

interface LandingPageViewProps {
  isAuthenticated: boolean;
}

const pipelineColumns = [
  { title: "New", tone: "bg-sky-500", leads: ["Amit S.", "Neha R."] },
  { title: "Contacted", tone: "bg-violet-500", leads: ["Priya M."] },
  { title: "Site Visit", tone: "bg-amber-500", leads: ["Rohan K.", "Meera D."] },
  { title: "Converted", tone: "bg-emerald-500", leads: ["Karan P."] },
];

const recentLeads = [
  { name: "Rajesh Kumar", need: "3BHK, Andheri", status: "Visit set" },
  { name: "Ananya Shah", need: "Villa, Whitefield", status: "Call today" },
  { name: "Vikram Rao", need: "Office, Pune", status: "Shortlist" },
];

function BrandMark() {
  return (
    <Link href="/" className="flex items-center gap-2.5" aria-label="PropGenius home">
      <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-950 text-white">
        <Building2 className="h-5 w-5" />
      </span>
      <span className="text-lg font-bold tracking-tight text-slate-950">PropGenius</span>
    </Link>
  );
}

function Header({ isAuthenticated }: LandingPageViewProps) {
  return (
    <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/95 backdrop-blur">
      <nav
        aria-label="Main navigation"
        className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6"
      >
        <BrandMark />

        <div className="hidden items-center gap-7 md:flex">
          <a className="text-sm font-medium text-slate-500 hover:text-slate-950" href="#features">
            Product
          </a>
          <a className="text-sm font-medium text-slate-500 hover:text-slate-950" href="#workflow">
            Workflow
          </a>
          <a className="text-sm font-medium text-slate-500 hover:text-slate-950" href="#pricing">
            Pricing
          </a>
          <a className="text-sm font-medium text-slate-500 hover:text-slate-950" href="#faq">
            FAQ
          </a>
        </div>

        <div className="flex items-center gap-3">
          {isAuthenticated ? (
            <Link
              href="/dashboard"
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-slate-950 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-slate-800"
            >
              <LayoutDashboard className="h-4 w-4" />
              Dashboard
            </Link>
          ) : (
            <>
              <Link
                href="/login"
                className="hidden text-sm font-medium text-slate-500 transition-colors hover:text-slate-950 sm:block"
              >
                Sign in
              </Link>
              <Link
                href="/signup"
                className="rounded-lg bg-slate-950 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-slate-800"
              >
                Start free
              </Link>
            </>
          )}
        </div>
      </nav>
    </header>
  );
}

function ProductPreview() {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-3 shadow-xl shadow-slate-200/70">
      <div className="rounded-lg border border-slate-200 bg-slate-50">
        <div className="flex items-center justify-between border-b border-slate-200 bg-white px-4 py-3">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
              Today in PropGenius
            </p>
            <p className="mt-1 text-sm font-semibold text-slate-950">South Mumbai Sales Team</p>
          </div>
          <div className="rounded-md bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700">
            6 follow-ups due
          </div>
        </div>

        <div className="grid gap-3 p-4 sm:grid-cols-4">
          {OPERATIONS.map((item) => (
            <div key={item.label} className="rounded-lg border border-slate-200 bg-white p-3">
              <div className="flex items-center gap-2 text-slate-500">
                <item.icon className="h-4 w-4" />
                <span className="text-xs font-medium">{item.label}</span>
              </div>
              <p className="mt-2 text-sm font-semibold text-slate-950">{item.value}</p>
            </div>
          ))}
        </div>

        <div className="grid gap-4 px-4 pb-4 lg:grid-cols-[1.45fr_0.85fr]">
          <div className="rounded-lg border border-slate-200 bg-white p-4">
            <div className="mb-4 flex items-center justify-between">
              <p className="text-sm font-semibold text-slate-950">Lead pipeline</p>
              <span className="text-xs text-slate-400">Live board</span>
            </div>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              {pipelineColumns.map((column) => (
                <div key={column.title}>
                  <div className={`mb-2 h-1 rounded-full ${column.tone}`} />
                  <p className="mb-2 text-[10px] font-semibold uppercase text-slate-400">
                    {column.title}
                  </p>
                  <div className="space-y-2">
                    {column.leads.map((lead) => (
                      <div key={lead} className="rounded-md border border-slate-100 bg-slate-50 px-2 py-2">
                        <p className="truncate text-xs font-medium text-slate-700">{lead}</p>
                        <div className="mt-1.5 h-1.5 w-3/4 rounded-full bg-slate-200" />
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-lg border border-slate-200 bg-white p-4">
            <p className="text-sm font-semibold text-slate-950">Recent leads</p>
            <div className="mt-4 space-y-3">
              {recentLeads.map((lead) => (
                <div key={lead.name} className="rounded-lg border border-slate-100 bg-white p-3 shadow-sm">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-slate-900">{lead.name}</p>
                      <p className="mt-0.5 truncate text-xs text-slate-500">{lead.need}</p>
                    </div>
                    <span className="shrink-0 rounded-full bg-primary-50 px-2 py-1 text-[10px] font-semibold text-primary-700">
                      {lead.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function Hero({ isAuthenticated }: LandingPageViewProps) {
  return (
    <section className="bg-[#F8F7FC] pt-14 pb-12 sm:pt-20 sm:pb-16">
      <div className="mx-auto grid max-w-7xl items-center gap-12 px-4 sm:px-6 lg:grid-cols-[0.9fr_1.1fr]">
        <div>
          <div className="mb-6 inline-flex items-center rounded-full border border-slate-200 bg-white px-3 py-1 text-sm font-medium text-slate-600">
            Built for Indian real estate teams
          </div>
          <h1 className="max-w-3xl text-4xl font-bold leading-tight tracking-normal text-slate-950 sm:text-5xl lg:text-6xl">
            PropGenius keeps listings, leads, and follow-ups moving.
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-relaxed text-slate-600">
            A focused CRM for agencies that need cleaner property pages, faster lead handling, WhatsApp conversations, and team visibility in one workspace.
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row">
            <Link
              href={isAuthenticated ? "/dashboard" : "/signup"}
              className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary-600 px-6 py-3 text-base font-semibold text-white shadow-lg shadow-primary-600/20 transition-colors hover:bg-primary-700"
            >
              {isAuthenticated ? "Open dashboard" : "Start free"}
              <ArrowRight className="h-4 w-4" />
            </Link>
            <a
              href="#features"
              className="inline-flex items-center justify-center rounded-lg border border-slate-300 bg-white px-6 py-3 text-base font-semibold text-slate-700 transition-colors hover:border-slate-400 hover:bg-slate-50"
            >
              View product
            </a>
          </div>

          <div className="mt-8 grid gap-3 text-sm text-slate-600 sm:grid-cols-3">
            {["No credit card needed", "Portal CSV imports", "WhatsApp-ready workflow"].map((item) => (
              <div key={item} className="flex items-center gap-2">
                <Check className="h-4 w-4 text-emerald-600" />
                <span>{item}</span>
              </div>
            ))}
          </div>
        </div>

        <ProductPreview />
      </div>
    </section>
  );
}

function WorkflowSection() {
  return (
    <section id="workflow" className="bg-white py-20 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="max-w-2xl">
          <p className="text-sm font-semibold uppercase tracking-wider text-primary-600">Workflow</p>
          <h2 className="mt-3 text-3xl font-bold tracking-normal text-slate-950 sm:text-4xl">
            From first listing to final follow-up.
          </h2>
          <p className="mt-4 text-lg leading-relaxed text-slate-600">
            The day-to-day flow is simple: publish inventory, qualify demand, and keep the next action clear for every lead.
          </p>
        </div>

        <div className="mt-12 grid gap-5 md:grid-cols-3">
          {WORKFLOW_STEPS.map((step) => (
            <div key={step.number} className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-slate-400">{step.number}</span>
                <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-100 text-slate-700">
                  <step.icon className="h-5 w-5" />
                </span>
              </div>
              <h3 className="mt-8 text-lg font-semibold text-slate-950">{step.title}</h3>
              <p className="mt-3 leading-relaxed text-slate-600">{step.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function FeatureSection() {
  return (
    <section id="features" className="bg-slate-50 py-20 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="grid gap-8 lg:grid-cols-[0.75fr_1.25fr] lg:items-end">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wider text-primary-600">Product</p>
            <h2 className="mt-3 text-3xl font-bold tracking-normal text-slate-950 sm:text-4xl">
              A CRM that matches how property teams actually work.
            </h2>
          </div>
          <p className="max-w-2xl text-lg leading-relaxed text-slate-600 lg:justify-self-end">
            PropGenius keeps the practical pieces close together: inventory, buyer intent, communication, team ownership, and reporting.
          </p>
        </div>

        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {FEATURE_CARDS.map((feature) => (
            <div key={feature.title} className="rounded-lg border border-slate-200 bg-white p-6 shadow-sm transition-shadow hover:shadow-md">
              <div className={`flex h-11 w-11 items-center justify-center rounded-lg ${feature.accent}`}>
                <feature.icon className="h-5 w-5" />
              </div>
              <h3 className="mt-5 text-lg font-semibold text-slate-950">{feature.title}</h3>
              <p className="mt-3 leading-relaxed text-slate-600">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function OperationsSection() {
  return (
    <section className="bg-white py-20 sm:py-24">
      <div className="mx-auto grid max-w-7xl gap-12 px-4 sm:px-6 lg:grid-cols-2 lg:gap-16">
        <div>
          <p className="text-sm font-semibold uppercase tracking-wider text-primary-600">Pipeline</p>
          <h2 className="mt-3 text-3xl font-bold tracking-normal text-slate-950 sm:text-4xl">
            Keep every opportunity accountable.
          </h2>
          <p className="mt-4 text-lg leading-relaxed text-slate-600">
            Lead stages, owners, notes, source data, and next follow-ups stay visible, so managers can spot slow deals before they go cold.
          </p>
          <ul className="mt-6 space-y-3">
            {PIPELINE_FEATURES.map((item) => (
              <li key={item} className="flex items-start gap-3 text-slate-700">
                <Check className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="rounded-lg border border-slate-200 bg-slate-50 p-5">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {pipelineColumns.map((column) => (
              <div key={column.title} className="rounded-lg bg-white p-3 shadow-sm">
                <div className={`mb-3 h-1 rounded-full ${column.tone}`} />
                <p className="text-[10px] font-semibold uppercase text-slate-400">{column.title}</p>
                <div className="mt-3 space-y-2">
                  {column.leads.map((lead) => (
                    <div key={lead} className="rounded-md border border-slate-100 bg-slate-50 p-2">
                      <p className="truncate text-xs font-medium text-slate-700">{lead}</p>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm lg:order-4">
          <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
            <MessageCircle className="h-4 w-4 text-emerald-600" />
            <p className="text-sm font-semibold text-slate-950">WhatsApp conversation</p>
          </div>
          <div className="mt-4 space-y-3">
            <div className="max-w-[82%] rounded-lg rounded-tl-sm bg-slate-100 px-4 py-3 text-sm text-slate-700">
              Is the Andheri 3BHK available for a weekend visit?
            </div>
            <div className="ml-auto max-w-[82%] rounded-lg rounded-tr-sm bg-emerald-600 px-4 py-3 text-sm text-white">
              Yes, Saturday 11 AM works. I can send the location and floor plan now.
            </div>
            <div className="rounded-lg border border-slate-200 bg-slate-50 p-3">
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">Suggested replies</p>
              <div className="mt-2 space-y-2">
                {["Share location", "Send brochure", "Offer Sunday slot"].map((item) => (
                  <div key={item} className="rounded-md border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700">
                    {item}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="lg:order-3">
          <p className="text-sm font-semibold uppercase tracking-wider text-primary-600">Messaging</p>
          <h2 className="mt-3 text-3xl font-bold tracking-normal text-slate-950 sm:text-4xl">
            WhatsApp stays connected to the lead record.
          </h2>
          <p className="mt-4 text-lg leading-relaxed text-slate-600">
            Agents can reply quickly while owners keep context. Every message, note, and next step is visible from the lead timeline.
          </p>
          <ul className="mt-6 space-y-3">
            {MESSAGING_FEATURES.map((item) => (
              <li key={item} className="flex items-start gap-3 text-slate-700">
                <Check className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}

function PricingBlock() {
  return (
    <section id="pricing" className="bg-slate-50 py-20 sm:py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-sm font-semibold uppercase tracking-wider text-primary-600">Pricing</p>
          <h2 className="mt-3 text-3xl font-bold tracking-normal text-slate-950 sm:text-4xl">
            Start lean. Upgrade when your team needs more room.
          </h2>
          <p className="mt-4 text-lg leading-relaxed text-slate-600">
            Monthly and annual plans for solo brokers, growing teams, and larger agencies.
          </p>
        </div>
        <div className="mt-10">
          <PricingSection />
        </div>
      </div>
    </section>
  );
}

function FaqBlock() {
  return (
    <section id="faq" className="bg-white py-20 sm:py-24">
      <div className="mx-auto max-w-3xl px-4 sm:px-6">
        <div className="text-center">
          <p className="text-sm font-semibold uppercase tracking-wider text-primary-600">FAQ</p>
          <h2 className="mt-3 text-3xl font-bold tracking-normal text-slate-950 sm:text-4xl">
            Common questions
          </h2>
          <p className="mt-4 text-lg leading-relaxed text-slate-600">
            Details on setup, data, WhatsApp, teams, and billing.
          </p>
        </div>
        <div className="mt-10">
          <FaqAccordion items={FAQ_ITEMS} />
        </div>
      </div>
    </section>
  );
}

function FinalCta({ isAuthenticated }: LandingPageViewProps) {
  return (
    <section className="bg-slate-950 py-16 text-white sm:py-20">
      <div className="mx-auto max-w-3xl px-4 text-center sm:px-6">
        <h2 className="text-3xl font-bold tracking-normal sm:text-4xl">
          Bring the whole sales day into one CRM.
        </h2>
        <p className="mx-auto mt-4 max-w-xl leading-relaxed text-slate-300">
          Set up listings, lead stages, WhatsApp follow-up, team roles, and reporting without stitching together separate spreadsheets.
        </p>
        <Link
          href={isAuthenticated ? "/dashboard" : "/signup"}
          className="mt-8 inline-flex items-center justify-center gap-2 rounded-lg bg-white px-6 py-3 text-base font-semibold text-slate-950 transition-colors hover:bg-slate-100"
        >
          {isAuthenticated ? "Open dashboard" : "Start free"}
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="border-t border-slate-200 bg-white py-10">
      <div className="mx-auto flex max-w-7xl flex-col gap-8 px-4 sm:px-6 lg:flex-row lg:items-start lg:justify-between">
        <div className="max-w-sm">
          <BrandMark />
          <p className="mt-4 text-sm leading-relaxed text-slate-500">
            Real estate CRM for Indian agencies that need a cleaner way to manage inventory, leads, follow-ups, and team work.
          </p>
        </div>
        <div className="grid gap-8 sm:grid-cols-2">
          <div>
            <h3 className="text-sm font-semibold text-slate-950">Product</h3>
            <div className="mt-4 grid gap-3">
              {["features", "workflow", "pricing", "faq"].map((item) => (
                <a key={item} href={`#${item}`} className="text-sm capitalize text-slate-500 hover:text-slate-950">
                  {item}
                </a>
              ))}
            </div>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-slate-950">Workspace</h3>
            <div className="mt-4 grid gap-3 text-sm text-slate-500">
              <span>Listings</span>
              <span>Leads</span>
              <span>Messages</span>
              <span>Analytics</span>
            </div>
          </div>
        </div>
      </div>
      <div className="mx-auto mt-8 flex max-w-7xl flex-col gap-3 border-t border-slate-100 px-4 pt-6 text-sm text-slate-400 sm:px-6 md:flex-row md:items-center md:justify-between">
        <p>&copy; {new Date().getFullYear()} PropGenius. All rights reserved.</p>
        <p>Made for real estate teams in India.</p>
      </div>
    </footer>
  );
}

export function LandingPageView({ isAuthenticated }: LandingPageViewProps) {
  return (
    <div className="min-h-screen bg-white text-slate-950">
      <Header isAuthenticated={isAuthenticated} />
      <main>
        <Hero isAuthenticated={isAuthenticated} />
        <WorkflowSection />
        <FeatureSection />
        <OperationsSection />
        <PricingBlock />
        <FaqBlock />
        <FinalCta isAuthenticated={isAuthenticated} />
      </main>
      <Footer />
    </div>
  );
}