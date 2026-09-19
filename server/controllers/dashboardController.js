import { enhanceBorrowing } from '../utils/status.js';

/**
 * GET /api/dashboard/stats
 * Aggregate borrowing metrics for the authenticated staff member's library:
 * - Total Active Borrowed
 * - Overdue
 * - Due Soon
 * - Returned
 * - Total All-Time
 * - Category Breakdown (for Recharts)
 * - Urgent Overdue List (for quick WhatsApp actions)
 * - Recent Activity
 */
export const getStats = async (req, res, next) => {
  try {
    const supabase = req.supabase;
    const staffId = req.user.id;

    // Fetch all records for the staff member to derive accurate analytics
    const { data: records, error } = await supabase
      .from('borrowing_records')
      .select('*')
      .eq('staff_id', staffId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching stats from Supabase:', error);
      const isMissingTable = error.message?.includes('borrowing_records');
      return res.status(500).json({
        success: false,
        error: isMissingTable
          ? 'The "borrowing_records" table has not been created yet in Supabase. Please run supabase/schema.sql in your Supabase SQL Editor.'
          : (error.message || 'Failed to retrieve dashboard statistics')
      });
    }

    const enhanced = (records || []).map(enhanceBorrowing);

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let totalBorrowed = 0;
    let dueSoonCount = 0;
    let overdueCount = 0;
    let returnedCount = 0;

    const categoryMap = {};
    const urgentOverdue = [];

    enhanced.forEach((rec) => {
      if (rec.status === 'Returned') {
        returnedCount++;
      } else {
        totalBorrowed++;
        if (rec.status === 'Overdue') {
          overdueCount++;
          urgentOverdue.push(rec);
        } else if (rec.status === 'Due Soon') {
          dueSoonCount++;
        }
      }

      // Tally categories
      const cat = rec.category || 'Uncategorized';
      categoryMap[cat] = (categoryMap[cat] || 0) + 1;
    });

    const categoryDistribution = Object.entries(categoryMap).map(([name, count]) => ({
      name,
      count
    }));

    // Recent 5 borrowings
    const recentBorrowings = enhanced.slice(0, 5);

    return res.status(200).json({
      success: true,
      data: {
        summary: {
          totalBorrowed,     // currently active borrowed books
          overdue: overdueCount,
          dueSoon: dueSoonCount,
          returned: returnedCount,
          totalAllTime: enhanced.length
        },
        categoryDistribution,
        urgentOverdue: urgentOverdue.slice(0, 5), // top 5 urgent for reminder quick-actions
        recentBorrowings
      }
    });
  } catch (err) {
    next(err);
  }
};
