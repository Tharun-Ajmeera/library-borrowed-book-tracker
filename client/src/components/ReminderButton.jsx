import React from 'react';
import { MessageCircle } from 'lucide-react';

/**
 * Formats a phone number for the wa.me link.
 * Strips non-digit characters except leading '+'.
 */
export const formatWhatsAppPhone = (phone) => {
  if (!phone) return '';
  // Remove spaces, hyphens, parentheses, etc.
  let cleaned = phone.replace(/[^\d+]/g, '');
  if (cleaned.startsWith('+')) {
    cleaned = cleaned.substring(1);
  }
  return cleaned;
};

/**
 * Builds the standard library reminder message
 */
export const generateReminderMessage = (record) => {
  const student = record.student_name || 'Student';
  const book = record.book_title || 'your borrowed book';
  const dueDate = record.expected_return_date
    ? new Date(record.expected_return_date).toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      })
    : 'the due date';

  return `Hello ${student}, this is a reminder from the library. The book "${book}" was due for return on ${dueDate}. Please return it as soon as possible. Thank you.`;
};

export const ReminderButton = ({ record, size = 'sm', variant = 'outline' }) => {
  if (!record || !record.student_phone) return null;

  const handleClick = (e) => {
    e.stopPropagation();
    const cleanPhone = formatWhatsAppPhone(record.student_phone);
    const message = generateReminderMessage(record);
    const url = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const isOutline = variant === 'outline';

  const sizeClasses = {
    sm: 'px-3 py-1.5 text-xs gap-1.5',
    md: 'px-4 py-2 text-sm gap-2',
    lg: 'px-5 py-2.5 text-base gap-2.5'
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      title={`Send WhatsApp reminder to ${record.student_name} (${record.student_phone})`}
      className={`inline-flex items-center font-semibold rounded-xl transition-all duration-200 active:scale-95 cursor-pointer ${
        sizeClasses[size] || sizeClasses.sm
      } ${
        isOutline
          ? 'text-emerald-700 bg-emerald-50/80 border border-emerald-200/80 hover:bg-emerald-600 hover:text-white hover:border-emerald-600 hover:shadow-md hover:shadow-emerald-600/20'
          : 'text-white bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 shadow-md shadow-emerald-600/20 hover:shadow-emerald-600/30'
      }`}
    >
      <MessageCircle className="w-3.5 h-3.5 shrink-0" />
      <span>WhatsApp</span>
    </button>
  );
};

export default ReminderButton;
