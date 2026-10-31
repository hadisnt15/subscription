import { useAuth } from '../hooks/useAuth';

export default function Navbar({ onMenuClick }) {
    const { user, logout } = useAuth();

    async function handleLogout() {
        await logout();
        window.location.href = '/login';
    }

    return (
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6">
            <div className="flex items-center gap-3">
                <button onClick={onMenuClick} className="lg:hidden text-gray-600 text-xl">☰</button>
                <h1 className="font-bold text-lg text-gray-800">Subscription App</h1>
            </div>
            <div className="flex items-center gap-4">
                <div className="text-right hidden sm:block">
                    <p className="text-sm font-semibold text-gray-800">{user?.name}</p>
                    <p className="text-xs text-gray-500">{user?.is_admin ? 'Administrator' : 'Member'}</p>
                </div>
                <button onClick={handleLogout} className="rounded-lg bg-red-50 px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-100">
                    Logout
                </button>
            </div>
        </header>
    );
}