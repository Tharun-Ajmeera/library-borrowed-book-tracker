import React from 'react';
import { BookDashed, Plus } from 'lucide-react';
import { Link } from 'react-router-dom';

export const EmptyState = ({
  title = 'No records found',
  description = 'There are no borrowing records matching your search or filters.',
  actionLabel = 'Add New Borrowing',
  actionTo = '/add-borrowing',
  icon: Icon = BookDashed
}) => {
  return (
    <div className="flex flex-col items-center justify-center p-12 text-center bg-white border border-dashed rounded-2xl border-slate-200">
      <div className="flex items-center justify-center w-16 h-16 mb-4 rounded-full bg-slate-50 text-slate-400">
        <Icon className="w-8 h-8 stroke-[1.5]" />
      </div>
      <h3 className="text-base font-semibold text-slate-800">{title}</h3>
      <p className="max-w-sm mt-1 text-sm text-slate-500">{description}</p>
      {actionTo && actionLabel && (
        <Link
          to={actionTo}
          className="inline-flex items-center gap-2 px-4 py-2 mt-5 text-sm font-medium text-white transition-colors bg-indigo-600 rounded-lg hover:bg-indigo-700 shadow-sm"
        >
          <Plus className="w-4 h-4" />
          {actionLabel}
        </Link>
      )}
    </div>
  );
};

export default EmptyState;
