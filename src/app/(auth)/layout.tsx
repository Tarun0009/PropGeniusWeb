import { Building2, Sparkles, BarChart3 } from "lucide-react";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex">
      {/* Left: Form area */}
      <div className="flex-1 flex items-center justify-center p-6 sm:p-12">
        <div className="w-full max-w-md">{children}</div>
      </div>

      {/* Right: Branding panel (hidden on mobile) */}
      <div className="hidden lg:flex lg:flex-1 bg-gradient-to-br from-primary-600 to-primary-900 text-white flex-col items-center justify-center p-12">
        <div className="max-w-md text-center">
          <div className="flex items-center justify-center gap-2 mb-6">
            <Building2 className="h-10 w-10" />
            <h1 className="text-4xl font-extrabold tracking-tight text-white">
              PropGenius
            </h1>
          </div>
          <p className="text-primary-100 text-lg mb-12">
            AI-Powered Real Estate Listing Generator + CRM
          </p>

          <div className="space-y-6 text-left">
            <div className="flex items-start gap-4">
              <div className="rounded-lg bg-white/10 p-2.5 shrink-0">
                <Sparkles className="h-5 w-5" />
              </div>
              <div>
                <h4 className="font-semibold text-white">AI Listing Generator</h4>
                <p className="text-primary-200 text-sm mt-1">
                  Generate professional property descriptions in seconds
                </p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="rounded-lg bg-white/10 p-2.5 shrink-0">
                <Building2 className="h-5 w-5" />
              </div>
              <div>
                <h4 className="font-semibold text-white">Smart CRM</h4>
                <p className="text-primary-200 text-sm mt-1">
                  Manage leads with AI scoring and WhatsApp integration
                </p>
              </div>
            </div>
            <div className="flex items-start gap-4">
              <div className="rounded-lg bg-white/10 p-2.5 shrink-0">
                <BarChart3 className="h-5 w-5" />
              </div>
              <div>
                <h4 className="font-semibold text-white">Analytics Dashboard</h4>
                <p className="text-primary-200 text-sm mt-1">
                  Track performance and get AI-powered insights
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
