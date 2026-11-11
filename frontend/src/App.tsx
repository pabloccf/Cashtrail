import { Navigate, Route, Routes } from 'react-router'
import AppLayout from './components/AppLayout'
import TransactionsPage from './pages/transactions/TransactionsPage'

function App() {
  return (
    <Routes>
      {/* Routes nested here are rendered inside the layout's <Outlet /> */}
      <Route element={<AppLayout />}>
        <Route path="/transactions" element={<TransactionsPage />} />
      </Route>

      {/* Until there is a dashboard, any other URL goes to the transactions page */}
      <Route path="*" element={<Navigate to="/transactions" replace />} />
    </Routes>
  )
}

export default App
