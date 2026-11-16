import { Navigate, Route, Routes } from 'react-router'
import AppLayout from './components/AppLayout'
import GuestRoute from './components/GuestRoute'
import ProtectedRoute from './components/ProtectedRoute'
import BudgetsPage from './pages/budgets/BudgetsPage'
import LoginPage from './pages/auth/LoginPage'
import RegisterPage from './pages/auth/RegisterPage'
import CategoriesPage from './pages/categories/CategoriesPage'
import DashboardPage from './pages/dashboard/DashboardPage'
import RecurringPage from './pages/recurring/RecurringPage'
import TransactionsPage from './pages/transactions/TransactionsPage'

function App() {
  return (
    <Routes>
      {/* Only for users who are NOT logged in */}
      <Route element={<GuestRoute />}>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
      </Route>

      {/* Only for logged-in users. Routes nested in AppLayout are rendered inside its <Outlet /> */}
      <Route element={<ProtectedRoute />}>
        <Route element={<AppLayout />}>
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/transactions" element={<TransactionsPage />} />
          <Route path="/recurring" element={<RecurringPage />} />
          <Route path="/categories" element={<CategoriesPage />} />
          <Route path="/budgets" element={<BudgetsPage />} />
        </Route>
      </Route>

      {/* Any other URL (including "/") goes to the dashboard
          (ProtectedRoute sends it to /login if there is no session) */}
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  )
}

export default App
