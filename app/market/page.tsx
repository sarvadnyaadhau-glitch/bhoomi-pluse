import { Store, TrendingUp, TrendingDown, Minus, Info, MapPin } from "lucide-react";

export default function MarketPage() {
  return (
    <div className="flex flex-col">
      <header className="sticky top-0 z-40 border-b border-slate-100 bg-white/90 px-5 py-3.5 backdrop-blur-lg">
        <h1 className="text-xl font-bold text-slate-900">Market</h1>
        <p className="text-sm text-slate-500">Mandi prices & selling insights</p>
      </header>

      <div className="space-y-4 px-5 pt-4">
        {/* Data unavailable notice */}
        <div className="flex items-start gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4">
          <Info className="h-5 w-5 shrink-0 text-amber-600" />
          <div>
            <p className="text-sm font-semibold text-amber-900">
              Market data not configured
            </p>
            <p className="mt-0.5 text-xs text-amber-700">
              Connect a market data provider (e.g. eNAM, Agmarknet) to see live
              mandi prices, trends, and selling recommendations. Real prices are
              never fabricated.
            </p>
          </div>
        </div>

        {/* Nearby markets placeholder */}
        <div>
          <h2 className="mb-2 text-sm font-semibold text-slate-700">
            Nearby Markets
          </h2>
          <div className="space-y-2">
            {[
              { name: "Nashik APMC", distance: "12 km" },
              { name: "Lasalgaon Mandi", distance: "25 km" },
              { name: "Niphad Market", distance: "18 km" },
            ].map((market, i) => (
              <div
                key={i}
                className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-100">
                  <Store className="h-5 w-5 text-slate-500" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-slate-800">
                    {market.name}
                  </p>
                  <p className="flex items-center gap-1 text-xs text-slate-500">
                    <MapPin className="h-3 w-3" />
                    {market.distance}
                  </p>
                </div>
                <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-500">
                  No data
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Trend legend */}
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <h2 className="text-sm font-semibold text-slate-700">Price Trends</h2>
          <div className="mt-3 flex items-center justify-around">
            <div className="flex flex-col items-center gap-1">
              <TrendingUp className="h-5 w-5 text-brand-600" />
              <span className="text-xs text-slate-500">Rising</span>
            </div>
            <div className="flex flex-col items-center gap-1">
              <Minus className="h-5 w-5 text-slate-400" />
              <span className="text-xs text-slate-500">Stable</span>
            </div>
            <div className="flex flex-col items-center gap-1">
              <TrendingDown className="h-5 w-5 text-red-500" />
              <span className="text-xs text-slate-500">Falling</span>
            </div>
          </div>
          <p className="mt-3 text-center text-xs text-slate-400">
            Trends will appear when market data is connected
          </p>
        </div>
      </div>
    </div>
  );
}
