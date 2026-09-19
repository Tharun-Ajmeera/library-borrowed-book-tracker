import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, BookPlus, CheckCircle2, AlertCircle, Info } from 'lucide-react';
import { createBorrowing } from '../services/api';
import BorrowingForm from '../components/BorrowingForm';

export const AddBorrowing = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (formData) => {
    try {
      setIsLoading(true);
      setError(null);
      const res = await createBorrowing(formData);
      if (res.success) {
        setSuccess(true);
        setTimeout(() => {
          navigate('/borrowed-books');
        }, 1200);
      }
    } catch (err) {
      console.error('Failed to create borrowing record:', err);
      setError(err.message || 'Failed to save borrowing record. Please check the inputs.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header with Back Navigation */}
      <div>
        <Link
          to="/borrowed-books"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-indigo-600 transition-colors mb-2"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Borrowed Books</span>
        </Link>
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-xl">
            <BookPlus className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">
              Record New Book Borrowing
            </h1>
            <p className="text-xs text-slate-500">
              Log a student borrowing entry with contact information and expected return schedule.
            </p>
          </div>
        </div>
      </div>

      {/* Status Notifications */}
      {error && (
        <div className="flex items-start gap-3 p-4 bg-rose-50 border border-rose-200 rounded-2xl text-rose-700 text-sm">
          <AlertCircle className="w-5 h-5 shrink-0 text-rose-600 mt-0.5" />
          <div className="flex-1">{error}</div>
        </div>
      )}

      {success && (
        <div className="flex items-start gap-3 p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-emerald-800 text-sm animate-in fade-in">
          <CheckCircle2 className="w-5 h-5 shrink-0 text-emerald-600 mt-0.5" />
          <div className="flex-1 font-medium">
            Borrowing record created successfully! Redirecting to library directory...
          </div>
        </div>
      )}

      {/* Advisory Information Banner */}
      <div className="flex items-start gap-3 p-4 bg-indigo-50/50 border border-indigo-100 rounded-2xl text-xs text-indigo-900">
        <Info className="w-4 h-4 text-indigo-600 shrink-0 mt-0.5" />
        <div className="leading-relaxed">
          <span className="font-semibold">Automatic Overdue Tracking:</span> You do not need to manually mark records as overdue. The system automatically computes overdue states daily when the expected return date elapses without a return date being marked.
        </div>
      </div>

      {/* Form */}
      <BorrowingForm
        onSubmit={handleSubmit}
        isLoading={isLoading}
        submitLabel="Record Borrowing"
      />
    </div>
  );
};

export default AddBorrowing;
