import { lazy } from 'react'
import { createBrowserRouter } from 'react-router-dom'
import AboutPage from '../pages/AboutPage'
import BookingConfirmPage from '../pages/BookingConfirmPage'
import HomePage from '../pages/HomePage'
import LoginPage from '../pages/LoginPage'
import NotFoundPage from '../pages/NotFoundPage'
import RegisterPage from '../pages/RegisterPage'
import RouteDetailsPage from '../pages/RouteDetailsPage'
import SearchPage from '../pages/SearchPage'
import Layout from './Layout'
import { ProtectedRoute } from './ProtectedRoute'

// დაცული გვერდები იტვირთება საჭიროებისამებრ (code splitting) — სტუმარს არ სჭირდება მათი კოდი
const DashboardPage = lazy(() => import('../pages/DashboardPage'))
const RouteEditorPage = lazy(() => import('../pages/RouteEditorPage'))
const SettingsPage = lazy(() => import('../pages/SettingsPage'))

export const router = createBrowserRouter([
  {
    path: '/',
    element: <Layout />,
    children: [
      // საჯარო (guest)
      { index: true, element: <HomePage /> },
      { path: 'about', element: <AboutPage /> },
      { path: 'search', element: <SearchPage /> },
      { path: 'routes/:id', element: <RouteDetailsPage /> },
      { path: 'booking/:code', element: <BookingConfirmPage /> },
      { path: 'login', element: <LoginPage /> },
      { path: 'register', element: <RegisterPage /> },

      // დაცული (provider / company)
      {
        path: 'dashboard',
        element: (
          <ProtectedRoute permission="dashboard:view">
            <DashboardPage />
          </ProtectedRoute>
        ),
      },
      {
        path: 'dashboard/routes/new',
        element: (
          <ProtectedRoute permission="routes:manage">
            <RouteEditorPage />
          </ProtectedRoute>
        ),
      },
      {
        path: 'dashboard/routes/:id/edit',
        element: (
          <ProtectedRoute permission="routes:manage">
            <RouteEditorPage />
          </ProtectedRoute>
        ),
      },
      {
        path: 'settings',
        element: (
          <ProtectedRoute permission="balance:manage">
            <SettingsPage />
          </ProtectedRoute>
        ),
      },

      { path: '*', element: <NotFoundPage /> },
    ],
  },
])
