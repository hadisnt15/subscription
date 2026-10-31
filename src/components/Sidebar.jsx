import { NavLink } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

export default function Sidebar({ open = false, onClose }) {
    const { user } = useAuth();
    const isAdmin = user?.is_admin;
    const menus = isAdmin ? [
            { label: 'Dashboard', path: '/admin/dashboard' },
            { label: 'Manage Packages', path: '/admin/packages' },
            { label: 'Manage Payments', path: '/admin/payments' },
        ] : [
            { label: 'Dashboard', path: '/dashboard' },
            { label: 'My Subscription', path: '/subscription' },
            { label: 'Packages', path: '/packages' },    
        ];

    return (
        <>
            {open && (
                <div className="fixed inset-0 z-30 bg-black/40 lg:hidden" onClick={onClose} />
            )}

            <aside className={`fixed inset-y-0 left-0 z-40 w-64 bg-gray-900 text-white transform transition-transform duration-200 lg:static lg:translate-x-0 ${open ? 'translate-x-0' : '-translate-x-full'} `}>
                <div className="h-16 flex items-center px-6 border-b border-gray-700">
                    <span className="font-bold text-lg">
                        {isAdmin ? 'Admin Panel' : 'Member Area'}
                    </span>
                </div>
                <nav className="p-4 space-y-2">
                    {menus.map((menu) => (
                        <NavLink key={menu.path} to={menu.path} onClick={onClose} className={({ isActive }) => ` block rounded-lg px-4 py-3 text-sm transition ${isActive ? 'bg-blue-600 text-white' : 'text-gray-300 hover:bg-gray-800 hover:text-white' }`}>
                            {menu.label}
                        </NavLink>
                    ))}
                </nav>
            </aside>
        </>
    );
}