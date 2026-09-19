import React from 'react';
import { ArrowUpRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export const StatCard = ({
  title,
  value,
  subtitle,
  icon: Icon,
  color = 'indigo',
  to,
  isLoading = false
}) => {
  const colorSchemes = {
    indigo: {
      border: 'hover:border-indigo-300/80',
      iconBg: 'bg-indigo-50/90 text-indigo-600 ring-1 ring-indigo-500/20',
      accent: 'from-indigo-500 to-violet-500',
      shadow: 'hover:shadow-glow-indigo'
    },
    amber: {
      border: 'hover:border-amber-300/80',
      iconBg: 'bg-amber-50/90 text-amber-600 ring-1 ring-amber-500/20',
      accent: 'from-amber-400 to-orange-500',
      shadow: 'hover:shadow-amber-500/10'
    },
    rose: {
      border: 'hover:border-rose-300/80',
      iconBg: 'bg-rose-50/90 text-rose-600 ring-1 ring-rose-500/20',
      accent: 'from-rose-500 to-pink-500',
      shadow: 'hover:shadow-glow-rose'
    },
    emerald: {
      border: 'hover:border-emerald-300/80',
      iconBg: 'bg-emerald-50/90 text-emerald-600 ring-1 ring-emerald-500/20',
      accent: 'from-emerald-400 to-teal-500',
      shadow: 'hover:shadow-glow-emerald'
    }
  };

  const currentTheme = colorSchemes[color] || colorSchemes.indigo;
  const CardWrapper = to ? Link : 'div';

  return (
    <CardWrapper
      to={to}
      className={`relative overflow-hidden p-5 bg-white/90 backdrop-blur-xs border rounded-2xl border-slate-200/80 shadow-card transition-all duration-300 group ${
        to ? `cursor-pointer hover:-translate-y-1 hover:shadow-card-hover ${currentTheme.border} ${currentTheme.shadow}` : ''
      }`}
    >
      {/* Top Accent Gradient Line */}
      <div className={`absolute top-0 inset-x-0 h-1 bg-gradient-to-r ${currentTheme.accent} opacity-80`} />

      <div className="flex items-center justify-between">
        <span className="text-[11px] font-bold tracking-wider text-slate-400 uppercase">
          {title}
        </span>
        <div className={`p-2.5 rounded-xl transition-transform duration-300 group-hover:scale-110 ${currentTheme.iconBg}`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>

      <div className="mt-4">
        {isLoading ? (
          <div className="w-20 h-9 bg-slate-100 rounded-lg animate-pulse my-1" />
        ) : (
          <div className="text-3xl font-extrabold tracking-tight text-slate-900 font-heading">
            {value ?? 0}
          </div>
        )}

        {subtitle && (
          <div className="mt-2 text-xs text-slate-500 flex items-center justify-between font-medium">
            <span>{subtitle}</span>
            {to && (
              <span className="inline-flex items-center gap-0.5 text-indigo-600 font-semibold opacity-0 group-hover:opacity-100 transition-opacity">
                View all <ArrowUpRight className="w-3.5 h-3.5" />
              </span>
            )}
          </div>
        )}
      </div>
    </CardWrapper>
  );
};

export default StatCard;
