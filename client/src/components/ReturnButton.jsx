import React, { useState } from 'react';
import { Check, CheckCheck } from 'lucide-react';
import ConfirmDialog from './ConfirmDialog';

export const ReturnButton = ({ record, onReturnSuccess, size = 'sm' }) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  if (!record || record.returned_at) {
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold text-emerald-700 bg-emerald-50 rounded-full border border-emerald-200/80">
        <CheckCheck className="w-3.5 h-3.5 text-emerald-600" />
        Returned
      </span>
    );
  }

  const handleConfirm = async () => {
    try {
      setIsLoading(true);
      await onReturnSuccess(record.id);
      setIsDialogOpen(false);
    } catch (err) {
      console.error('Failed to mark as returned:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const sizeClasses = {
    sm: 'px-3 py-1.5 text-xs gap-1.5',
    md: 'px-4 py-2 text-sm gap-2'
  };

  return (
    <>
      <button
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          setIsDialogOpen(true);
        }}
        className={`inline-flex items-center font-semibold text-slate-700 bg-white border border-slate-200/90 rounded-xl hover:bg-emerald-50 hover:text-emerald-700 hover:border-emerald-300 transition-all duration-200 shadow-subtle hover:shadow-sm active:scale-95 cursor-pointer ${
          sizeClasses[size] || sizeClasses.sm
        }`}
      >
        <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
        <span>Return</span>
      </button>

      <ConfirmDialog
        isOpen={isDialogOpen}
        variant="success"
        title="Mark Book as Returned"
        message={`Confirm that "${record.book_title}" has been returned by ${record.student_name}? This will record the return date and remove it from active borrowing and overdue lists.`}
        confirmLabel="Confirm Return"
        isLoading={isLoading}
        onConfirm={handleConfirm}
        onCancel={() => setIsDialogOpen(false)}
      />
    </>
  );
};

export default ReturnButton;
