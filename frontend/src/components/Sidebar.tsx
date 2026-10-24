'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Home,
  Receipt,
  ClipboardList,
  Users,
  Settings,
  Menu,
  X,
  GraduationCap,
} from 'lucide-react';

const navItems = [
  { href: '/', label: 'Home', icon: Home },
  { href: '/fees', label: 'Fees', icon: Receipt },
  { href: '/results', label: 'Results', icon: ClipboardList },
  { href: '#', label: 'Students', icon: Users, disabled: true },
  { href: '#', label: 'Settings', icon: Settings, disabled: true },
];

export function Sidebar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  // Close on route change
  useEffect(() => {
    setMobileOpen(false);
  }, [pathname]);

  return (
    <>
      {/* Mobile hamburger */}
      <button
        onClick={() => setMobileOpen(true)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 rounded-xl bg-white border border-[#E8E0CF] shadow-sm hover:shadow-md transition-shadow"
        aria-label="Open navigation"
      >
        <Menu className="w-5 h-5 text-primary-text" />
      </button>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/30 z-40 backdrop-blur-sm"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 z-50 h-full w-64 bg-[#EFE8D8] border-r border-[#E8E0CF] flex flex-col transition-transform duration-300 ease-in-out ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        } lg:translate-x-0 lg:static lg:z-auto`}
      >
        {/* Logo area */}
        <div className="p-5 flex items-center justify-between border-b border-[#E8E0CF]/60">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#2F6B4F] flex items-center justify-center shadow-sm">
              <GraduationCap className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-sm font-bold text-primary-text leading-tight">
                Al-Noor Academy
              </h1>
              <p className="text-[10px] text-muted font-medium tracking-wide uppercase">
                School Assistant
              </p>
            </div>
          </div>
          <button
            onClick={() => setMobileOpen(false)}
            className="lg:hidden p-1 rounded-lg hover:bg-[#E8E0CF] transition-colors"
            aria-label="Close navigation"
          >
            <X className="w-4 h-4 text-muted" />
          </button>
        </div>

        {/* Nav links */}
        <nav className="flex-1 py-4 px-3 space-y-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;

            if (item.disabled) {
              return (
                <div
                  key={item.label}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-muted/50 cursor-not-allowed"
                >
                  <Icon className="w-4.5 h-4.5" />
                  <span className="text-sm font-medium">{item.label}</span>
                  <span className="ml-auto text-[10px] bg-[#E8E0CF] text-muted px-1.5 py-0.5 rounded-md">
                    Soon
                  </span>
                </div>
              );
            }

            return (
              <Link
                key={item.label}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                  isActive
                    ? 'bg-[#2F6B4F] text-white shadow-sm'
                    : 'text-primary-text hover:bg-[#E8E0CF] hover:text-[#2F6B4F]'
                }`}
              >
                <Icon className="w-4.5 h-4.5" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-[#E8E0CF]/60">
          <p className="text-[10px] text-muted text-center">
            School Automation v1.0
          </p>
        </div>
      </aside>

      {/* Mobile bottom nav */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-[#E8E0CF] shadow-lg">
        <div className="flex justify-around py-2">
          {navItems
            .filter((item) => !item.disabled)
            .map((item) => {
              const isActive = pathname === item.href;
              const Icon = item.icon;

              return (
                <Link
                  key={item.label}
                  href={item.href}
                  className={`flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-lg transition-colors ${
                    isActive ? 'text-[#2F6B4F]' : 'text-muted'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span className="text-[10px] font-medium">{item.label}</span>
                </Link>
              );
            })}
        </div>
      </nav>
    </>
  );
}
