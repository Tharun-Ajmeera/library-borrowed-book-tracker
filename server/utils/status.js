/**
 * Status computation utility according to library business rules:
 *
 * If returned = true (returned_at is set)
 *     → Returned
 * Else if expected_return_date < today
 *     → Overdue
 * Else if expected_return_date is within 2 days (diff <= 2 and >= 0)
 *     → Due Soon
 * Else
 *     → Borrowed
 */

export const computeStatus = (record) => {
  if (!record) return 'Borrowed';
  if (record.returned_at) {
    return 'Returned';
  }

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const expected = new Date(record.expected_return_date);
  expected.setHours(0, 0, 0, 0);

  const diffTime = expected.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays < 0) {
    return 'Overdue';
  }

  if (diffDays <= 2) {
    return 'Due Soon';
  }

  return 'Borrowed';
};

/**
 * Calculates days remaining until expected return date (negative if overdue).
 * @param {string|Date} expectedReturnDate 
 * @returns {number}
 */
export const calculateDaysRemaining = (expectedReturnDate) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const expected = new Date(expectedReturnDate);
  expected.setHours(0, 0, 0, 0);

  const diffTime = expected.getTime() - today.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

/**
 * Enhances a raw borrowing record from PostgreSQL with derived display fields.
 * @param {object} record 
 * @returns {object}
 */
export const enhanceBorrowing = (record) => {
  if (!record) return null;
  const status = computeStatus(record);
  const daysRemaining = calculateDaysRemaining(record.expected_return_date);
  
  return {
    ...record,
    status,
    days_remaining: daysRemaining,
    is_overdue: status === 'Overdue',
    is_returned: Boolean(record.returned_at)
  };
};
