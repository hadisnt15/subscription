import { Navigate, Link } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

function Home() {
    const { user, loading } = useAuth();

    if (loading) {
        return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
    }

    if (user) {
        return <Navigate to={user.is_admin ? '/admin/dashboard' : '/dashboard'} replace />;
    }

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 px-4">
            <h1 className="text-4xl font-bold text-gray-800">
                Subscription App
            </h1>

            <p className="mt-3 text-gray-500">
                Welcome! Silakan login atau daftar untuk melanjutkan.
            </p>

            <div className="mt-8 flex gap-4">
                <Link
                    to="/login"
                    className="rounded-lg bg-blue-600 px-6 py-3 font-semibold text-white hover:bg-blue-700"
                >
                    Login
                </Link>

                <Link
                    to="/register"
                    className="rounded-lg border border-blue-600 px-6 py-3 font-semibold text-blue-600 hover:bg-blue-50"
                >
                    Register
                </Link>
            </div>
        </div>
    );
}

export default Home;