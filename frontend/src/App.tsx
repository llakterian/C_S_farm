import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Login from './pages/Login.tsx';
import Dashboard from './pages/Dashboard.tsx';
import Livestock from './pages/Livestock';
import Poultry from './pages/Poultry';
import Profile from './pages/Profile';
import Advances from './pages/Advances';
import Plucking from './pages/Plucking';
import Dairy from './pages/Dairy';
import Labor from './pages/Labor';
import Payroll from './pages/Payroll';
import Bonus from './pages/Bonus';
import Expenses from './pages/Expenses';
import Reports from './pages/Reports';
import Notifications from './pages/Notifications';
import Workers from './pages/Workers';
import Factories from './pages/Factories';
import Avocado from './pages/Avocado';
import ProtectedRoute from './components/ProtectedRoute';
import useAuthStore from './store/authStore';
import { useVoice } from './hooks/useVoice';

function App() {
  const { user } = useAuthStore();
  const { speak } = useVoice();

  React.useEffect(() => {
    if (user) speak('Welcome to C. Sambu Farm Manager. How can I help you today?');
  }, [user, speak]);

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
        path="/profile"
        element={
          <ProtectedRoute>
            <Layout>
              <Profile />
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
        path="/advances"
        element={
          <ProtectedRoute>
            <Layout>
              <Advances />
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
        path="/bonus"
        element={
          <ProtectedRoute>
            <Layout>
              <Bonus />
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
        path="/avocado"
        element={
          <ProtectedRoute>
            <Layout>
              <Avocado />
            </Layout>
          </ProtectedRoute>
        }
      />
      {/* Other routes as before */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;
