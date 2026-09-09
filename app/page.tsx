import Link from "next/link";
import {
  CloudRain,
  Droplets,
  ThermometerSun,
  Bug,
  TrendingUp,
  ScanLine,
  MessageCircle,
  Store,
  Newspaper,
  Radio,
  AlertTriangle,
  ChevronRight,
  Sprout,
} from "lucide-react";

// ── Placeholder UI content (not production data) ──
// These cards demonstrate the Home/Today layout. Real data will come from
// API integrations in later phases. Per spec: never fabricate production data.

const weatherActions = [
  {
    icon: CloudRain,
    title: "Rain expected tomorrow",
    action: "Postpone irrigation",
    tone: "info" as const,
  },
  {
    icon: ThermometerSun,
    title: "High temperature forecast",
    action: "Monitor crop stress",
    tone: "warn" as const,
  },
];

const quickShortcuts = [
  { href: "/scan", label: "Scan", icon: ScanLine, color: "bg-blue-500" },
  { href: "/ask", label: "Ask AI", icon: MessageCircle, color: "bg-brand-600" },
  { href: "/market", label: "Market", icon: Store, color: "bg-amber-500" },
  { href: "/news", label: "News", icon: Newspaper, color: "bg-purple-500" },
];

const recentActivity = [
  { label: "Fertilizer applied", time: "2 days ago", icon: Droplets },
  { label: "Pest scan completed", time: "5 days ago", icon: Bug },
  { label: "Cotton sowing recorded", time: "3 weeks ago", icon: Sprout },
];

const toneStyles = {
  info: "bg-blue-50 border-blue-200 text-blue-900",
  warn: "bg-amber-50 border-amber-200 text-amber-900",
  alert: "bg-red-50 border-red-200 text-red-900",
  good: "bg-brand-50 border-brand-200 text-brand-900",
};

export default function HomePage() {
  return (
    <div className="flex flex-col">
      {/* ── Header ── */}
      <header className="sticky top-0 z-40 border-b border-slate-100 bg-white/90 px-5 py-3.5 backdrop-blur-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-600 text-white">
              <Sprout className="h-5 w-5" />
            </div>
            <span className="text-lg font-bold tracking-tight text-slate-900">
              SENSOTECH
            </span>
          </div>
          <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-600">
            Today
          </span>
        </div>
      </header>

      <div className="space-y-5 px-5 pt-4">
        {/* ── Farm selector ── */}
        <button className="flex w-full items-center justify-between rounded-2xl border border-slate-200 bg-white p-4 text-left shadow-sm transition-shadow hover:shadow-md">
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
              Selected Farm
            </p>
            <p className="mt-0.5 text-base font-semibold text-slate-900">
              Sharma Farm
            </p>
            <p className="text-sm text-slate-500">Nashik, Maharashtra</p>
          </div>
          <div className="flex flex-col items-end gap-1">
            <span className="rounded-full bg-brand-100 px-2.5 py-0.5 text-xs font-medium text-brand-700">
              Cotton
            </span>
            <span className="text-xs text-slate-500">Flowering stage</span>
          </div>
        </button>

        {/* ── Weather → Action ── */}
        <div>
          <h2 className="mb-2 text-sm font-semibold text-slate-700">
            Weather → Action
          </h2>
          <div className="space-y-2">
            {weatherActions.map((item, i) => (
              <div
                key={i}
                className={`flex items-center gap-3 rounded-2xl border p-4 ${toneStyles[item.tone]}`}
              >
                <item.icon className="h-6 w-6 shrink-0" />
                <div className="flex-1">
                  <p className="text-sm font-semibold">{item.title}</p>
                  <p className="text-xs opacity-80">{item.action}</p>
                </div>
                <ChevronRight className="h-4 w-4 shrink-0 opacity-50" />
              </div>
            ))}
          </div>
        </div>

        {/* ── Today's Actions ── */}
        <div>
          <h2 className="mb-2 text-sm font-semibold text-slate-700">
            Today&apos;s Actions
          </h2>
          <div className="grid grid-cols-2 gap-3">
            <ActionTile icon={Droplets} label="Irrigation" status="Monitor" tone="info" />
            <ActionTile icon={Bug} label="Pest Risk" status="Low" tone="good" />
            <ActionTile icon={TrendingUp} label="Market" status="Check" tone="warn" />
            <ActionTile icon={Radio} label="Sensor" status="Offline" tone="alert" />
          </div>
        </div>

        {/* ── Sensor Status ── */}
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-slate-700">
              Sensor Status
            </h2>
            <span className="flex items-center gap-1 text-xs font-medium text-red-500">
              <span className="h-2 w-2 rounded-full bg-red-500" />
              Not connected
            </span>
          </div>
          <p className="mt-2 text-sm text-slate-500">
            Soil intelligence is available from satellite, weather, and farm
            history data. Connect a SENSOTECH sensor for live NPK, pH, EC, and
            moisture readings.
          </p>
          <button className="mt-3 w-full rounded-xl bg-slate-100 py-2.5 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-200">
            Learn about SENSOTECH sensors
          </button>
        </div>

        {/* ── Quick Shortcuts ── */}
        <div>
          <h2 className="mb-2 text-sm font-semibold text-slate-700">
            Quick Actions
          </h2>
          <div className="grid grid-cols-4 gap-3">
            {quickShortcuts.map(({ href, label, icon: Icon, color }) => (
              <Link
                key={href}
                href={href}
                className="flex flex-col items-center gap-1.5"
              >
                <div
                  className={`flex h-14 w-14 items-center justify-center rounded-2xl ${color} text-white shadow-md transition-transform active:scale-95`}
                >
                  <Icon className="h-6 w-6" />
                </div>
                <span className="text-xs font-medium text-slate-600">{label}</span>
              </Link>
            ))}
          </div>
        </div>

        {/* ── Recent Activity ── */}
        <div>
          <h2 className="mb-2 text-sm font-semibold text-slate-700">
            Recent Activity
          </h2>
          <div className="rounded-2xl border border-slate-200 bg-white p-2 shadow-sm">
            {recentActivity.map((item, i) => (
              <div
                key={i}
                className={`flex items-center gap-3 px-3 py-3 ${
                  i !== recentActivity.length - 1 ? "border-b border-slate-100" : ""
                }`}
              >
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-100">
                  <item.icon className="h-4 w-4 text-slate-500" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-slate-800">
                    {item.label}
                  </p>
                  <p className="text-xs text-slate-400">{item.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function ActionTile({
  icon: Icon,
  label,
  status,
  tone,
}: {
  icon: typeof Droplets;
  label: string;
  status: string;
  tone: keyof typeof toneStyles;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-3.5 shadow-sm">
      <div className="flex items-center justify-between">
        <div
          className={`flex h-9 w-9 items-center justify-center rounded-lg ${toneStyles[tone]}`}
        >
          <Icon className="h-4 w-4" />
        </div>
      </div>
      <p className="mt-2.5 text-sm font-semibold text-slate-800">{label}</p>
      <p className="text-xs text-slate-500">{status}</p>
    </div>
  );
}
