import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  BookOpen,
  Clock,
  AlertTriangle,
  CheckCircle2,
  Plus,
  ArrowRight,
  TrendingUp,
  RotateCcw,
  Sparkles
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Cell
} from 'recharts';
import { getDashboardStats, markAsReturned } from '../services/api';
import { useAuth } from '../context/AuthContext';
import StatCard from '../components/StatCard';
import StatusBadge from '../components/StatusBadge';
import ReminderButton from '../components/ReminderButton';
import ReturnButton from '../components/ReturnButton';
import LoadingSpinner from '../components/LoadingSpinner';

const BAR_COLORS = [
  '#6366f1',
  '#8b5cf6',
  '#06b6d4',
  '#10b981',
  '#f59e0b',
  '#ec4899',
  '#3b82f6',
  '#84cc16'
];

export const Dashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const staffName = user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Staff';

  const todayFormatted = new Date().toLocaleDateString(undefined, {
    weekday: 'long',
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });

  const fetchStats = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const res = await getDashboardStats();
      if (res.success) {
        setStats(res.data);
      }
    } catch (err) {
      console.error('Failed to load dashboard statistics:', err);
      setError(err.message || 'Could not load dashboard statistics.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const handleReturnSuccess = async (recordId) => {
    try {
      await markAsReturned(recordId);
      // Refresh statistics after marking a book as returned
      await fetchStats();
    } catch (err) {
      console.error('Return error:', err);
    }
  };

  if (isLoading && !stats) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <LoadingSpinner message="Loading library analytics..." />
      </div>
    );
  }

  if (error && !stats) {
    return (
      <div className="p-8 text-center bg-white border border-rose-200 rounded-2xl">
        <AlertTriangle className="w-10 h-10 mx-auto text-rose-500 mb-3" />
        <h3 className="text-lg font-bold text-slate-900">Dashboard Unavailable</h3>
        <p className="mt-1 text-sm text-slate-500">{error}</p>
        <div className="flex items-center justify-center gap-3 mt-4">
          <button
            onClick={fetchStats}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-700 bg-slate-100 rounded-lg hover:bg-slate-200 transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
            Retry Connection
          </button>
          <Link
            to="/login"
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors"
          >
            Log In Again
          </Link>
        </div>
      </div>
    );
  }

  const summary = stats?.summary || {
    totalBorrowed: 0,
    dueSoon: 0,
    overdue: 0,
    returned: 0,
    totalAllTime: 0
  };

  const chartData = stats?.categoryDistribution || [];
  const urgentOverdue = stats?.urgentOverdue || [];
  const recentBorrowings = stats?.recentBorrowings || [];

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Top Welcome Banner */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between p-6 bg-gradient-to-r from-white via-indigo-50/20 to-white border border-slate-200/80 rounded-3xl shadow-card">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 font-bold text-[11px] border border-indigo-200/60">
              {todayFormatted}
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 font-heading">
            Welcome back, <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-violet-600">{staffName}</span>!
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Here is your live library overview for student loans, return schedules, and overdue follow-ups.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to="/borrowed-books"
            className="inline-flex items-center gap-2 px-4 py-2.5 text-xs font-bold text-slate-700 bg-white border border-slate-200/90 rounded-xl hover:bg-slate-50 transition-all shadow-subtle hover:scale-[1.02] active:scale-[0.98]"
          >
            <BookOpen className="w-4 h-4 text-slate-500" />
            <span>All Books</span>
          </Link>

          <Link
            to="/add-borrowing"
            className="inline-flex items-center gap-2 px-4 py-2.5 text-xs font-bold text-white bg-gradient-to-r from-indigo-600 to-violet-600 rounded-xl hover:from-indigo-500 hover:to-violet-500 shadow-md shadow-indigo-600/25 transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            <Plus className="w-4 h-4" />
            <span>Record New Loan</span>
          </Link>
        </div>
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Active Borrowed"
          value={summary.totalBorrowed}
          subtitle="Currently with students"
          icon={BookOpen}
          color="indigo"
          to="/borrowed-books?status=borrowed"
          isLoading={isLoading}
        />
        <StatCard
          title="Due Soon"
          value={summary.dueSoon}
          subtitle="Due within 48 hours"
          icon={Clock}
          color="amber"
          to="/borrowed-books?status=due_soon"
          isLoading={isLoading}
        />
        <StatCard
          title="Overdue Books"
          value={summary.overdue}
          subtitle="Requires staff reminder"
          icon={AlertTriangle}
          color="rose"
          to="/borrowed-books?status=overdue"
          isLoading={isLoading}
        />
        <StatCard
          title="Returned Books"
          value={summary.returned}
          subtitle="Completed loans"
          icon={CheckCircle2}
          color="emerald"
          to="/borrowed-books?status=returned"
          isLoading={isLoading}
        />
      </div>

      {/* Urgent Overdue Attention Section (If any) */}
      {urgentOverdue.length > 0 && (
        <div className="p-6 bg-gradient-to-br from-rose-50/90 to-red-50/40 border border-rose-200/90 rounded-3xl shadow-card">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2.5 text-rose-900 font-bold text-base font-heading">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-rose-600"></span>
              </span>
              <span>Action Required: {urgentOverdue.length} Overdue {urgentOverdue.length === 1 ? 'Book' : 'Books'}</span>
            </div>
            <Link
              to="/borrowed-books?status=overdue"
              className="text-xs font-bold text-rose-700 hover:text-rose-900 flex items-center gap-1.5 transition-colors"
            >
              <span>View all overdue</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {urgentOverdue.map((item) => (
              <div
                key={item.id}
                className="p-4 bg-white/95 backdrop-blur-xs border border-rose-200/80 rounded-2xl shadow-subtle hover:shadow-card transition-all duration-200 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <span className="font-bold text-slate-900 text-sm line-clamp-1">
                      {item.book_title}
                    </span>
                    <StatusBadge status="Overdue" daysRemaining={item.days_remaining} size="sm" />
                  </div>
                  <div className="mt-2 text-xs text-slate-600">
                    Student: <span className="font-semibold text-slate-800">{item.student_name}</span>
                  </div>
                  <div className="text-xs text-slate-500 font-mono mt-0.5">
                    Phone: {item.student_phone}
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                  <ReminderButton record={item} size="sm" variant="solid" />
                  <ReturnButton
                    record={item}
                    onReturnSuccess={handleReturnSuccess}
                    size="sm"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Analytics & Category Distribution */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Books by Category Chart */}
        <div className="p-6 bg-white/95 backdrop-blur-xs border rounded-3xl border-slate-200/80 shadow-card lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2 font-heading">
                <TrendingUp className="w-4 h-4 text-indigo-600" />
                <span>Book Borrowings by Category</span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">All-time record distribution across categories</p>
            </div>
            <span className="px-2.5 py-1 rounded-full bg-slate-100 text-slate-600 font-bold text-[11px]">
              {chartData.length} {chartData.length === 1 ? 'Category' : 'Categories'}
            </span>
          </div>

          {chartData.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-center text-slate-400">
              <div className="p-4 rounded-2xl bg-indigo-50 text-indigo-500 mb-3">
                <BookOpen className="w-8 h-8 stroke-[1.5]" />
              </div>
              <p className="text-sm font-semibold text-slate-600">No categorical data available yet.</p>
              <p className="text-xs text-slate-400 mt-1">Add borrowing records to see visualization.</p>
            </div>
          ) : (
            <div className="h-64 w-full pt-2">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                  <XAxis
                    dataKey="name"
                    tick={{ fontSize: 11, fill: '#64748b', fontWeight: 500 }}
                    interval={0}
                    angle={-15}
                    textAnchor="end"
                  />
                  <YAxis tick={{ fontSize: 11, fill: '#64748b' }} allowDecimals={false} />
                  <Tooltip
                    cursor={{ fill: 'rgba(99, 102, 241, 0.05)' }}
                    contentStyle={{
                      backgroundColor: 'rgba(15, 23, 42, 0.9)',
                      backdropFilter: 'blur(8px)',
                      borderRadius: '16px',
                      color: '#fff',
                      border: 'none',
                      fontSize: '12px',
                      boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.3)'
                    }}
                  />
                  <Bar dataKey="count" radius={[8, 8, 0, 0]}>
                    {chartData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={BAR_COLORS[index % BAR_COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>

        {/* Quick Summary Card */}
        <div className="p-6 bg-white/95 backdrop-blur-xs border rounded-3xl border-slate-200/80 shadow-card flex flex-col justify-between">
          <div>
            <h3 className="text-base font-extrabold text-slate-900 mb-4 flex items-center gap-2 font-heading">
              <Sparkles className="w-4 h-4 text-indigo-600" />
              <span>Library Status Digest</span>
            </h3>

            <div className="space-y-3 text-sm">
              <div className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 border border-slate-100">
                <span className="text-slate-600 font-medium">Total All-Time Records</span>
                <span className="font-extrabold text-slate-900 font-heading text-base">{summary.totalAllTime}</span>
              </div>
              <div className="flex items-center justify-between p-3.5 rounded-2xl bg-emerald-50/70 border border-emerald-100">
                <span className="text-emerald-800 font-medium">Return Rate</span>
                <span className="font-extrabold text-emerald-700 font-heading text-base">
                  {summary.totalAllTime > 0
                    ? `${Math.round((summary.returned / summary.totalAllTime) * 100)}%`
                    : '0%'}
                </span>
              </div>
              <div className="flex items-center justify-between p-3.5 rounded-2xl bg-rose-50/70 border border-rose-100">
                <span className="text-rose-800 font-medium">Overdue Rate</span>
                <span className="font-extrabold text-rose-700 font-heading text-base">
                  {summary.totalBorrowed > 0
                    ? `${Math.round((summary.overdue / summary.totalBorrowed) * 100)}%`
                    : '0%'}
                </span>
              </div>
            </div>
          </div>

          <div className="pt-4 mt-4 border-t border-slate-100">
            <Link
              to="/borrowed-books"
              className="w-full inline-flex items-center justify-center gap-2 py-3 px-4 text-xs font-bold text-indigo-600 bg-indigo-50/80 hover:bg-indigo-100 rounded-xl transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              <span>Explore All Borrowing Records</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>

      {/* Recent Borrowings Table */}
      <div className="p-6 bg-white/95 backdrop-blur-xs border rounded-3xl border-slate-200/80 shadow-card">
        <div className="flex items-center justify-between mb-5">
          <div>
            <h3 className="text-base font-extrabold text-slate-900 font-heading">Recent Borrowings</h3>
            <p className="text-xs text-slate-500">Latest loans recorded by library staff</p>
          </div>
          <Link
            to="/borrowed-books"
            className="text-xs font-bold text-indigo-600 hover:text-indigo-700 flex items-center gap-1.5 transition-colors"
          >
            <span>View Full Directory</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {recentBorrowings.length === 0 ? (
          <div className="p-10 text-center text-slate-400">
            <p className="text-sm font-semibold text-slate-600">No borrowing records registered yet.</p>
            <Link
              to="/add-borrowing"
              className="inline-flex items-center gap-1.5 mt-2 text-xs font-bold text-indigo-600 hover:underline"
            >
              <Plus className="w-3.5 h-3.5" />
              Add First Borrowing Record
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-slate-100 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  <th className="pb-3.5 px-3">Student</th>
                  <th className="pb-3.5 px-3">Book Title</th>
                  <th className="pb-3.5 px-3">Category</th>
                  <th className="pb-3.5 px-3">Due Date</th>
                  <th className="pb-3.5 px-3">Status</th>
                  <th className="pb-3.5 px-3 text-right">Quick Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {recentBorrowings.map((rec) => {
                  const initial = (rec.student_name || 'S').charAt(0).toUpperCase();
                  return (
                    <tr key={rec.id} className="group hover:bg-indigo-50/20 transition-colors">
                      <td className="py-3 px-3">
                        <div className="flex items-center gap-2.5">
                          <div className="w-7 h-7 rounded-lg bg-indigo-50 text-indigo-700 font-bold text-xs flex items-center justify-center shrink-0">
                            {initial}
                          </div>
                          <span className="font-bold text-slate-900">{rec.student_name}</span>
                        </div>
                      </td>
                      <td className="py-3 px-3 text-slate-800 font-semibold max-w-xs truncate">{rec.book_title}</td>
                      <td className="py-3 px-3">
                        <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 text-xs font-medium">
                          {rec.category || 'General'}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-xs text-slate-600 font-medium">
                        {new Date(rec.expected_return_date).toLocaleDateString(undefined, {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric'
                        })}
                      </td>
                      <td className="py-3 px-3">
                        <StatusBadge status={rec.status} daysRemaining={rec.days_remaining} size="sm" />
                      </td>
                      <td className="py-3 px-3 text-right">
                        {!rec.returned_at ? (
                          <ReturnButton
                            record={rec}
                            onReturnSuccess={handleReturnSuccess}
                            size="sm"
                          />
                        ) : (
                          <span className="text-xs font-semibold text-emerald-600">Returned</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
