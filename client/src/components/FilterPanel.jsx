import React from 'react';
import { Filter, RotateCcw, Calendar, Tag } from 'lucide-react';

const CATEGORIES = [
  'All',
  'Programming',
  'Computer Science',
  'Mathematics',
  'Science',
  'Literature',
  'Business',
  'General',
  'Other'
];

const STATUSES = [
  { id: 'all', label: 'All Records' },
  { id: 'borrowed', label: 'Borrowed' },
  { id: 'due_soon', label: 'Due Soon' },
  { id: 'overdue', label: 'Overdue' },
  { id: 'returned', label: 'Returned' }
];

export const FilterPanel = ({
  status,
  onStatusChange,
  category,
  onCategoryChange,
  startDate,
  onStartDateChange,
  endDate,
  onEndDateChange,
  onReset
}) => {
  const hasActiveFilters =
    status !== 'all' ||
    (category && category !== 'all') ||
    startDate ||
    endDate;

  return (
    <div className="p-4 bg-white border rounded-2xl border-slate-200 shadow-xs space-y-4">
      {/* Status Segmented Tabs */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="text-xs font-semibold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
            <Filter className="w-3.5 h-3.5" />
            Status Filter
          </label>
          {hasActiveFilters && (
            <button
              onClick={onReset}
              className="inline-flex items-center gap-1 text-xs font-medium text-indigo-600 hover:text-indigo-700 transition-colors"
            >
              <RotateCcw className="w-3 h-3" />
              Reset filters
            </button>
          )}
        </div>

        <div className="flex flex-wrap gap-1.5">
          {STATUSES.map((item) => {
            const isActive = status === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onStatusChange(item.id)}
                className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${
                  isActive
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {item.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Advanced Filters: Category and Date Range */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3 pt-3 border-t border-slate-100">
        {/* Category Dropdown */}
        <div>
          <label className="block mb-1.5 text-xs font-medium text-slate-600 flex items-center gap-1">
            <Tag className="w-3.5 h-3.5 text-slate-400" />
            Category
          </label>
          <select
            value={category || 'All'}
            onChange={(e) => onCategoryChange(e.target.value)}
            className="w-full px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-700 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
          >
            {CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>
                {cat === 'All' ? 'All Categories' : cat}
              </option>
            ))}
          </select>
        </div>

        {/* Start Date */}
        <div>
          <label className="block mb-1.5 text-xs font-medium text-slate-600 flex items-center gap-1">
            <Calendar className="w-3.5 h-3.5 text-slate-400" />
            Borrowed From
          </label>
          <input
            type="date"
            value={startDate || ''}
            onChange={(e) => onStartDateChange(e.target.value)}
            className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-700 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
          />
        </div>

        {/* End Date */}
        <div>
          <label className="block mb-1.5 text-xs font-medium text-slate-600 flex items-center gap-1">
            <Calendar className="w-3.5 h-3.5 text-slate-400" />
            Borrowed To
          </label>
          <input
            type="date"
            value={endDate || ''}
            onChange={(e) => onEndDateChange(e.target.value)}
            className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-700 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
          />
        </div>
      </div>
    </div>
  );
};

export default FilterPanel;
