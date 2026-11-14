import { Navigate, Route, Routes } from 'react-router'
import AppLayout from './components/AppLayout'
import GuestRoute from './components/GuestRoute'
import ProtectedRoute from './components/ProtectedRoute'
import LoginPage from './pages/auth/LoginPage'
import RegisterPage from './pages/auth/RegisterPage'
import CategoriesPage from './pages/categories/CategoriesPage'
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
          <Route path="/transactions" element={<TransactionsPage />} />
          <Route path="/recurring" element={<RecurringPage />} />
          <Route path="/categories" element={<CategoriesPage />} />
        </Route>
      </Route>

      {/* Until there is a dashboard, any other URL goes to the transactions page
          (ProtectedRoute sends it to /login if there is no session) */}
      <Route path="*" element={<Navigate to="/transactions" replace />} />
    </Routes>
  )
}

export default App
