import Link from "next/link";
import {
  Store,
  Newspaper,
  Settings,
  Globe,
  Bell,
  Shield,
  HelpCircle,
  ChevronRight,
  Tractor,
  CloudSun,
  FileText,
  AlertTriangle,
  MapPin,
  Calendar,
} from "lucide-react";

const moreFeatures = [
  { href: "/market", label: "Market / Selling", icon: Store },
  { href: "/news", label: "Farmer News", icon: Newspaper },
  { label: "Weather → Action", icon: CloudSun },
  { label: "Farm Planner", icon: Calendar },
  { label: "Government Schemes", icon: FileText },
  { label: "Emergency / Disaster", icon: AlertTriangle },
  { label: "Local Intelligence", icon: MapPin },
  { label: "Machinery & Services", icon: Tractor },
];

const settings = [
  { label: "Language", icon: Globe, value: "English" },
  { label: "Notifications", icon: Bell },
  { label: "Privacy & Security", icon: Shield },
  { label: "Settings", icon: Settings },
  { label: "Help & Support", icon: HelpCircle },
];

export default function MorePage() {
  return (
    <div className="flex flex-col">
      <header className="sticky top-0 z-40 border-b border-slate-100 bg-white/90 px-5 py-3.5 backdrop-blur-lg">
        <h1 className="text-xl font-bold text-slate-900">More</h1>
        <p className="text-sm text-slate-500">All features & settings</p>
      </header>

      <div className="space-y-6 px-5 pt-4">
        {/* Features */}
        <div>
          <h2 className="mb-2 text-sm font-semibold text-slate-700">
            Features
          </h2>
          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            {moreFeatures.map((item, i) => {
              const content = (
                <>
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-100">
                    <item.icon className="h-4 w-4 text-slate-600" />
                  </div>
                  <span className="flex-1 text-sm font-medium text-slate-800">
                    {item.label}
                  </span>
                  <ChevronRight className="h-4 w-4 text-slate-400" />
                </>
              );
              return (
                <div
                  key={i}
                  className={`flex items-center gap-3 px-4 py-3 ${
                    i !== moreFeatures.length - 1
                      ? "border-b border-slate-100"
                      : ""
                  }`}
                >
                  {item.href ? (
                    <Link href={item.href} className="flex flex-1 items-center gap-3">
                      {content}
                    </Link>
                  ) : (
                    content
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Settings */}
        <div>
          <h2 className="mb-2 text-sm font-semibold text-slate-700">Settings</h2>
          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            {settings.map((item, i) => (
              <div
                key={i}
                className={`flex items-center gap-3 px-4 py-3 ${
                  i !== settings.length - 1 ? "border-b border-slate-100" : ""
                }`}
              >
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-100">
                  <item.icon className="h-4 w-4 text-slate-600" />
                </div>
                <span className="flex-1 text-sm font-medium text-slate-800">
                  {item.label}
                </span>
                {item.value && (
                  <span className="text-sm text-slate-400">{item.value}</span>
                )}
                <ChevronRight className="h-4 w-4 text-slate-400" />
              </div>
            ))}
          </div>
        </div>

        {/* About */}
        <div className="pb-4 text-center">
          <p className="text-sm font-semibold text-slate-400">SENSOTECH</p>
          <p className="text-xs text-slate-400">
            Deep intelligence inside. Extremely simple outside.
          </p>
          <p className="mt-1 text-xs text-slate-300">Version 0.1.0</p>
        </div>
      </div>
    </div>
  );
}
