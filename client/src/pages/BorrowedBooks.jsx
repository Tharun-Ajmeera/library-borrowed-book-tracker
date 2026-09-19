import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import {
  BookOpen,
  Plus,
  ChevronLeft,
  ChevronRight,
  RotateCcw,
  SlidersHorizontal,
  Download
} from 'lucide-react';
import { getBorrowings, markAsReturned, deleteBorrowing } from '../services/api';
import SearchBar from '../components/SearchBar';
import FilterPanel from '../components/FilterPanel';
import BorrowingTable from '../components/BorrowingTable';
import BorrowingCard from '../components/BorrowingCard';
import EmptyState from '../components/EmptyState';
import LoadingSpinner from '../components/LoadingSpinner';

export const BorrowedBooks = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  // URL state synchronization
  const initialStatus = searchParams.get('status') || 'all';
  const initialSearch = searchParams.get('search') || '';
  const initialCategory = searchParams.get('category') || 'All';
  const initialPage = parseInt(searchParams.get('page') || '1', 10);

  const [records, setRecords] = useState([]);
  const [pagination, setPagination] = useState({
    page: initialPage,
    limit: 15,
    total: 0,
    totalPages: 1
  });

  const [searchQuery, setSearchQuery] = useState(initialSearch);
  const [statusFilter, setStatusFilter] = useState(initialStatus);
  const [categoryFilter, setCategoryFilter] = useState(initialCategory);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchRecords = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const params = {
        page: pagination.page,
        limit: pagination.limit,
        sortBy: 'expected_return_date',
        sortOrder: 'asc'
      };

      if (searchQuery.trim()) params.search = searchQuery.trim();
      if (statusFilter && statusFilter !== 'all') params.status = statusFilter;
      if (categoryFilter && categoryFilter !== 'All') params.category = categoryFilter;
      if (startDate) params.startDate = startDate;
      if (endDate) params.endDate = endDate;

      const res = await getBorrowings(params);
      if (res.success) {
        setRecords(res.data || []);
        setPagination((prev) => ({
          ...prev,
          total: res.pagination?.total || 0,
          totalPages: res.pagination?.totalPages || 1
        }));
      }
    } catch (err) {
      console.error('Failed to load borrowing records:', err);
      setError(err.message || 'Failed to retrieve borrowing records.');
    } finally {
      setIsLoading(false);
    }
  }, [
    pagination.page,
    pagination.limit,
    searchQuery,
    statusFilter,
    categoryFilter,
    startDate,
    endDate
  ]);

  // Update query params in URL
  useEffect(() => {
    const nextParams = {};
    if (searchQuery) nextParams.search = searchQuery;
    if (statusFilter && statusFilter !== 'all') nextParams.status = statusFilter;
    if (categoryFilter && categoryFilter !== 'All') nextParams.category = categoryFilter;
    if (pagination.page > 1) nextParams.page = String(pagination.page);

    setSearchParams(nextParams, { replace: true });
    fetchRecords();
  }, [fetchRecords, searchQuery, statusFilter, categoryFilter, pagination.page, setSearchParams]);

  // Reset all filters
  const handleResetFilters = () => {
    setSearchQuery('');
    setStatusFilter('all');
    setCategoryFilter('All');
    setStartDate('');
    setEndDate('');
    setPagination((prev) => ({ ...prev, page: 1 }));
  };

  // Mark returned handler
  const handleReturnSuccess = async (recordId) => {
    try {
      await markAsReturned(recordId);
      await fetchRecords();
    } catch (err) {
      console.error('Failed to mark as returned:', err);
      alert(err.message || 'Failed to update return status');
    }
  };

  // Delete handler
  const handleDeleteSuccess = async (recordId) => {
    try {
      await deleteBorrowing(recordId);
      await fetchRecords();
    } catch (err) {
      console.error('Failed to delete borrowing:', err);
      alert(err.message || 'Failed to delete record');
    }
  };

  // Export to CSV helper
  const exportToCSV = () => {
    if (records.length === 0) return;
    const headers = ['Student Name', 'Phone', 'Book Title', 'Book ID', 'Category', 'Borrowed Date', 'Expected Return Date', 'Status', 'Returned Date'];
    const rows = records.map((r) => [
      `"${r.student_name.replace(/"/g, '""')}"`,
      `"${r.student_phone}"`,
      `"${r.book_title.replace(/"/g, '""')}"`,
      `"${r.book_id || ''}"`,
      `"${r.category || 'General'}"`,
      `"${r.borrowed_date}"`,
      `"${r.expected_return_date}"`,
      `"${r.status}"`,
      `"${r.returned_at ? new Date(r.returned_at).toLocaleDateString() : ''}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `borrowing_records_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Header & Primary Actions */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between p-6 bg-white/95 backdrop-blur-xs border border-slate-200/80 rounded-3xl shadow-card">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 font-heading">
            Borrowed Books Directory
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Real-time library loan database. Search students, verify due dates, and track returns.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          {records.length > 0 && (
            <button
              type="button"
              onClick={exportToCSV}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-slate-700 bg-white border border-slate-200/90 rounded-xl hover:bg-slate-50 transition-all shadow-subtle hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
              title="Export filtered records to CSV file"
            >
              <Download className="w-3.5 h-3.5 text-slate-500" />
              <span className="hidden sm:inline">Export CSV</span>
            </button>
          )}

          <Link
            to="/add-borrowing"
            className="inline-flex items-center gap-2 px-4 py-2 text-xs font-bold text-white bg-gradient-to-r from-indigo-600 to-violet-600 rounded-xl hover:from-indigo-500 hover:to-violet-500 shadow-md shadow-indigo-600/25 transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            <Plus className="w-4 h-4" />
            <span>New Borrowing</span>
          </Link>
        </div>
      </div>

      {/* Quick Status Filter Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
        {[
          { id: 'all', label: 'All Records' },
          { id: 'borrowed', label: 'Active Loans' },
          { id: 'due_soon', label: 'Due Soon' },
          { id: 'overdue', label: 'Overdue' },
          { id: 'returned', label: 'Returned' }
        ].map((tab) => {
          const isActive = statusFilter === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => {
                setStatusFilter(tab.id);
                setPagination((prev) => ({ ...prev, page: 1 }));
              }}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all duration-200 whitespace-nowrap cursor-pointer ${
                isActive
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/25 scale-[1.02]'
                  : 'bg-white/90 text-slate-600 hover:bg-slate-100 hover:text-slate-900 border border-slate-200/70 shadow-subtle'
              }`}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Search & Filter Controls */}
      <div className="space-y-3">
        <div className="flex items-center gap-2.5">
          <div className="flex-1">
            <SearchBar
              value={searchQuery}
              onChange={(val) => {
                setSearchQuery(val);
                setPagination((prev) => ({ ...prev, page: 1 }));
              }}
              placeholder="Search by student name, book title, phone number, or book ID..."
            />
          </div>
          <button
            type="button"
            onClick={() => setShowFilters(!showFilters)}
            className={`inline-flex items-center gap-2 px-4 py-2.5 text-xs font-bold rounded-xl border transition-all duration-200 shadow-subtle cursor-pointer ${
              showFilters || statusFilter !== 'all' || categoryFilter !== 'All'
                ? 'bg-indigo-50 border-indigo-200 text-indigo-700 shadow-sm'
                : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
            }`}
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span>Filters</span>
          </button>
        </div>

        {/* Expandable Filter Panel */}
        {showFilters && (
          <FilterPanel
            status={statusFilter}
            onStatusChange={(st) => {
              setStatusFilter(st);
              setPagination((prev) => ({ ...prev, page: 1 }));
            }}
            category={categoryFilter}
            onCategoryChange={(cat) => {
              setCategoryFilter(cat);
              setPagination((prev) => ({ ...prev, page: 1 }));
            }}
            startDate={startDate}
            onStartDateChange={(d) => {
              setStartDate(d);
              setPagination((prev) => ({ ...prev, page: 1 }));
            }}
            endDate={endDate}
            onEndDateChange={(d) => {
              setEndDate(d);
              setPagination((prev) => ({ ...prev, page: 1 }));
            }}
            onReset={handleResetFilters}
          />
        )}
      </div>

      {/* Content State: Loading, Error, Empty, or Table */}
      {isLoading ? (
        <div className="flex items-center justify-center py-20 bg-white border border-slate-200 rounded-2xl shadow-xs">
          <LoadingSpinner message="Searching borrowing records..." />
        </div>
      ) : error ? (
        <div className="p-8 text-center bg-white border border-rose-200 rounded-2xl">
          <p className="text-sm font-semibold text-rose-600">{error}</p>
          <button
            onClick={fetchRecords}
            className="inline-flex items-center gap-2 px-4 py-2 mt-3 text-xs font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Try Again
          </button>
        </div>
      ) : records.length === 0 ? (
        <EmptyState
          title="No borrowing records found"
          description={
            searchQuery || statusFilter !== 'all' || categoryFilter !== 'All'
              ? 'Try changing your search keywords or clearing active filters.'
              : 'Start by adding your first student borrowing record.'
          }
          actionLabel="Add Borrowing Record"
          actionTo="/add-borrowing"
        />
      ) : (
        <>
          {/* Desktop Table View */}
          <div className="hidden md:block">
            <BorrowingTable
              records={records}
              onReturnSuccess={handleReturnSuccess}
              onDeleteSuccess={handleDeleteSuccess}
            />
          </div>

          {/* Mobile Cards View */}
          <div className="grid grid-cols-1 gap-3 md:hidden">
            {records.map((rec) => (
              <BorrowingCard
                key={rec.id}
                record={rec}
                onReturnSuccess={handleReturnSuccess}
                onDeleteSuccess={handleDeleteSuccess}
              />
            ))}
          </div>

          {/* Pagination Bar */}
          <div className="flex items-center justify-between px-4 py-3 bg-white border rounded-2xl border-slate-200/80 shadow-xs text-xs text-slate-500">
            <div>
              Showing <span className="font-semibold text-slate-800">{records.length}</span> of{' '}
              <span className="font-semibold text-slate-800">{pagination.total}</span> records
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                disabled={pagination.page <= 1}
                onClick={() => setPagination((prev) => ({ ...prev, page: prev.page - 1 }))}
                className="inline-flex items-center gap-1 px-3 py-1.5 font-medium bg-slate-50 border border-slate-200 rounded-lg hover:bg-slate-100 disabled:opacity-40 disabled:pointer-events-none transition-colors"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
                Previous
              </button>

              <span className="px-2 font-medium">
                Page {pagination.page} of {pagination.totalPages}
              </span>

              <button
                type="button"
                disabled={pagination.page >= pagination.totalPages}
                onClick={() => setPagination((prev) => ({ ...prev, page: prev.page + 1 }))}
                className="inline-flex items-center gap-1 px-3 py-1.5 font-medium bg-slate-50 border border-slate-200 rounded-lg hover:bg-slate-100 disabled:opacity-40 disabled:pointer-events-none transition-colors"
              >
                Next
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default BorrowedBooks;
