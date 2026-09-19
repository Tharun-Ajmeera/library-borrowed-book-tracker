import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  ArrowLeft,
  BookOpen,
  User,
  Phone,
  Calendar,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Edit,
  Trash2,
  Check,
  FileText,
  Tag
} from 'lucide-react';
import {
  getBorrowingById,
  updateBorrowing,
  markAsReturned,
  deleteBorrowing
} from '../services/api';
import StatusBadge from '../components/StatusBadge';
import ReminderButton from '../components/ReminderButton';
import ReturnButton from '../components/ReturnButton';
import ConfirmDialog from '../components/ConfirmDialog';
import LoadingSpinner from '../components/LoadingSpinner';
import BorrowingForm from '../components/BorrowingForm';

export const BorrowingDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [record, setRecord] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState(null);

  const fetchRecord = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const res = await getBorrowingById(id);
      if (res.success) {
        setRecord(res.data);
      }
    } catch (err) {
      console.error('Failed to load borrowing details:', err);
      setError(err.message || 'Failed to load borrowing record details.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRecord();
  }, [id]);

  const handleUpdate = async (formData) => {
    try {
      setIsUpdating(true);
      setError(null);
      const res = await updateBorrowing(id, formData);
      if (res.success) {
        setRecord(res.data);
        setIsEditing(false);
      }
    } catch (err) {
      console.error('Failed to update borrowing:', err);
      setError(err.message || 'Failed to update record.');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleReturnSuccess = async () => {
    try {
      const res = await markAsReturned(id);
      if (res.success) {
        setRecord(res.data);
      }
    } catch (err) {
      console.error('Return error:', err);
      alert(err.message || 'Failed to mark book as returned');
    }
  };

  const handleDelete = async () => {
    try {
      setIsDeleting(true);
      await deleteBorrowing(id);
      navigate('/borrowed-books');
    } catch (err) {
      console.error('Delete error:', err);
      alert(err.message || 'Failed to delete record');
    } finally {
      setIsDeleting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-24">
        <LoadingSpinner message="Loading borrowing record details..." />
      </div>
    );
  }

  if (error || !record) {
    return (
      <div className="max-w-xl mx-auto p-8 text-center bg-white border border-rose-200 rounded-2xl">
        <AlertTriangle className="w-10 h-10 mx-auto text-rose-500 mb-3" />
        <h3 className="text-lg font-bold text-slate-900">Record Not Found</h3>
        <p className="mt-1 text-sm text-slate-500">{error || 'This borrowing entry does not exist or access was denied.'}</p>
        <Link
          to="/borrowed-books"
          className="inline-flex items-center gap-2 px-4 py-2 mt-4 text-xs font-semibold text-white bg-indigo-600 rounded-lg hover:bg-indigo-700"
        >
          <ArrowLeft className="w-4 h-4" />
          Return to Borrowed Books
        </Link>
      </div>
    );
  }

  const isOverdue = record.status === 'Overdue';
  const isReturned = Boolean(record.returned_at);

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Back Navigation */}
      <div className="flex items-center justify-between">
        <Link
          to="/borrowed-books"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-indigo-600 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Borrowed Books</span>
        </Link>

        <div className="flex items-center gap-2">
          {!isReturned && !isEditing && (
            <button
              type="button"
              onClick={() => setIsEditing(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors shadow-xs"
            >
              <Edit className="w-3.5 h-3.5 text-slate-500" />
              <span>Edit Details</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => setIsDeleteDialogOpen(true)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-rose-700 bg-rose-50 border border-rose-200 rounded-xl hover:bg-rose-100 transition-colors shadow-xs"
          >
            <Trash2 className="w-3.5 h-3.5 text-rose-600" />
            <span>Delete</span>
          </button>
        </div>
      </div>

      {isEditing ? (
        <div className="space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-slate-200">
            <h2 className="text-lg font-bold text-slate-900">Edit Borrowing Information</h2>
            <button
              type="button"
              onClick={() => setIsEditing(false)}
              className="text-xs text-slate-500 hover:text-slate-800"
            >
              Cancel Editing
            </button>
          </div>
          <BorrowingForm
            initialData={record}
            onSubmit={handleUpdate}
            isLoading={isUpdating}
            submitLabel="Update Record"
          />
        </div>
      ) : (
        <div className="space-y-6">
          {/* Main Record Header Card */}
          <div className="p-6 bg-white border rounded-3xl border-slate-200/80 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-4 border-b border-slate-100">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-mono font-medium text-slate-400">
                    RECORD ID: {record.id.slice(0, 8)}
                  </span>
                  <StatusBadge
                    status={record.status}
                    daysRemaining={record.days_remaining}
                    size="md"
                  />
                </div>
                <h1 className="text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
                  <BookOpen className="w-6 h-6 text-indigo-600 shrink-0" />
                  <span>{record.book_title}</span>
                </h1>
                {record.book_id && (
                  <p className="mt-1 text-xs text-slate-400 font-mono">
                    Book Identifier / Accession #: {record.book_id}
                  </p>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 shrink-0">
                {isOverdue && (
                  <ReminderButton record={record} size="md" variant="filled" />
                )}
                {!isReturned && (
                  <ReturnButton
                    record={record}
                    onReturnSuccess={handleReturnSuccess}
                    size="md"
                  />
                )}
              </div>
            </div>

            {/* Student & Loan Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
              {/* Student Information */}
              <div className="p-4 bg-slate-50/80 rounded-2xl border border-slate-100 space-y-3">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-500">
                  <User className="w-4 h-4 text-indigo-600" />
                  <span>Borrower Information</span>
                </div>
                <div>
                  <div className="text-sm font-semibold text-slate-900">
                    {record.student_name}
                  </div>
                  <div className="mt-2 flex items-center justify-between text-xs">
                    <span className="text-slate-500">Phone / WhatsApp:</span>
                    <a
                      href={`tel:${record.student_phone}`}
                      className="font-mono font-semibold text-indigo-600 hover:underline flex items-center gap-1"
                    >
                      <Phone className="w-3.5 h-3.5" />
                      {record.student_phone}
                    </a>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-200/60">
                  <ReminderButton record={record} size="sm" variant="outline" />
                </div>
              </div>

              {/* Schedule Information */}
              <div className="p-4 bg-slate-50/80 rounded-2xl border border-slate-100 space-y-3">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-500">
                  <Calendar className="w-4 h-4 text-indigo-600" />
                  <span>Loan Schedule</span>
                </div>

                <div className="space-y-2 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Borrowed On:</span>
                    <span className="font-medium text-slate-800">
                      {new Date(record.borrowed_date).toLocaleDateString(undefined, {
                        dateStyle: 'full'
                      })}
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-slate-500">Expected Due Date:</span>
                    <span
                      className={`font-semibold ${
                        isOverdue ? 'text-rose-600' : 'text-slate-800'
                      }`}
                    >
                      {new Date(record.expected_return_date).toLocaleDateString(undefined, {
                        dateStyle: 'full'
                      })}
                    </span>
                  </div>

                  <div className="flex items-center justify-between pt-1 border-t border-slate-200/60">
                    <span className="text-slate-500">Return Status:</span>
                    {record.returned_at ? (
                      <span className="text-emerald-700 font-semibold flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Returned on{' '}
                        {new Date(record.returned_at).toLocaleDateString(undefined, {
                          dateStyle: 'medium'
                        })}
                      </span>
                    ) : isOverdue ? (
                      <span className="text-rose-600 font-semibold flex items-center gap-1">
                        <AlertTriangle className="w-3.5 h-3.5" />
                        Overdue by {Math.abs(record.days_remaining)} days
                      </span>
                    ) : (
                      <span className="text-indigo-600 font-medium">
                        Active loan ({record.days_remaining} days remaining)
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Additional Metadata: Category & Notes */}
            <div className="pt-2 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="text-xs space-y-1">
                <span className="text-slate-400 font-medium flex items-center gap-1">
                  <Tag className="w-3.5 h-3.5 text-slate-400" />
                  Category:
                </span>
                <span className="inline-block px-3 py-1 bg-slate-100 text-slate-700 rounded-lg font-medium">
                  {record.category || 'General'}
                </span>
              </div>

              <div className="text-xs space-y-1">
                <span className="text-slate-400 font-medium flex items-center gap-1">
                  <FileText className="w-3.5 h-3.5 text-slate-400" />
                  Staff Notes:
                </span>
                <p className="p-3 bg-slate-50 rounded-xl text-slate-600 italic">
                  {record.notes || 'No additional notes provided for this borrowing record.'}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={isDeleteDialogOpen}
        variant="danger"
        title="Delete Borrowing Record"
        message={`Are you sure you want to permanently remove the record for "${record?.book_title}"?`}
        confirmLabel="Delete Permanently"
        isLoading={isDeleting}
        onConfirm={handleDelete}
        onCancel={() => setIsDeleteDialogOpen(false)}
      />
    </div>
  );
};

export default BorrowingDetails;
