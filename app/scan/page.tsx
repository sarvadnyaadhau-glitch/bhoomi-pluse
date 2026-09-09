import { ScanLine, Camera, AlertCircle, ImagePlus, FileQuestion } from "lucide-react";

export default function ScanPage() {
  return (
    <div className="flex flex-col">
      <header className="sticky top-0 z-40 border-b border-slate-100 bg-white/90 px-5 py-3.5 backdrop-blur-lg">
        <h1 className="text-xl font-bold text-slate-900">Scan / Crop Doctor</h1>
        <p className="text-sm text-slate-500">Capture or upload a crop photo</p>
      </header>

      <div className="space-y-5 px-5 pt-5">
        {/* Camera capture area */}
        <div className="flex flex-col items-center justify-center rounded-3xl border-2 border-dashed border-slate-300 bg-white py-16">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-brand-100">
            <Camera className="h-10 w-10 text-brand-600" />
          </div>
          <p className="mt-4 text-sm font-semibold text-slate-700">
            Point at the crop leaf or plant
          </p>
          <p className="mt-1 text-xs text-slate-400">
            Ensure good lighting and focus
          </p>
          <button className="mt-5 flex items-center gap-2 rounded-xl bg-brand-600 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-brand-600/30 transition-transform active:scale-95">
            <ScanLine className="h-5 w-5" />
            Capture Photo
          </button>
        </div>

        {/* Or upload */}
        <div className="flex items-center gap-3">
          <div className="h-px flex-1 bg-slate-200" />
          <span className="text-xs text-slate-400">or</span>
          <div className="h-px flex-1 bg-slate-200" />
        </div>

        <button className="flex w-full items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white py-3.5 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50">
          <ImagePlus className="h-5 w-5" />
          Upload from Gallery
        </button>

        {/* How it works */}
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <h2 className="text-sm font-semibold text-slate-700">How it works</h2>
          <div className="mt-3 space-y-3">
            {[
              { icon: Camera, text: "Capture a clear photo of the affected plant" },
              { icon: FileQuestion, text: "AI identifies the crop and analyzes symptoms" },
              { icon: AlertCircle, text: "Get diagnosis, confidence level, and next steps" },
            ].map((step, i) => (
              <div key={i} className="flex items-start gap-3">
                <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-brand-100">
                  <step.icon className="h-3.5 w-3.5 text-brand-600" />
                </div>
                <p className="pt-0.5 text-sm text-slate-600">{step.text}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Scan history */}
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
          <h2 className="text-sm font-semibold text-slate-700">Scan History</h2>
          <p className="mt-2 text-sm text-slate-400">
            No scans yet. Your scan history will appear here.
          </p>
        </div>
      </div>
    </div>
  );
}
