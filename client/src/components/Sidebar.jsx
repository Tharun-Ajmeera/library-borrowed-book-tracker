import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, BookOpen, PlusCircle, Settings, X, ShieldCheck } from 'lucide-react';

export const Sidebar = ({ isOpen, onClose }) => {
  const navItems = [
    {
      to: '/dashboard',
      label: 'Dashboard',
      icon: LayoutDashboard,
      description: 'Overview & metrics'
    },
    {
      to: '/borrowed-books',
      label: 'Borrowed Books',
      icon: BookOpen,
      description: 'Manage all loans'
    },
    {
      to: '/add-borrowing',
      label: 'Add Borrowing',
      icon: PlusCircle,
      description: 'Record new student loan'
    },
    {
      to: '/settings',
      label: 'Settings',
      icon: Settings,
      description: 'Staff & preferences'
    }
  ];

  const content = (
    <div className="flex flex-col justify-between h-full p-4">
      <div className="space-y-6">
        {/* Navigation Items */}
        <div className="space-y-1.5">
          <div className="px-3 pb-2 text-[10px] font-bold uppercase tracking-widest text-slate-400">
            Main Navigation
          </div>
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={onClose}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 group ${
                    isActive
                      ? 'bg-gradient-to-r from-indigo-600 to-violet-600 text-white shadow-md shadow-indigo-600/25 translate-x-0.5'
                      : 'text-slate-600 hover:bg-slate-100/80 hover:text-slate-900 hover:translate-x-0.5'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <div className={`p-1 rounded-lg transition-colors ${
                      isActive ? 'bg-white/20 text-white' : 'text-slate-400 group-hover:text-indigo-600'
                    }`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="leading-tight">{item.label}</div>
                    </div>
                  </>
                )}
              </NavLink>
            );
          })}
        </div>
      </div>

      {/* Footer / Data Isolation Indicator */}
      <div className="p-3.5 bg-gradient-to-br from-slate-50 to-indigo-50/30 border border-slate-200/80 rounded-2xl space-y-1.5 text-xs shadow-subtle">
        <div className="flex items-center gap-2 font-bold text-slate-800">
          <div className="p-1 rounded-md bg-emerald-50 text-emerald-600 border border-emerald-200/60">
            <ShieldCheck className="w-3.5 h-3.5" />
          </div>
          <span className="text-xs">RLS Data Isolation</span>
        </div>
        <p className="text-[11px] leading-relaxed text-slate-500 font-normal">
          Staff records are cryptographically isolated and authenticated via Supabase Row-Level Security.
        </p>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden lg:block w-64 shrink-0 bg-white/70 backdrop-blur-md border-r border-slate-200/70 min-h-[calc(100vh-4rem)]">
        {content}
      </aside>

      {/* Mobile Drawer Overlay */}
      {isOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity"
            onClick={onClose}
          />
          <div className="fixed inset-y-0 left-0 z-50 w-72 bg-white/95 backdrop-blur-md shadow-2xl flex flex-col border-r border-slate-200">
            <div className="flex items-center justify-between p-4 border-b border-slate-100">
              <span className="font-bold text-slate-900">Navigation</span>
              <button
                type="button"
                onClick={onClose}
                className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto">{content}</div>
          </div>
        </div>
      )}
    </>
  );
};

export default Sidebar;
