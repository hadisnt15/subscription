import { createBrowserRouter, Navigate } from 'react-router-dom';

import Home from '../pages/Home';
import Login from '../pages/Login';
import Register from '../pages/Register';
import Dashboard from '../pages/Dashboard';
import Packages from '../pages/Packages';
import Subscription from '../pages/Subscription';

import AdminDashboard from '../pages/admin/Dashboard';
import AdminPackages from '../pages/admin/Packages';
import AdminPayments from '../pages/admin/Payments';

import ProtectedRoute from './ProtectedRoute';

const router = createBrowserRouter([
    {
        path: '/',
        element: <Home />,
    },
    {
        path: '/login',
        element: <Login />,
    },
    {
        path: '/register',
        element: <Register />,
    },
    {
        element: <ProtectedRoute />,
        children: [
            {
                path: '/dashboard',
                element: <Dashboard />,
            },
            {
                path: '/packages',
                element: <Packages />,
            },
            {
                path: '/subscription',
                element: <Subscription />,
            },
        ],
    },
    {
        element: <ProtectedRoute adminOnly />,
        children: [
            {
                path: '/admin/dashboard',
                element: <AdminDashboard />,
            },
            {
                path: '/admin/packages',
                element: <AdminPackages />,
            },
            {
                path: '/admin/payments',
                element: <AdminPayments />,
            },
        ],
    },
    {
        path: '*',
        element: <Navigate to="/" replace />,
    },
]);

export default router;