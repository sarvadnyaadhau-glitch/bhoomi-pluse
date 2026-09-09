import { Newspaper, Calendar, Tag, Info } from "lucide-react";

const categories = [
  "Government Schemes",
  "Crop News",
  "Market",
  "Weather Alerts",
  "Pest Alerts",
  "MSP / Procurement",
];

export default function NewsPage() {
  return (
    <div className="flex flex-col">
      <header className="sticky top-0 z-40 border-b border-slate-100 bg-white/90 px-5 py-3.5 backdrop-blur-lg">
        <h1 className="text-xl font-bold text-slate-900">Farmer News</h1>
        <p className="text-sm text-slate-500">What matters for you today</p>
      </header>

      <div className="space-y-4 px-5 pt-4">
        {/* Data unavailable notice */}
        <div className="flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4">
          <Info className="h-5 w-5 shrink-0 text-amber-600" />
          <div>
            <p className="text-sm font-semibold text-amber-900">
              News feed not configured
            </p>
            <p className="mt-0.5 text-xs text-amber-700">
              Connect news sources to receive personalized agriculture news,
              government scheme updates, and alerts. News content is never
              fabricated.
            </p>
          </div>
        </div>

        {/* Category pills */}
        <div className="flex flex-wrap gap-2">
          {categories.map((cat, i) => (
            <span
              key={i}
              className="flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-600"
            >
              <Tag className="h-3 w-3" />
              {cat}
            </span>
          ))}
        </div>

        {/* News feed placeholder */}
        <div>
          <h2 className="mb-2 text-sm font-semibold text-slate-700">
            For You
          </h2>
          <div className="rounded-2xl border border-slate-200 bg-white p-6 text-center shadow-sm">
            <Newspaper className="mx-auto h-10 w-10 text-slate-300" />
            <p className="mt-3 text-sm font-medium text-slate-500">
              No news available yet
            </p>
            <p className="mt-1 text-xs text-slate-400">
              News articles will appear here once sources are connected
            </p>
          </div>
        </div>

        {/* Mere Liye Kya Badla feature preview */}
        <div className="rounded-2xl border border-brand-200 bg-brand-50 p-4">
          <h2 className="flex items-center gap-1.5 text-sm font-semibold text-brand-800">
            <Calendar className="h-4 w-4" />
            Mere Liye Kya Badla?
          </h2>
          <p className="mt-1.5 text-xs text-brand-700">
            A 2-minute summary of what changed for your farm — coming once news
            sources are connected.
          </p>
        </div>
      </div>
    </div>
  );
}
