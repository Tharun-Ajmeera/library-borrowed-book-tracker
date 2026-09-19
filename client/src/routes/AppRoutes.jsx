import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

// Auth Pages
import Login from '../pages/Login';
import Register from '../pages/Register';

// Dashboard & Management Pages
import Dashboard from '../pages/Dashboard';
import BorrowedBooks from '../pages/BorrowedBooks';
import AddBorrowing from '../pages/AddBorrowing';
import BorrowingDetails from '../pages/BorrowingDetails';
import Settings from '../pages/Settings';

// Layout & Protected Route Wrapper
import Layout from '../components/Layout';
import ProtectedRoute from '../components/ProtectedRoute';

export const AppRoutes = () => {
  return (
    <Routes>
      {/* Public Authentication Routes */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* Authenticated Staff Routes */}
      <Route
        element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }
      >
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/borrowed-books" element={<BorrowedBooks />} />
        <Route path="/add-borrowing" element={<AddBorrowing />} />
        <Route path="/borrowed-books/:id" element={<BorrowingDetails />} />
        <Route path="/settings" element={<Settings />} />
      </Route>

      {/* Catch-all redirect */}
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
};

export default AppRoutes;
