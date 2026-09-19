import { enhanceBorrowing, computeStatus } from '../utils/status.js';

/**
 * GET /api/borrowings
 * Retrieve borrowing records with search, status filtering, category filtering, date ranges, and pagination.
 */
export const getBorrowings = async (req, res, next) => {
  try {
    const supabase = req.supabase;
    const staffId = req.user.id;
    const {
      search,
      status,
      category,
      startDate,
      endDate,
      page = 1,
      limit = 20,
      sortBy = 'expected_return_date',
      sortOrder = 'asc'
    } = req.query;

    const pageNum = parseInt(page, 10) || 1;
    const limitNum = parseInt(limit, 10) || 20;
    const offset = (pageNum - 1) * limitNum;

    // Start building query. Always filter by staff_id for defense-in-depth data isolation
    let query = supabase
      .from('borrowing_records')
      .select('*', { count: 'exact' })
      .eq('staff_id', staffId);

    // 1. Search filter across student name, phone, book title, and book ID
    if (search && search.trim() !== '') {
      const sanitizedSearch = search.trim();
      query = query.or(
        `student_name.ilike.%${sanitizedSearch}%,student_phone.ilike.%${sanitizedSearch}%,book_title.ilike.%${sanitizedSearch}%,book_id.ilike.%${sanitizedSearch}%`
      );
    }

    // 2. Category filter
    if (category && category !== 'all' && category !== '') {
      query = query.eq('category', category);
    }

    // 3. Date range filter (by borrowed_date)
    if (startDate) {
      query = query.gte('borrowed_date', startDate);
    }
    if (endDate) {
      query = query.lte('borrowed_date', endDate);
    }

    // 4. Status filter logic
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];

    const twoDaysAhead = new Date();
    twoDaysAhead.setDate(twoDaysAhead.getDate() + 2);
    const twoDaysAheadStr = twoDaysAhead.toISOString().split('T')[0];

    const normalizedStatus = (status || '').toLowerCase().replace(/\s+/g, '_');

    if (normalizedStatus === 'returned') {
      query = query.not('returned_at', 'is', null);
    } else if (normalizedStatus === 'overdue') {
      query = query
        .is('returned_at', null)
        .lt('expected_return_date', todayStr);
    } else if (normalizedStatus === 'due_soon') {
      query = query
        .is('returned_at', null)
        .gte('expected_return_date', todayStr)
        .lte('expected_return_date', twoDaysAheadStr);
    } else if (normalizedStatus === 'borrowed') {
      // Active borrowed: not returned yet
      query = query.is('returned_at', null);
    }

    // 5. Sorting
    const validSortFields = ['expected_return_date', 'borrowed_date', 'student_name', 'book_title', 'created_at'];
    const orderField = validSortFields.includes(sortBy) ? sortBy : 'expected_return_date';
    const isAscending = sortOrder.toLowerCase() === 'asc';

    query = query.order(orderField, { ascending: isAscending });

    // 6. Pagination
    query = query.range(offset, offset + limitNum - 1);

    const { data, error, count } = await query;

    if (error) {
      console.error('Supabase query error in getBorrowings:', error);
      return res.status(500).json({
        success: false,
        error: 'Failed to retrieve borrowing records from database'
      });
    }

    const enhancedRecords = (data || []).map(enhanceBorrowing);

    return res.status(200).json({
      success: true,
      data: enhancedRecords,
      pagination: {
        total: count || 0,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil((count || 0) / limitNum)
      }
    });
  } catch (err) {
    next(err);
  }
};

/**
 * GET /api/borrowings/:id
 * Retrieve a single borrowing record by ID.
 */
export const getBorrowingById = async (req, res, next) => {
  try {
    const supabase = req.supabase;
    const staffId = req.user.id;
    const { id } = req.params;

    const { data, error } = await supabase
      .from('borrowing_records')
      .select('*')
      .eq('id', id)
      .eq('staff_id', staffId)
      .single();

    if (error || !data) {
      return res.status(404).json({
        success: false,
        error: 'Borrowing record not found or access denied'
      });
    }

    return res.status(200).json({
      success: true,
      data: enhanceBorrowing(data)
    });
  } catch (err) {
    next(err);
  }
};

/**
 * POST /api/borrowings
 * Create a new borrowing record. Always assigns staff_id from authenticated token.
 */
