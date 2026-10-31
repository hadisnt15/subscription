import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../layouts/DashboardLayout';
import api from '../services/api';

export default function Dashboard() {
    const navigate = useNavigate();

    const [subscription, setSubscription] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchSubscription();
    }, []);

    async function fetchSubscription() {
        try {
            setLoading(true);
            setError('');

            const response = await api.get('/subscription');

            setSubscription(response.data.active_subscription ?? null);

        } catch (error) {
            setError(error.response?.data?.message || 'Failed to get dashboard data.');
        } finally {
            setLoading(false);
        }
    }

    const formatDate = (date) => {
        if (!date) return '-';

        const parsedDate = new Date(date);

        if (isNaN(parsedDate.getTime())) {
            return '-';
        }

        return parsedDate.toLocaleDateString('id-ID', {
            day: '2-digit',
            month: 'long',
            year: 'numeric',
        });
    };

    return (
        <DashboardLayout>
            <div className="mb-6">
                <h2 className="text-2xl font-bold text-gray-800">Dashboard</h2>
                <p className="mt-1 text-gray-500">Welcome to Subscription App.</p>
            </div>

            {error && (
                <div className="mb-4 rounded-lg bg-red-50 p-4 text-sm text-red-600">{error}</div>
            )}

            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                <div className="rounded-xl bg-white p-6 shadow-sm">
                    <p className="text-sm text-gray-500">Subscription Status</p>
                    <h3 className={`mt-2 text-xl font-bold ${
                        subscription ? 'text-green-600' : 'text-yellow-600'
                    }`}>
                        {loading ? 'Loading...' : subscription ? 'Active' : 'Inactive'}
                    </h3>
                </div>

                <div className="rounded-xl bg-white p-6 shadow-sm">
                    <p className="text-sm text-gray-500">Active Package</p>
                    <h3 className="mt-2 text-xl font-bold text-gray-800">
                        {loading ? 'Loading...' : subscription?.package_name ?? subscription?.package?.name ?? '-'}
                    </h3>
                </div>

                <div className="rounded-xl bg-white p-6 shadow-sm">
                    <p className="text-sm text-gray-500">Valid Until</p>
                    <h3 className="mt-2 text-xl font-bold text-gray-800">
                        {loading ? 'Loading...' : formatDate(subscription?.end_date)}
                    </h3>
                </div>
            </div>

            <div className="mt-6 rounded-xl bg-white p-6 shadow-sm">
                <h3 className="text-lg font-semibold text-gray-800">Subscription Information</h3>
                <p className="mt-2 text-sm text-gray-500">
                    {loading ? 'Loading subscription information...' : subscription ? `Your ${subscription.package_name ?? subscription.package?.name ?? 'subscription'} package is currently active.` : 'You do not have an active subscription. Choose a package to get started.'}
                </p>
                <button onClick={() => navigate('/packages')} className="mt-4 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-blue-700">
                    Packages
                </button>
            </div>
        </DashboardLayout>
    );
}