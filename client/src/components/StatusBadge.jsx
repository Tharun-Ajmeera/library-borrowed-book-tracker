import React from 'react';
import { CheckCircle2, AlertTriangle, Clock, BookOpen } from 'lucide-react';

export const StatusBadge = ({ status, daysRemaining, showIcon = true, size = 'md' }) => {
  const normalized = (status || '').toLowerCase().replace(/[\s_-]+/g, '');

  const config = {
    returned: {
      label: 'Returned',
      bg: 'bg-emerald-50 text-emerald-700 border-emerald-200/80 ring-emerald-500/10',
      dot: 'bg-emerald-500',
      icon: CheckCircle2,
      subtext: null
    },
    overdue: {
      label: 'Overdue',
      bg: 'bg-rose-50 text-rose-700 border-rose-200/80 ring-rose-500/10 shadow-xs shadow-rose-500/10',
      dot: 'bg-rose-500 animate-ping',
      icon: AlertTriangle,
      subtext: daysRemaining !== undefined && daysRemaining < 0 ? `${Math.abs(daysRemaining)}d overdue` : null
    },
    duesoon: {
      label: 'Due Soon',
      bg: 'bg-amber-50 text-amber-700 border-amber-200/80 ring-amber-500/10',
      dot: 'bg-amber-500',
      icon: Clock,
      subtext: daysRemaining !== undefined && daysRemaining >= 0 ? `${daysRemaining}d left` : null
    },
    borrowed: {
      label: 'Borrowed',
      bg: 'bg-indigo-50 text-indigo-700 border-indigo-200/80 ring-indigo-500/10',
      dot: 'bg-indigo-500',
      icon: BookOpen,
      subtext: daysRemaining !== undefined && daysRemaining > 2 ? `${daysRemaining}d left` : null
    }
  };

  const current = config[normalized] || config.borrowed;
  const Icon = current.icon;

  const sizeClasses = {
    sm: 'px-2 py-0.5 text-[11px]',
    md: 'px-2.5 py-1 text-xs',
    lg: 'px-3.5 py-1.5 text-sm font-semibold'
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 font-semibold rounded-full border ring-1 ring-inset tracking-tight shadow-subtle ${
        current.bg
      } ${sizeClasses[size] || sizeClasses.md}`}
    >
      {showIcon ? (
        <Icon className="w-3.5 h-3.5 shrink-0" />
      ) : (
        <span className="relative flex h-2 w-2">
          {normalized === 'overdue' && (
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
          )}
          <span className={`relative inline-flex rounded-full h-2 w-2 ${normalized === 'overdue' ? 'bg-rose-500' : current.dot}`}></span>
        </span>
      )}
      <span>{current.label}</span>
      {current.subtext && (
        <span className="opacity-80 text-[10px] font-medium border-l border-current/25 pl-1.5 ml-0.5 tracking-normal">
          {current.subtext}
        </span>
      )}
    </span>
  );
};

export default StatusBadge;
