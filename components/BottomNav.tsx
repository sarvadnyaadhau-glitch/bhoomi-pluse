"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Sprout, ScanLine, MessageCircle, MoreHorizontal } from "lucide-react";

const navItems = [
  { href: "/", label: "Home", icon: Home },
  { href: "/my-farm", label: "Farm", icon: Sprout },
  { href: "/scan", label: "Scan", icon: ScanLine },
  { href: "/ask", label: "Ask", icon: MessageCircle },
  { href: "/more", label: "More", icon: MoreHorizontal },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-1/2 z-50 w-full max-w-md -translate-x-1/2 border-t border-slate-200 bg-white/95 backdrop-blur-lg">
      <div className="flex items-stretch justify-around px-2 py-2 pb-[env(safe-area-inset-bottom)]">
        {navItems.map(({ href, label, icon: Icon }) => {
          const active = pathname === href;
          const isScan = href === "/scan";
          return (
            <Link
              key={href}
              href={href}
              className={`flex flex-1 flex-col items-center gap-1 rounded-xl py-1.5 transition-colors ${
                active ? "text-brand-600" : "text-slate-400 hover:text-slate-600"
              }`}
            >
              <div
                className={`flex h-9 w-9 items-center justify-center rounded-full transition-all ${
                  isScan
                    ? "bg-brand-600 text-white shadow-lg shadow-brand-600/30"
                    : active
                    ? "bg-brand-100"
                    : ""
                }`}
              >
                <Icon className="h-5 w-5" strokeWidth={isScan ? 2.5 : 2} />
              </div>
              <span className="text-[10px] font-medium">{label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
