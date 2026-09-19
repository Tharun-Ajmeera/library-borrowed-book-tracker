import { Router } from 'express';
import {
  getBorrowings,
  getBorrowingById,
  createBorrowing,
  updateBorrowing,
  markAsReturned,
  deleteBorrowing
} from '../controllers/borrowingController.js';
import { requireAuth } from '../middleware/authMiddleware.js';
import { validateBody, validateQuery } from '../middleware/validateMiddleware.js';
import {
  borrowingSchema,
  updateBorrowingSchema,
  queryBorrowingsSchema
} from '../validators/schemas.js';

const router = Router();

// All borrowing routes require verified staff authentication
router.use(requireAuth);

// GET /api/borrowings - Search, filter, paginate borrowing records
router.get('/', validateQuery(queryBorrowingsSchema), getBorrowings);

// POST /api/borrowings - Add a new borrowing record
router.post('/', validateBody(borrowingSchema), createBorrowing);

// GET /api/borrowings/:id - Get single borrowing record details
router.get('/:id', getBorrowingById);

// PUT /api/borrowings/:id - Update borrowing record
router.put('/:id', validateBody(updateBorrowingSchema), updateBorrowing);

// PUT /api/borrowings/:id/return - Mark book as returned
router.put('/:id/return', markAsReturned);

// DELETE /api/borrowings/:id - Delete borrowing record
router.delete('/:id', deleteBorrowing);

export default router;
