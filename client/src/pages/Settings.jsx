import React, { useState } from 'react';
import {
  User,
  Shield,
  Building,
  Calendar,
  MessageCircle,
  Database,
  Check,
  LogOut,
  Save
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const Settings = () => {
  const { user, signOut } = useAuth();

  // Local settings persisted in localStorage
  const [libraryName, setLibraryName] = useState(
    localStorage.getItem('lib_name') || 'Central University Library'
  );
  const [defaultDuration, setDefaultDuration] = useState(
    localStorage.getItem('lib_loan_duration') || '14'
  );
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSaveSettings = (e) => {
    e.preventDefault();
    localStorage.setItem('lib_name', libraryName);
    localStorage.setItem('lib_loan_duration', defaultDuration);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  const reminderTemplate = `Hello [Student Name], this is a reminder from ${libraryName}. The book "[Book Title]" was due for return on [Expected Return Date]. Please return it as soon as possible. Thank you.`;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">
          Library & Staff Settings
        </h1>
        <p className="mt-1 text-xs text-slate-500">
          Manage your staff account, institutional parameters, and default notification templates.
        </p>
      </div>

      {savedSuccess && (
        <div className="flex items-center gap-2 p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-semibold animate-in fade-in">
          <Check className="w-4 h-4 text-emerald-600" />
          <span>Settings saved successfully!</span>
        </div>
      )}

      {/* Staff Profile Card */}
      <div className="p-6 bg-white border rounded-3xl border-slate-200/80 shadow-xs space-y-4">
        <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
          <User className="w-5 h-5 text-indigo-600" />
          <h2 className="text-base font-bold text-slate-900">Staff Account</h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div className="p-3 bg-slate-50 rounded-xl space-y-1">
            <span className="text-slate-400 font-medium">Email Address:</span>
            <div className="font-semibold text-slate-800">{user?.email || 'N/A'}</div>
          </div>

          <div className="p-3 bg-slate-50 rounded-xl space-y-1">
            <span className="text-slate-400 font-medium">Staff User ID (UUID):</span>
            <div className="font-mono text-slate-600 truncate">{user?.id || 'N/A'}</div>
          </div>

          <div className="p-3 bg-slate-50 rounded-xl space-y-1">
            <span className="text-slate-400 font-medium">Access Isolation:</span>
            <div className="flex items-center gap-1.5 text-emerald-700 font-semibold">
              <Shield className="w-3.5 h-3.5" />
              <span>Row Level Security (RLS) Active</span>
            </div>
          </div>

          <div className="p-3 bg-slate-50 rounded-xl space-y-1">
            <span className="text-slate-400 font-medium">Account Role:</span>
            <div className="font-semibold text-slate-800 uppercase">{user?.role || 'Authenticated Staff'}</div>
          </div>
        </div>
      </div>

      {/* Library Preferences Form */}
      <form onSubmit={handleSaveSettings} className="p-6 bg-white border rounded-3xl border-slate-200/80 shadow-xs space-y-5">
        <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
          <Building className="w-5 h-5 text-indigo-600" />
          <h2 className="text-base font-bold text-slate-900">Institution & Loan Rules</h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Library Name */}
          <div>
            <label className="block mb-1 text-xs font-semibold text-slate-700">
              Library / Department Name
            </label>
            <input
              type="text"
              value={libraryName}
              onChange={(e) => setLibraryName(e.target.value)}
              className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
            />
          </div>

          {/* Default Loan Duration */}
          <div>
            <label className="block mb-1 text-xs font-semibold text-slate-700">
              Default Loan Duration (Days)
            </label>
            <select
              value={defaultDuration}
              onChange={(e) => setDefaultDuration(e.target.value)}
              className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl text-slate-900 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-600"
            >
              <option value="7">7 Days (1 Week)</option>
              <option value="14">14 Days (2 Weeks - Standard)</option>
              <option value="21">21 Days (3 Weeks)</option>
              <option value="30">30 Days (1 Month)</option>
            </select>
          </div>
        </div>

        {/* Reminder Message Template Preview */}
        <div>
          <label className="block mb-1 text-xs font-semibold text-slate-700 flex items-center gap-1.5">
            <MessageCircle className="w-4 h-4 text-emerald-600" />
            WhatsApp Notification Template Preview
          </label>
          <div className="p-3.5 bg-slate-50 border border-slate-200/80 rounded-xl text-xs text-slate-600 font-mono leading-relaxed">
            {reminderTemplate}
          </div>
          <p className="mt-1 text-[11px] text-slate-400">
            Parameters in brackets will be automatically substituted when generating the student's reminder link.
          </p>
        </div>

        <div className="flex justify-end pt-2">
          <button
            type="submit"
            className="inline-flex items-center gap-2 px-5 py-2.5 text-xs font-semibold text-white bg-indigo-600 rounded-xl hover:bg-indigo-700 shadow-sm transition-colors"
          >
            <Save className="w-4 h-4" />
            <span>Save Preferences</span>
          </button>
        </div>
      </form>

      {/* Database Connection Info */}
      <div className="p-6 bg-white border rounded-3xl border-slate-200/80 shadow-xs space-y-3">
        <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
          <Database className="w-5 h-5 text-indigo-600" />
          <h2 className="text-base font-bold text-slate-900">Database & Security Architecture</h2>
        </div>

        <p className="text-xs text-slate-600 leading-relaxed">
          The system communicates via an Express.js backend to Supabase PostgreSQL. Every SQL query strictly binds to the authenticated staff member's session token, and database operations are validated via server-side Zod schemas.
        </p>

        <div className="pt-2 flex items-center justify-between">
          <span className="text-xs font-mono text-slate-400">
            Backend API: /api/borrowings, /api/dashboard
          </span>
          <button
            type="button"
            onClick={() => signOut()}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Settings;
