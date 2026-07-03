import { BarChart3, Building2, Contact, FileText } from "lucide-react";

const FEATURES = [
  {
    icon: FileText,
    title: "Listing workspace",
    description: "Prepare property pages, highlights, pricing, and share links from one place",
  },
  {
    icon: Contact,
    title: "Lead operations",
    description: "Track source, owner, budget, status, follow-ups, and every conversation",
  },
  {
    icon: BarChart3,
    title: "Reporting view",
    description: "Review pipeline value, lead sources, listing performance, and team activity",
  },
];

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-white">
      <div className="flex flex-1 items-center justify-center bg-white px-6 py-12 sm:px-12">
        <div className="w-full max-w-100">{children}</div>
      </div>

      <div className="relative hidden shrink-0 flex-col justify-between overflow-hidden bg-slate-950 p-12 text-white lg:flex lg:w-120 xl:w-135">
        <div className="absolute inset-0 bg-grid-dots-light opacity-40" />
        <div className="relative z-10">
          <div className="mb-16 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-600">
              <Building2 className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-bold tracking-tight">PropGenius</span>
          </div>

          <h2 className="mb-3 text-3xl font-bold leading-tight text-white">
            Run property sales from one calm workspace.
          </h2>
          <p className="mb-12 text-base leading-relaxed text-slate-400">
            Listings, leads, WhatsApp conversations, assignments, and reporting stay organized for every agent on your team.
          </p>

          <div className="space-y-5">
            {FEATURES.map((feature) => (
              <div key={feature.title} className="flex items-start gap-4">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-white/10 bg-white/8">
                  <feature.icon className="h-4.5 w-4.5 text-primary-400" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-white">{feature.title}</p>
                  <p className="mt-0.5 text-sm text-slate-400">{feature.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="relative z-10 mt-12 border-t border-white/10 pt-8">
          <p className="text-sm font-semibold text-white">What you can set up after login</p>
          <div className="mt-4 grid gap-2 text-sm text-slate-400">
            <span>Organization profile and team roles</span>
            <span>Listing inventory and public property pages</span>
            <span>Lead pipeline, imports, and follow-up reminders</span>
          </div>
        </div>
      </div>
    </div>
  );
}