import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from '@/context/AuthContext';
import DashboardLayout from '@/components/DashboardLayout';
import Dashboard from '@/pages/Dashboard';
import Transactions from '@/pages/DataRecord/Transactions';
import Reports from '@/pages/DataSummary/Reports';
import DeletedRecords from '@/pages/DeleteRecord/DeletedRecords';
import Settings from '@/pages/Settings/Settings';
import IESDSummary from '@/pages/DataSummary/IESDSummary';
import Calculation from '@/pages/MoreOption/Calculation';
import DSMDashboard from '@/pages/DataSummary/DSMDashboard';
import Login from '@/pages/Login';
import IncrementRecordPage from '@/pages/DataRecord/IncrementRecord';
import LandingPage from '@/pages/LandingPage/LandingPage';
import EditProfile from '@/pages/DataSummary/EditProfile';
import TMIEPDFFilter from '@/pages/DataSummary/TMIEPDFFilter';
import UploadTransactions from '@/pages/Settings/UploadTransactions';
import TakenSummary from '@/pages/DataSummary/TakenSummary';

import LoanFlow from '@/pages/DataSummary/LoanFlow';

function PrivateRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  
  // Only show spinner if we are explicitly waiting for the first auth check
  if (loading && !user) return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
    </div>
  );
  
  return user ? <>{children}</> : <Navigate to="/login" />;
}

function PublicRoute({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  
  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
    </div>
  );
  
  return user ? <Navigate to="/dashboard" /> : <>{children}</>;
}

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<LandingPage />} />

          <Route path="/login" element={
            <PublicRoute>
              <Login />
            </PublicRoute>
          } />
          
          <Route path="/dashboard" element={
            <PrivateRoute>
              <DashboardLayout>
                <Dashboard />
              </DashboardLayout>
            </PrivateRoute>
          } />
          
          <Route path="/transactions" element={
            <PrivateRoute>
              <DashboardLayout>
                <Transactions />
              </DashboardLayout>
            </PrivateRoute>
          } />

          <Route path="/dsm-dashboard" element={
            <PrivateRoute>
              <DashboardLayout>
                <DSMDashboard />
              </DashboardLayout>
            </PrivateRoute>
          } />
          
          <Route path="/reports" element={
            <PrivateRoute>
              <DashboardLayout>
                <Reports />
              </DashboardLayout>
            </PrivateRoute>
          } />
          
          <Route path="/deleted" element={
            <PrivateRoute>
              <DashboardLayout>
                <DeletedRecords />
              </DashboardLayout>
            </PrivateRoute>
          } />
          
          <Route path="/settings" element={
            <PrivateRoute>
              <DashboardLayout>
                <Settings />
              </DashboardLayout>
            </PrivateRoute>
          } />

          <Route path="/edit-profile" element={
            <PrivateRoute>
              <DashboardLayout>
                <EditProfile />
              </DashboardLayout>
            </PrivateRoute>
          } />

          <Route path="/tmiepdf-filter" element={
            <PrivateRoute>
              <DashboardLayout>
                <TMIEPDFFilter />
              </DashboardLayout>
            </PrivateRoute>
          } />
          
          <Route path="/iesd-summary" element={
            <PrivateRoute>
              <DashboardLayout>
                <IESDSummary />
              </DashboardLayout>
            </PrivateRoute>
          } />

          <Route path="/taken-summary" element={
            <PrivateRoute>
              <DashboardLayout>
                <TakenSummary />
              </DashboardLayout>
            </PrivateRoute>
          } />

          <Route path="/loan-flow" element={
            <PrivateRoute>
              <DashboardLayout>
                <LoanFlow />
              </DashboardLayout>
            </PrivateRoute>
          } />
          
          <Route path="/calculation" element={
            <PrivateRoute>
              <DashboardLayout>
                <Calculation />
              </DashboardLayout>
            </PrivateRoute>
          } />

          <Route path="/increment-record" element={
            <PrivateRoute>
              <DashboardLayout>
                <IncrementRecordPage />
              </DashboardLayout>
            </PrivateRoute>
          } />

          <Route path="/upload-transactions" element={
            <PrivateRoute>
              <DashboardLayout>
                <UploadTransactions />
              </DashboardLayout>
            </PrivateRoute>
          } />
        </Routes>
      </Router>
    </AuthProvider>
  );
}
