import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Phone, Calendar, BookOpen, Trash2, ExternalLink } from 'lucide-react';
import StatusBadge from './StatusBadge';
import ReturnButton from './ReturnButton';
import ReminderButton from './ReminderButton';
import ConfirmDialog from './ConfirmDialog';

export const BorrowingCard = ({
  record,
  onReturnSuccess,
  onDeleteSuccess
}) => {
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    try {
      setIsDeleting(true);
      await onDeleteSuccess(record.id);
      setIsDeleteDialogOpen(false);
    } catch (err) {
      console.error('Delete error:', err);
    } finally {
      setIsDeleting(false);
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '—';
    return new Date(dateStr).toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const isOverdue = record.status === 'Overdue';

  return (
    <>
      <div
        className={`p-4 bg-white rounded-2xl border transition-all shadow-xs space-y-3 ${
          isOverdue ? 'border-rose-200 bg-rose-50/10' : 'border-slate-200'
        }`}
      >
        {/* Header: Title and Status Badge */}
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1">
            <h4 className="font-semibold text-slate-900 line-clamp-2 text-sm flex items-center gap-1.5">
              <BookOpen className="w-4 h-4 text-indigo-500 shrink-0" />
              <span>{record.book_title}</span>
            </h4>
            {record.book_id && (
              <span className="text-[11px] text-slate-400 font-mono">
                ID: {record.book_id}
              </span>
            )}
          </div>
          <StatusBadge status={record.status} daysRemaining={record.days_remaining} size="sm" />
        </div>

        {/* Student Information */}
        <div className="p-3 bg-slate-50 rounded-xl space-y-1 text-xs">
          <div className="flex items-center justify-between">
            <span className="text-slate-500">Student:</span>
            <span className="font-semibold text-slate-800">{record.student_name}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-slate-500">Phone:</span>
            <a
              href={`tel:${record.student_phone}`}
              className="font-mono text-indigo-600 hover:underline flex items-center gap-1"
            >
              <Phone className="w-3 h-3" />
              {record.student_phone}
            </a>
          </div>
          {record.category && (
            <div className="flex items-center justify-between">
              <span className="text-slate-500">Category:</span>
              <span className="text-slate-700 font-medium">{record.category}</span>
            </div>
          )}
        </div>

        {/* Dates */}
        <div className="grid grid-cols-2 gap-2 text-xs py-1">
          <div className="text-slate-500 flex items-center gap-1">
            <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span>Borrowed: {formatDate(record.borrowed_date)}</span>
          </div>
          <div
            className={`flex items-center gap-1 font-medium ${
              isOverdue ? 'text-rose-600' : 'text-slate-700'
            }`}
          >
            <Calendar className="w-3.5 h-3.5 shrink-0 opacity-75" />
            <span>Due: {formatDate(record.expected_return_date)}</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            {!record.returned_at && (
              <ReturnButton
                record={record}
                onReturnSuccess={onReturnSuccess}
                size="sm"
              />
            )}
            {isOverdue && (
              <ReminderButton record={record} size="sm" variant="outline" />
            )}
          </div>

          <div className="flex items-center gap-1">
            <Link
              to={`/borrowed-books/${record.id}`}
              className="p-1.5 text-slate-400 hover:text-indigo-600 rounded-lg hover:bg-slate-100 transition-colors"
              title="View Details"
            >
              <ExternalLink className="w-4 h-4" />
            </Link>
            <button
              type="button"
              onClick={() => setIsDeleteDialogOpen(true)}
              className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-slate-100 transition-colors"
              title="Delete"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      <ConfirmDialog
        isOpen={isDeleteDialogOpen}
        variant="danger"
        title="Delete Borrowing Record"
        message={`Delete borrowing record for "${record.book_title}" (${record.student_name})?`}
        confirmLabel="Delete"
        isLoading={isDeleting}
        onConfirm={handleDelete}
        onCancel={() => setIsDeleteDialogOpen(false)}
      />
    </>
  );
};

export default BorrowingCard;
