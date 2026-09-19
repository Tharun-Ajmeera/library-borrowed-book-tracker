import React, { useState, useEffect } from 'react';
import { Calendar, User, Phone, BookOpen, Bookmark, FileText, AlertCircle } from 'lucide-react';

const CATEGORIES = [
  'Programming',
  'Computer Science',
  'Mathematics',
  'Science',
  'Literature',
  'Business',
  'General',
  'Other'
];

export const BorrowingForm = ({
  initialData = null,
  onSubmit,
  isLoading = false,
  submitLabel = 'Save Borrowing Record'
}) => {
  // Default dates: today and 14 days from today
  const getTodayStr = () => new Date().toISOString().split('T')[0];
  const getDefaultReturnStr = (days = 14) => {
    const d = new Date();
    d.setDate(d.getDate() + days);
    return d.toISOString().split('T')[0];
  };

  const [formData, setFormData] = useState({
    student_name: '',
    student_phone: '',
    book_title: '',
    book_id: '',
    category: 'General',
    borrowed_date: getTodayStr(),
    expected_return_date: getDefaultReturnStr(14),
    notes: ''
  });

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (initialData) {
      setFormData({
        student_name: initialData.student_name || '',
        student_phone: initialData.student_phone || '',
        book_title: initialData.book_title || '',
        book_id: initialData.book_id || '',
        category: initialData.category || 'General',
        borrowed_date: initialData.borrowed_date ? initialData.borrowed_date.split('T')[0] : getTodayStr(),
        expected_return_date: initialData.expected_return_date ? initialData.expected_return_date.split('T')[0] : getDefaultReturnStr(14),
        notes: initialData.notes || ''
      });
    }
  }, [initialData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    // Clear field error on change
    if (errors[name]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[name];
        return next;
      });
    }
  };

  // Quick preset for loan duration
  const applyDurationPreset = (days) => {
    const borrowed = formData.borrowed_date ? new Date(formData.borrowed_date) : new Date();
    borrowed.setDate(borrowed.getDate() + days);
    setFormData((prev) => ({
      ...prev,
      expected_return_date: borrowed.toISOString().split('T')[0]
    }));
  };

  const validate = () => {
    const newErrors = {};

    if (!formData.student_name || formData.student_name.trim().length < 2) {
      newErrors.student_name = 'Student name must be at least 2 characters';
    } else if (formData.student_name.length > 100) {
      newErrors.student_name = 'Student name cannot exceed 100 characters';
    }

    const phoneRegex = /^[+]?[(]?[0-9]{1,4}[)]?[-\s./0-9]{7,16}$/;
    if (!formData.student_phone || !phoneRegex.test(formData.student_phone.trim())) {
      newErrors.student_phone = 'Please provide a valid phone number (e.g. +1234567890 or 9876543210)';
    }

    if (!formData.book_title || formData.book_title.trim().length < 1) {
      newErrors.book_title = 'Book title is required';
    } else if (formData.book_title.length > 200) {
      newErrors.book_title = 'Book title cannot exceed 200 characters';
    }

    if (formData.book_id && formData.book_id.length > 50) {
      newErrors.book_id = 'Book ID cannot exceed 50 characters';
    }

    if (!formData.borrowed_date) {
      newErrors.borrowed_date = 'Borrowed date is required';
    }

    if (!formData.expected_return_date) {
      newErrors.expected_return_date = 'Expected return date is required';
    } else if (formData.borrowed_date && formData.expected_return_date < formData.borrowed_date) {
      newErrors.expected_return_date = 'Expected return date cannot be earlier than borrowed date';
    }

    if (formData.notes && formData.notes.length > 500) {
      newErrors.notes = 'Notes cannot exceed 500 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Student Details Section */}
      <div className="p-6 bg-white border rounded-2xl border-slate-200/80 shadow-xs space-y-4">
        <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
          <User className="w-5 h-5 text-indigo-600" />
          <h3 className="text-base font-semibold text-slate-800">Student Details</h3>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {/* Student Name */}
          <div>
            <label className="block mb-1 text-xs font-semibold text-slate-700">
              Student Full Name <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <input
                type="text"
                name="student_name"
                value={formData.student_name}
                onChange={handleChange}
                placeholder="e.g. Alex Johnson"
                className={`w-full px-3.5 py-2.5 text-sm bg-slate-50 border rounded-xl transition-all focus:bg-white focus:outline-hidden focus:ring-2 ${
                  errors.student_name
                    ? 'border-rose-300 focus:ring-rose-500/20 focus:border-rose-500'
                    : 'border-slate-200 focus:ring-indigo-500/20 focus:border-indigo-600'
                }`}
              />
            </div>
            {errors.student_name && (
              <p className="mt-1 text-xs text-rose-600 flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5" />
                {errors.student_name}
              </p>
            )}
          </div>

          {/* Student Phone */}
          <div>
            <label className="block mb-1 text-xs font-semibold text-slate-700">
              Student WhatsApp / Phone Number <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <input
                type="tel"
                name="student_phone"
                value={formData.student_phone}
                onChange={handleChange}
                placeholder="e.g. +1 555-0199 or 9876543210"
                className={`w-full px-3.5 py-2.5 text-sm bg-slate-50 border rounded-xl transition-all focus:bg-white focus:outline-hidden focus:ring-2 font-mono ${
                  errors.student_phone
                    ? 'border-rose-300 focus:ring-rose-500/20 focus:border-rose-500'
                    : 'border-slate-200 focus:ring-indigo-500/20 focus:border-indigo-600'
                }`}
              />
            </div>
            {errors.student_phone ? (
              <p className="mt-1 text-xs text-rose-600 flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5" />
                {errors.student_phone}
              </p>
            ) : (
              <p className="mt-1 text-[11px] text-slate-400">
                Used for sending WhatsApp reminders if the book becomes overdue.
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Book Details Section */}
      <div className="p-6 bg-white border rounded-2xl border-slate-200/80 shadow-xs space-y-4">
        <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
          <BookOpen className="w-5 h-5 text-indigo-600" />
          <h3 className="text-base font-semibold text-slate-800">Book Information</h3>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {/* Book Title */}
          <div className="sm:col-span-2">
            <label className="block mb-1 text-xs font-semibold text-slate-700">
              Book Title <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              name="book_title"
              value={formData.book_title}
              onChange={handleChange}
              placeholder="e.g. Introduction to Algorithms (3rd Edition)"
              className={`w-full px-3.5 py-2.5 text-sm bg-slate-50 border rounded-xl transition-all focus:bg-white focus:outline-hidden focus:ring-2 ${
                errors.book_title
                  ? 'border-rose-300 focus:ring-rose-500/20 focus:border-rose-500'
                  : 'border-slate-200 focus:ring-indigo-500/20 focus:border-indigo-600'
              }`}
            />
            {errors.book_title && (
              <p className="mt-1 text-xs text-rose-600 flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5" />
                {errors.book_title}
              </p>
            )}
          </div>

          {/* Book ID / Accession Number */}
          <div>
            <label className="block mb-1 text-xs font-semibold text-slate-700">
              Book ID / Accession # (Optional)
            </label>
            <input
              type="text"
              name="book_id"
              value={formData.book_id}
              onChange={handleChange}
              placeholder="e.g. BK-2024-042"
              className="w-full px-3.5 py-2.5 text-sm bg-slate-50 border border-slate-200 rounded-xl transition-all focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600 font-mono"
            />
          </div>

          {/* Category */}
          <div className="sm:col-span-3">
            <label className="block mb-1 text-xs font-semibold text-slate-700">
              Category
            </label>
            <div className="flex flex-wrap gap-2 pt-1">
              {CATEGORIES.map((cat) => {
                const isSelected = formData.category === cat;
                return (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setFormData((prev) => ({ ...prev, category: cat }))}
                    className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${
                      isSelected
                        ? 'bg-indigo-600 text-white shadow-xs'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {cat}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Loan Schedule Section */}
      <div className="p-6 bg-white border rounded-2xl border-slate-200/80 shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-indigo-600" />
            <h3 className="text-base font-semibold text-slate-800">Borrowing Schedule</h3>
          </div>

          {/* Duration Quick Presets */}
          <div className="flex items-center gap-1.5 text-xs">
            <span className="text-slate-400 font-medium">Presets:</span>
            <button
              type="button"
              onClick={() => applyDurationPreset(7)}
              className="px-2 py-1 text-slate-600 hover:bg-slate-100 rounded-md font-medium"
            >
              +7d
            </button>
            <button
              type="button"
              onClick={() => applyDurationPreset(14)}
              className="px-2 py-1 text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-md font-medium"
            >
              +14d
            </button>
            <button
              type="button"
              onClick={() => applyDurationPreset(30)}
              className="px-2 py-1 text-slate-600 hover:bg-slate-100 rounded-md font-medium"
            >
              +30d
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {/* Borrowed Date */}
          <div>
            <label className="block mb-1 text-xs font-semibold text-slate-700">
              Borrowed Date <span className="text-rose-500">*</span>
            </label>
            <input
              type="date"
              name="borrowed_date"
              value={formData.borrowed_date}
              onChange={handleChange}
              className={`w-full px-3.5 py-2.5 text-sm bg-slate-50 border rounded-xl transition-all focus:bg-white focus:outline-hidden focus:ring-2 ${
                errors.borrowed_date
                  ? 'border-rose-300 focus:ring-rose-500/20 focus:border-rose-500'
                  : 'border-slate-200 focus:ring-indigo-500/20 focus:border-indigo-600'
              }`}
            />
            {errors.borrowed_date && (
              <p className="mt-1 text-xs text-rose-600 flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5" />
                {errors.borrowed_date}
              </p>
            )}
          </div>

          {/* Expected Return Date */}
          <div>
            <label className="block mb-1 text-xs font-semibold text-slate-700">
              Expected Return Date <span className="text-rose-500">*</span>
            </label>
            <input
              type="date"
              name="expected_return_date"
              value={formData.expected_return_date}
              onChange={handleChange}
              className={`w-full px-3.5 py-2.5 text-sm bg-slate-50 border rounded-xl transition-all focus:bg-white focus:outline-hidden focus:ring-2 ${
                errors.expected_return_date
                  ? 'border-rose-300 focus:ring-rose-500/20 focus:border-rose-500'
                  : 'border-slate-200 focus:ring-indigo-500/20 focus:border-indigo-600'
              }`}
            />
            {errors.expected_return_date && (
              <p className="mt-1 text-xs text-rose-600 flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5" />
                {errors.expected_return_date}
              </p>
            )}
          </div>
        </div>

        {/* Optional Notes */}
        <div>
          <label className="block mb-1 text-xs font-semibold text-slate-700">
            Notes / Comments (Optional)
          </label>
          <textarea
            name="notes"
            value={formData.notes}
            onChange={handleChange}
            rows={2}
            placeholder="e.g. Student requested an extra week for final semester project research..."
            className="w-full px-3.5 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl transition-all focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
          />
        </div>
      </div>

      {/* Form Submission */}
      <div className="flex items-center justify-end gap-3 pt-2">
        <button
          type="submit"
          disabled={isLoading}
          className="px-6 py-3 text-sm font-semibold text-white bg-indigo-600 rounded-xl hover:bg-indigo-700 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 disabled:opacity-50 transition-colors shadow-md shadow-indigo-600/10 flex items-center gap-2"
        >
          {isLoading ? (
            <>
              <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
              <span>Saving Record...</span>
            </>
          ) : (
            <span>{submitLabel}</span>
          )}
        </button>
      </div>
    </form>
  );
};

export default BorrowingForm;