export const createBorrowing = async (req, res, next) => {
  try {
    const supabase = req.supabase;
    const staffId = req.user.id;
    const payload = req.validatedBody;

    // Never trust staff_id from client payload
    const recordToInsert = {
      staff_id: staffId,
      student_name: payload.student_name,
      student_phone: payload.student_phone,
      book_title: payload.book_title,
      book_id: payload.book_id || null,
      category: payload.category || null,
      borrowed_date: payload.borrowed_date,
      expected_return_date: payload.expected_return_date,
      notes: payload.notes || null,
      returned_at: null
    };

    const { data, error } = await supabase
      .from('borrowing_records')
      .insert([recordToInsert])
      .select()
      .single();

    if (error) {
      console.error('Supabase error inserting borrowing:', error);
      return res.status(500).json({
        success: false,
        error: error.message || 'Failed to create borrowing record'
      });
    }

    return res.status(201).json({
      success: true,
      message: 'Borrowing record created successfully',
      data: enhanceBorrowing(data)
    });
  } catch (err) {
    next(err);
  }
};

/**
 * PUT /api/borrowings/:id
 * Update an existing borrowing record.
 */
export const updateBorrowing = async (req, res, next) => {
  try {
    const supabase = req.supabase;
    const staffId = req.user.id;
    const { id } = req.params;
    const payload = req.validatedBody;

    // Verify record exists and belongs to staff
    const { data: existing, error: findError } = await supabase
      .from('borrowing_records')
      .select('*')
      .eq('id', id)
      .eq('staff_id', staffId)
      .single();

    if (findError || !existing) {
      return res.status(404).json({
        success: false,
        error: 'Borrowing record not found or access denied'
      });
    }

    // Merge updates
    const updates = {
      ...(payload.student_name !== undefined && { student_name: payload.student_name }),
      ...(payload.student_phone !== undefined && { student_phone: payload.student_phone }),
      ...(payload.book_title !== undefined && { book_title: payload.book_title }),
      ...(payload.book_id !== undefined && { book_id: payload.book_id }),
      ...(payload.category !== undefined && { category: payload.category }),
      ...(payload.borrowed_date !== undefined && { borrowed_date: payload.borrowed_date }),
      ...(payload.expected_return_date !== undefined && { expected_return_date: payload.expected_return_date }),
      ...(payload.notes !== undefined && { notes: payload.notes }),
      updated_at: new Date().toISOString()
    };

    const { data, error } = await supabase
      .from('borrowing_records')
      .update(updates)
      .eq('id', id)
      .eq('staff_id', staffId)
      .select()
      .single();

    if (error) {
      console.error('Supabase error updating borrowing:', error);
      return res.status(500).json({
        success: false,
        error: error.message || 'Failed to update borrowing record'
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Borrowing record updated successfully',
      data: enhanceBorrowing(data)
    });
  } catch (err) {
    next(err);
  }
};

/**
 * PUT /api/borrowings/:id/return
 * Mark book as returned. Sets returned_at to current timestamp.
 */
export const markAsReturned = async (req, res, next) => {
  try {
    const supabase = req.supabase;
    const staffId = req.user.id;
    const { id } = req.params;

    // Check existing record
    const { data: existing, error: findError } = await supabase
      .from('borrowing_records')
      .select('*')
      .eq('id', id)
      .eq('staff_id', staffId)
      .single();

    if (findError || !existing) {
      return res.status(404).json({
        success: false,
        error: 'Borrowing record not found or access denied'
      });
    }

    if (existing.returned_at) {
      return res.status(400).json({
        success: false,
        error: 'Book is already marked as returned',
        data: enhanceBorrowing(existing)
      });
    }

    const returnTimestamp = new Date().toISOString();

    const { data, error } = await supabase
      .from('borrowing_records')
      .update({
        returned_at: returnTimestamp,
        updated_at: returnTimestamp
      })
      .eq('id', id)
      .eq('staff_id', staffId)
      .select()
      .single();

    if (error) {
      console.error('Supabase error marking as returned:', error);
      return res.status(500).json({
        success: false,
        error: error.message || 'Failed to mark book as returned'
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Book marked as returned successfully',
      data: enhanceBorrowing(data)
    });
  } catch (err) {
    next(err);
  }
};

/**
 * DELETE /api/borrowings/:id
 * Delete a borrowing record.
 */
export const deleteBorrowing = async (req, res, next) => {
  try {
    const supabase = req.supabase;
    const staffId = req.user.id;
    const { id } = req.params;

    const { error } = await supabase
      .from('borrowing_records')
      .delete()
      .eq('id', id)
      .eq('staff_id', staffId);

    if (error) {
      console.error('Supabase error deleting borrowing:', error);
      return res.status(500).json({
        success: false,
        error: error.message || 'Failed to delete borrowing record'
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Borrowing record deleted successfully'
    });
  } catch (err) {
    next(err);
  }
};
