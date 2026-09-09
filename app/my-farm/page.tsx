import { Sprout, MapPin, Plus, Calendar, TrendingUp, Activity, History } from "lucide-react";

// Placeholder farm list — real data will come from the API in Phase 2.

const sampleFarms = [
  {
    name: "Sharma Farm",
    location: "Nashik, Maharashtra",
    area: "4.5 acres",
    crop: "Cotton",
    stage: "Flowering",
    health: 78,
  },
  {
    name: "Riverside Plot",
    location: "Nashik, Maharashtra",
    area: "2.0 acres",
    crop: "Soybean",
    stage: "Vegetative",
    health: 85,
  },
];

export default function MyFarmPage() {
  return (
    <div className="flex flex-col">
      <PageHeader title="My Farm" subtitle="Your farm portfolio" />

      <div className="space-y-4 px-5 pt-4">
        {/* Add farm button */}
        <button className="flex w-full items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-slate-300 bg-white py-4 text-sm font-semibold text-slate-600 transition-colors hover:border-brand-400 hover:text-brand-600">
          <Plus className="h-5 w-5" />
          Add New Farm
        </button>

        {/* Farm cards */}
        {sampleFarms.map((farm, i) => (
          <div
            key={i}
            className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm"
          >
            {/* Map placeholder */}
            <div className="flex h-28 items-center justify-center bg-gradient-to-br from-brand-100 to-brand-50">
              <div className="flex flex-col items-center gap-1 text-brand-600">
                <MapPin className="h-8 w-8" />
                <span className="text-xs font-medium">Map view</span>
              </div>
            </div>

            <div className="p-4">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-base font-semibold text-slate-900">
                    {farm.name}
                  </h3>
                  <p className="text-sm text-slate-500">{farm.location}</p>
                </div>
                <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600">
                  {farm.area}
                </span>
              </div>

              <div className="mt-3 flex flex-wrap gap-2">
                <Tag icon={Sprout} text={farm.crop} />
                <Tag icon={Calendar} text={farm.stage} />
              </div>

              {/* Health score */}
              <div className="mt-4">
                <div className="flex items-center justify-between text-xs">
                  <span className="flex items-center gap-1 font-medium text-slate-600">
                    <Activity className="h-3.5 w-3.5" />
                    Farm Health Score
                  </span>
                  <span className="font-semibold text-brand-600">
                    {farm.health}/100
                  </span>
                </div>
                <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-slate-100">
                  <div
                    className="h-full rounded-full bg-brand-500"
                    style={{ width: `${farm.health}%` }}
                  />
                </div>
              </div>

              {/* Quick links */}
              <div className="mt-4 grid grid-cols-3 gap-2">
                <FarmAction icon={History} label="History" />
                <FarmAction icon={TrendingUp} label="Scorecard" />
                <FarmAction icon={Activity} label="Memory" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function Tag({ icon: Icon, text }: { icon: typeof Sprout; text: string }) {
  return (
    <span className="flex items-center gap-1.5 rounded-lg bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-700">
      <Icon className="h-3.5 w-3.5" />
      {text}
    </span>
  );
}

function FarmAction({ icon: Icon, label }: { icon: typeof Sprout; label: string }) {
  return (
    <button className="flex flex-col items-center gap-1 rounded-xl bg-slate-50 py-2.5 text-xs font-medium text-slate-600 transition-colors hover:bg-slate-100">
      <Icon className="h-4 w-4" />
      {label}
    </button>
  );
}

function PageHeader({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <header className="sticky top-0 z-40 border-b border-slate-100 bg-white/90 px-5 py-3.5 backdrop-blur-lg">
      <h1 className="text-xl font-bold text-slate-900">{title}</h1>
      <p className="text-sm text-slate-500">{subtitle}</p>
    </header>
  );
}
