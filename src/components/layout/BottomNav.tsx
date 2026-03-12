'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, CalendarDays, Receipt, Phone, Settings } from 'lucide-react';

const tabs = [
  { href: '/', label: 'Tableau', icon: LayoutDashboard },
  { href: '/sejours', label: 'Séjours', icon: CalendarDays },
  { href: '/depenses', label: 'Dépenses', icon: Receipt },
  { href: '/contacts', label: 'Contacts', icon: Phone },
  { href: '/parametres', label: 'Réglages', icon: Settings },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-t border-sand-200">
      <div className="max-w-lg mx-auto flex items-center justify-around" style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}>
        {tabs.map((tab) => {
          const isActive = pathname === tab.href;
          const Icon = tab.icon;
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={`flex flex-col items-center gap-0.5 py-2 px-4 transition-colors ${
                isActive
                  ? 'text-terracotta-500'
                  : 'text-sand-400 hover:text-sand-500'
              }`}
            >
              <Icon size={22} strokeWidth={isActive ? 2.5 : 1.8} />
              <span className={`text-[10px] ${isActive ? 'font-semibold' : 'font-medium'}`}>
                {tab.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
