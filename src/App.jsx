import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { AuthProvider } from './context/AuthContext'
import ProtectedRoute from './components/common/ProtectedRoute'

// Pages
import LoginPage from './pages/auth/LoginPage'
import DashboardPage from './pages/dashboard/DashboardPage'
import KYCListPage from './pages/kyc/KYCListPage'
import KYCDetailPage from './pages/kyc/KYCDetailPage'
import LoanListPage from './pages/loans/LoanListPage'
import LoanDetailPage from './pages/loans/LoanDetailPage'
import WithdrawalListPage from './pages/withdrawals/WithdrawalListPage'
import UserListPage from './pages/users/UserListPage'
import UserDetailPage from './pages/users/UserDetailPage'

// Layout
import Layout from './components/layout/Layout'

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<LoginPage />} />

          {/* Protected Routes */}
          <Route element={<ProtectedRoute><Layout /></ProtectedRoute>}>
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
            <Route path="/dashboard" element={<DashboardPage />} />
            
            {/* KYC */}
            <Route path="/kyc" element={<KYCListPage />} />
            <Route path="/kyc/:userId" element={<KYCDetailPage />} />
            
            {/* Loans */}
            <Route path="/loans" element={<LoanListPage />} />
            <Route path="/loans/:loanId" element={<LoanDetailPage />} />
            
            {/* Withdrawals */}
            <Route path="/withdrawals" element={<WithdrawalListPage />} />
            
            {/* Users */}
            <Route path="/users" element={<UserListPage />} />
            <Route path="/users/:userId" element={<UserDetailPage />} />
          </Route>

          {/* 404 */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
        <Toaster position="top-right" />
      </BrowserRouter>
    </AuthProvider>
  )
}

export default App
