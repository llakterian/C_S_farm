import { Routes, Route, Navigate } from 'react-router-dom'
import Layout from './components/Layout'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Plucking from './pages/Plucking'
import Payroll from './pages/Payroll'
import Fertilizer from './pages/Fertilizer'
import Workers from './pages/Workers'
import Factories from './pages/Factories'
import Dairy from './pages/Dairy'
import Avocado from './pages/Avocado'
import Labor from './pages/Labor'
import Reports from './pages/Reports'
import Expenses from './pages/Expenses'
import Notifications from './pages/Notifications'
import Livestock from './pages/Livestock'
import Poultry from './pages/Poultry'
import Farm from './pages/Farm'
import Tasks from './pages/Tasks'
import Profile from './pages/Profile'
import ProtectedRoute from './components/ProtectedRoute'

function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <Layout>
              <Dashboard />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/plucking"
        element={
          <ProtectedRoute>
            <Layout>
              <Plucking />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/payroll"
        element={
          <ProtectedRoute>
            <Layout>
              <Payroll />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/fertilizer"
        element={
          <ProtectedRoute>
            <Layout>
              <Fertilizer />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/dairy"
        element={
          <ProtectedRoute>
            <Layout>
              <Dairy />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/livestock"
        element={
          <ProtectedRoute>
            <Layout>
              <Livestock />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/poultry"
        element={
          <ProtectedRoute>
            <Layout>
              <Poultry />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/avocado"
        element={
          <ProtectedRoute>
            <Layout>
              <Avocado />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/labor"
        element={
          <ProtectedRoute>
            <Layout>
              <Labor />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/reports"
        element={
          <ProtectedRoute>
            <Layout>
              <Reports />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/expenses"
        element={
          <ProtectedRoute>
            <Layout>
              <Expenses />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/notifications"
        element={
          <ProtectedRoute>
            <Layout>
              <Notifications />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/workers"
        element={
          <ProtectedRoute>
            <Layout>
              <Workers />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/factories"
        element={
          <ProtectedRoute>
            <Layout>
              <Factories />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/farm"
        element={
          <ProtectedRoute>
            <Layout>
              <Farm />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/tasks"
        element={
          <ProtectedRoute>
            <Layout>
              <Tasks />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/profile"
        element={
          <ProtectedRoute>
            <Layout>
              <Profile />
            </Layout>
          </ProtectedRoute>
        }
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default App
