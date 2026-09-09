import { MessageCircle, Send, Mic, Sparkles, Lightbulb } from "lucide-react";

const suggestedQuestions = [
  "What is important for my farm today?",
  "Should I irrigate tomorrow?",
  "What if I delay fertilizer by a week?",
  "Which pest risk is highest for my crop now?",
];

export default function AskPage() {
  return (
    <div className="flex flex-col">
      <header className="sticky top-0 z-40 border-b border-slate-100 bg-white/90 px-5 py-3.5 backdrop-blur-lg">
        <div className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-600 text-white">
            <Sparkles className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-slate-900">Ask SENSOTECH</h1>
            <p className="text-xs text-slate-500">Your farm AI assistant</p>
          </div>
        </div>
      </header>

      <div className="flex flex-1 flex-col px-5 pt-5">
        {/* AI greeting */}
        <div className="rounded-2xl bg-brand-600 p-4 text-white shadow-lg shadow-brand-600/20">
          <MessageCircle className="h-6 w-6" />
          <p className="mt-2 text-sm font-medium">
            Namaste! I&apos;m your SENSOTECH AI assistant. Ask me anything about
            your farm — I&apos;ll use your farm data, weather, and crop knowledge
            to help you decide.
          </p>
          <p className="mt-1.5 text-xs text-brand-100">
            Marathi · Hindi · English
          </p>
        </div>

        {/* Suggested questions */}
        <div className="mt-5">
          <h2 className="mb-2 flex items-center gap-1.5 text-sm font-semibold text-slate-700">
            <Lightbulb className="h-4 w-4 text-amber-500" />
            Try asking
          </h2>
          <div className="space-y-2">
            {suggestedQuestions.map((q, i) => (
              <button
                key={i}
                className="flex w-full items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-3 text-left text-sm text-slate-700 transition-colors hover:border-brand-300 hover:bg-brand-50"
              >
                {q}
              </button>
            ))}
          </div>
        </div>

        {/* Chat history placeholder */}
        <div className="mt-5 flex-1">
          <p className="text-center text-sm text-slate-400">
            Your conversation will appear here
          </p>
        </div>
      </div>

      {/* Input bar */}
      <div className="sticky bottom-20 z-30 mx-5">
        <div className="flex items-center gap-2 rounded-2xl border border-slate-200 bg-white p-2 shadow-lg">
          <button className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-600">
            <Mic className="h-5 w-5" />
          </button>
          <input
            type="text"
            placeholder="Ask about your farm..."
            className="flex-1 bg-transparent px-2 text-sm text-slate-800 outline-none placeholder:text-slate-400"
          />
          <button className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-600 text-white transition-transform active:scale-95">
            <Send className="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  );
}
