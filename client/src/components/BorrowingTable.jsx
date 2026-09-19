import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Trash2, ExternalLink, Phone, BookOpen, Calendar } from 'lucide-react';
import StatusBadge from './StatusBadge';
import ReturnButton from './ReturnButton';
import ReminderButton from './ReminderButton';
import ConfirmDialog from './ConfirmDialog';

export const BorrowingTable = ({
  records = [],
  onReturnSuccess,
  onDeleteSuccess
}) => {
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    try {
      setIsDeleting(true);
      await onDeleteSuccess(deleteTarget.id);
      setDeleteTarget(null);
    } catch (err) {
      console.error('Delete failed:', err);
    } finally {
      setIsDeleting(false);
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '—';
    return new Date(dateStr).toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getCategoryColor = (cat = '') => {
    const c = cat.toLowerCase();
    if (c.includes('science') || c.includes('tech')) return 'bg-cyan-50 text-cyan-700 border-cyan-200/60';
    if (c.includes('fiction') || c.includes('lit')) return 'bg-purple-50 text-purple-700 border-purple-200/60';
    if (c.includes('history') || c.includes('art')) return 'bg-amber-50 text-amber-700 border-amber-200/60';
    if (c.includes('math') || c.includes('eng')) return 'bg-blue-50 text-blue-700 border-blue-200/60';
    return 'bg-slate-100 text-slate-700 border-slate-200/60';
  };

  return (
    <>
      <div className="overflow-x-auto rounded-2xl border border-slate-200/80 bg-white/95 backdrop-blur-xs shadow-card">
        <table className="w-full text-left border-collapse text-sm">
          <thead>
            <tr className="bg-slate-50/90 border-b border-slate-200/80 text-[11px] font-bold uppercase tracking-wider text-slate-400">
              <th className="py-4 px-5">Student</th>
              <th className="py-4 px-5">Book Details</th>
              <th className="py-4 px-5">Category</th>
              <th className="py-4 px-5">Loan Timeline</th>
              <th className="py-4 px-5">Status</th>
              <th className="py-4 px-5 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100/90">
            {records.map((rec) => {
              const isOverdue = rec.status === 'Overdue';
              const initial = (rec.student_name || 'S').charAt(0).toUpperCase();

              return (
                <tr
                  key={rec.id}
                  className={`group hover:bg-indigo-50/25 transition-colors duration-150 ${
                    isOverdue ? 'bg-rose-50/20' : ''
                  }`}
                >
                  {/* Student Info with Avatar */}
                  <td className="py-4 px-5 align-top">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-slate-100 to-indigo-50 border border-slate-200/70 flex items-center justify-center font-bold text-xs text-indigo-700 shrink-0 shadow-subtle">
                        {initial}
                      </div>
                      <div>
                        <div className="font-bold text-slate-900 leading-snug">{rec.student_name}</div>
                        <a
                          href={`tel:${rec.student_phone}`}
                          className="inline-flex items-center gap-1.5 mt-0.5 text-xs text-slate-500 font-mono hover:text-indigo-600 transition-colors"
                        >
                          <Phone className="w-3 h-3 text-slate-400" />
                          <span>{rec.student_phone}</span>
                        </a>
                      </div>
                    </div>
                  </td>

                  {/* Book Info */}
                  <td className="py-4 px-5 align-top max-w-xs">
                    <div className="font-semibold text-slate-900 line-clamp-1 flex items-center gap-2">
                      <BookOpen className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                      <span title={rec.book_title}>{rec.book_title}</span>
                    </div>
                    {rec.book_id && (
                      <div className="mt-1 text-xs text-slate-400 font-mono flex items-center gap-1">
                        <span className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-500 text-[10px]">ID</span>
                        <span>{rec.book_id}</span>
                      </div>
                    )}
                  </td>

                  {/* Category */}
                  <td className="py-4 px-5 align-top">
                    <span className={`inline-block px-2.5 py-0.5 text-xs font-semibold rounded-lg border ${getCategoryColor(rec.category)}`}>
                      {rec.category || 'General'}
                    </span>
                  </td>

                  {/* Dates */}
                  <td className="py-4 px-5 align-top text-xs text-slate-600 space-y-1">
                    <div className="flex items-center gap-1.5 text-slate-500 font-medium">
                      <Calendar className="w-3 h-3 text-slate-400 shrink-0" />
                      <span>Borrowed: {formatDate(rec.borrowed_date)}</span>
                    </div>
                    <div
                      className={`flex items-center gap-1.5 font-semibold ${
                        isOverdue ? 'text-rose-600' : 'text-slate-700'
                      }`}
                    >
                      <Calendar className="w-3 h-3 shrink-0 opacity-75" />
                      <span>Due: {formatDate(rec.expected_return_date)}</span>
                    </div>
                  </td>

                  {/* Status Badge */}
                  <td className="py-4 px-5 align-top">
                    <StatusBadge
                      status={rec.status}
                      daysRemaining={rec.days_remaining}
                    />
                  </td>

                  {/* Actions */}
                  <td className="py-4 px-5 align-top text-right">
                    <div className="flex items-center justify-end gap-2">
                      {/* WhatsApp Reminder (Shown for overdue books) */}
                      {isOverdue && (
                        <ReminderButton record={rec} size="sm" variant="solid" />
                      )}

                      {/* Return Button */}
                      {!rec.returned_at && (
                        <ReturnButton
                          record={rec}
                          onReturnSuccess={onReturnSuccess}
                          size="sm"
                        />
                      )}

                      {/* View Details */}
                      <Link
                        to={`/borrowed-books/${rec.id}`}
                        className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50/80 rounded-xl transition-all"
                        title="View Details"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </Link>

                      {/* Delete */}
                      <button
                        type="button"
                        onClick={() => setDeleteTarget(rec)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50/80 rounded-xl transition-all"
                        title="Delete Record"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <ConfirmDialog
        isOpen={Boolean(deleteTarget)}
        variant="danger"
        title="Delete Borrowing Record"
        message={`Are you sure you want to permanently delete the borrowing record for "${deleteTarget?.book_title}" borrowed by ${deleteTarget?.student_name}? This action cannot be undone.`}
        confirmLabel="Delete Record"
        isLoading={isDeleting}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteTarget(null)}
      />
    </>
  );
};

export default BorrowingTable;
