import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from './components/ProtectedRoute';
import DashboardLayout from './components/DashboardLayout';
import LoginPage from './pages/LoginPage';
import DashboardOverview from './pages/DashboardOverview';
import SettingsPage from './pages/SettingsPage';
import CustomersPage from './pages/CustomersPage';
import MachinesPage from './pages/MachinesPage';
import RentalsPage from './pages/RentalsPage';
import FinancePage from './pages/FinancePage';
import DocumentsPage from './pages/DocumentsPage';
import ReportsPage from './pages/ReportsPage';

function App() {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/login" element={<LoginPage />} />

      {/* Protected Dashboard Shell */}
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<DashboardOverview />} />
        <Route
          path="settings"
          element={
            <ProtectedRoute allowedRoles={['Admin']}>
              <SettingsPage />
            </ProtectedRoute>
          }
        />
        <Route path="customers" element={<CustomersPage />} />
        <Route path="machines" element={<MachinesPage />} />
        <Route path="rentals" element={<RentalsPage />} />
        <Route path="finance" element={<FinancePage />} />
        <Route path="documents" element={<DocumentsPage />} />
        <Route path="reports" element={<ReportsPage />} />
      </Route>

      {/* Catch-all redirect */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
