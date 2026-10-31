import { useState } from 'react';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';

export default function DashboardLayout({ children }) {
    const [sidebarOpen, setSidebarOpen] = useState(false);

    return (
        <div className="min-h-screen bg-gray-100">
            <div className="flex min-h-screen">
                <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)}/>
                <div className="flex min-w-0 flex-1 flex-col">
                    <Navbar onMenuClick={() => setSidebarOpen(true)}/>
                    <main className="flex-1 p-6">{children}</main>
                </div>
            </div>
        </div>
    );
}