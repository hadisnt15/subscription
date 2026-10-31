import { useEffect, useState } from 'react';
import DashboardLayout from '../../layouts/DashboardLayout';
import api from '../../services/api';

export default function AdminDashboard() {
    const [stats, setStats] = useState({
        total_packages: 0,
        waiting_payments: 0,
        total_members: 0,
    });

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchDashboard();
    }, []);

    async function fetchDashboard() {
        try {
            setLoading(true);
            setError('');

            const response = await api.get('/admin/dashboard');

            setStats(response.data.data);
        } catch (error) {
            setError(error.response?.data?.message || 'Failed to get dashboard data.');
        } finally {
            setLoading(false);
        }
    }

    const cards = [
        {
            title: 'Total Packages',
            value: stats.total_packages,
            color: 'text-gray-800',
        },
        {
            title: 'Waiting for Verification',
            value: stats.waiting_payments,
            color: 'text-yellow-600',
        },
        {
            title: 'Total Member',
            value: stats.total_members,
            color: 'text-gray-800',
        },
    ];

    return (
        <DashboardLayout>
            <div className="mb-6">
                <h2 className="text-2xl font-bold text-gray-800">Admin Dashboard</h2>
                <p className="mt-1 text-gray-500">Manage Subscriptions and Payment Users.</p>
            </div>

            {error && (
                <div className="mb-4 rounded-lg bg-red-50 p-4 text-sm text-red-600">{error}</div>
            )}

            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                {cards.map((card) => (
                    <div key={card.title} className="rounded-xl bg-white p-6 shadow-sm">
                        <p className="text-sm text-gray-500">{card.title}</p>
                        <h3 className={`mt-2 text-2xl font-bold ${card.color}`}>{loading ? 'Loading...' : card.value.toLocaleString('id-ID')}</h3>
                    </div>
                ))}
            </div>
        </DashboardLayout>
    );
}
