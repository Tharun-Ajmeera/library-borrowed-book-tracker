import { z } from 'zod';

export const ALLOWED_CATEGORIES = [
  'Programming',
  'Computer Science',
  'Mathematics',
  'Science',
  'Literature',
  'Business',
  'General',
  'Other'
];

// Regex allowing optional leading +, digits, hyphens, spaces, and parentheses
const phoneRegex = /^[+]?[(]?[0-9]{1,4}[)]?[-\s./0-9]{7,16}$/;

/**
 * Zod validation schema for creating a borrowing record
 */
export const borrowingSchema = z.object({
  student_name: z
    .string({ required_error: 'Student name is required' })
    .trim()
    .min(2, 'Student name must be at least 2 characters')
    .max(100, 'Student name cannot exceed 100 characters'),

  student_phone: z
    .string({ required_error: 'Student phone number is required' })
    .trim()
    .min(10, 'Phone number must be at least 10 digits')
    .max(20, 'Phone number cannot exceed 20 characters')
    .regex(phoneRegex, 'Invalid phone number format. Example: +1234567890 or 9876543210'),

  book_title: z
    .string({ required_error: 'Book title is required' })
    .trim()
    .min(1, 'Book title is required')
    .max(200, 'Book title cannot exceed 200 characters'),

  book_id: z
    .string()
    .trim()
    .max(50, 'Book ID cannot exceed 50 characters')
    .optional()
    .nullable()
    .transform(val => (val === '' ? null : val)),

  category: z
    .string()
    .trim()
    .max(50, 'Category cannot exceed 50 characters')
    .optional()
    .nullable()
    .transform(val => (val === '' ? null : val)),

  borrowed_date: z
    .string({ required_error: 'Borrowed date is required' })
    .refine((date) => !isNaN(Date.parse(date)), {
      message: 'Borrowed date must be a valid date'
    }),

  expected_return_date: z
    .string({ required_error: 'Expected return date is required' })
    .refine((date) => !isNaN(Date.parse(date)), {
      message: 'Expected return date must be a valid date'
    }),

  notes: z
    .string()
    .trim()
    .max(500, 'Notes cannot exceed 500 characters')
    .optional()
    .nullable()
    .transform(val => (val === '' ? null : val))
}).refine((data) => {
  const borrowed = new Date(data.borrowed_date);
  const expected = new Date(data.expected_return_date);
  // Compare calendar dates (midnight)
  borrowed.setHours(0, 0, 0, 0);
  expected.setHours(0, 0, 0, 0);
  return expected >= borrowed;
}, {
  message: 'Expected return date must not be earlier than the borrowed date',
  path: ['expected_return_date']
});

/**
 * Zod validation schema for updating an existing record
 */
export const updateBorrowingSchema = z.object({
  student_name: z
    .string()
    .trim()
    .min(2, 'Student name must be at least 2 characters')
    .max(100, 'Student name cannot exceed 100 characters')
    .optional(),

  student_phone: z
    .string()
    .trim()
    .min(10, 'Phone number must be at least 10 digits')
    .max(20, 'Phone number cannot exceed 20 characters')
    .regex(phoneRegex, 'Invalid phone number format')
    .optional(),

  book_title: z
    .string()
    .trim()
    .min(1, 'Book title cannot be empty')
    .max(200, 'Book title cannot exceed 200 characters')
    .optional(),

  book_id: z
    .string()
    .trim()
    .max(50, 'Book ID cannot exceed 50 characters')
    .optional()
    .nullable()
    .transform(val => (val === '' ? null : val)),

  category: z
    .string()
    .trim()
    .max(50, 'Category cannot exceed 50 characters')
    .optional()
    .nullable()
    .transform(val => (val === '' ? null : val)),

  borrowed_date: z
    .string()
    .refine((date) => !isNaN(Date.parse(date)), {
      message: 'Borrowed date must be a valid date'
    })
    .optional(),

  expected_return_date: z
    .string()
    .refine((date) => !isNaN(Date.parse(date)), {
      message: 'Expected return date must be a valid date'
    })
    .optional(),

  notes: z
    .string()
    .trim()
    .max(500, 'Notes cannot exceed 500 characters')
    .optional()
    .nullable()
    .transform(val => (val === '' ? null : val))
}).refine((data) => {
  if (data.borrowed_date && data.expected_return_date) {
    const borrowed = new Date(data.borrowed_date);
    const expected = new Date(data.expected_return_date);
    borrowed.setHours(0, 0, 0, 0);
    expected.setHours(0, 0, 0, 0);
    return expected >= borrowed;
  }
  return true;
}, {
  message: 'Expected return date must not be earlier than the borrowed date',
  path: ['expected_return_date']
});

/**
 * Zod validation schema for querying borrowings
 */
export const queryBorrowingsSchema = z.object({
  search: z.string().optional(),
  status: z.enum(['all', 'borrowed', 'due_soon', 'overdue', 'returned', 'Borrowed', 'Due Soon', 'Overdue', 'Returned']).optional(),
  category: z.string().optional(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  sortBy: z.enum(['expected_return_date', 'borrowed_date', 'student_name', 'book_title', 'created_at']).default('expected_return_date'),
  sortOrder: z.enum(['asc', 'desc']).default('asc')
});
