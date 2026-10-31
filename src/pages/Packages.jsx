import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import api from '../services/api';
import DashboardLayout from '../layouts/DashboardLayout';
import Button from '../components/Button';
import Alert from '../components/Alert';

export default function Packages() {
    const navigate = useNavigate();

    const [packages, setPackages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [selectedPackage, setSelectedPackage] = useState(null);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchPackages();
    }, []);

    async function fetchPackages() {
        try {
            const response = await api.get('/packages');
            const data = response.data.data ?? response.data.packages ?? response.data;
            setPackages(Array.isArray(data) ? data : []);
        } catch (error) {
            setError(error.response?.data?.message || 'Failed to Collect Package Data.');
        } finally {
            setLoading(false);
        }
    }

    async function handleSubscribe(packageId) {
        try {
            setSubmitting(true);
            setSelectedPackage(packageId);
            setError('');

            await api.post('/subscription', {
                package_id: packageId,
            });

            navigate('/subscription');
        } catch (error) {
            setError(error.response?.data?.message || 'Failed to Order Package.');
        } finally {
            setSubmitting(false);
            setSelectedPackage(null);
        }
    }

    function formatPrice(price) {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0,
        }).format(price);
    }

    return (
        <DashboardLayout>
            <div className="space-y-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">Choose Package</h1>
                    <p className="mt-1 text-gray-500">Choose Package Subscription.</p>
                </div>

                <Alert message={error} type="error" />
                {loading ? (
                    <div className="py-12 text-center text-gray-500">Loading...</div>
                ) : packages.length === 0 ? (
                    <div className="rounded-xl border border-dashed border-gray-300 p-10 text-center">
                        <p className="font-medium text-gray-700">Package Not Available.</p>
                        <p className="mt-1 text-sm text-gray-500">Please Try Again Later.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
                        {packages.map((item) => (
                            <div key={item.id} className="flex flex-col rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
                                <h2 className="text-xl font-bold text-gray-800">{item.name}</h2>
                                <p className="mt-2 text-3xl font-bold text-blue-600">{formatPrice(item.price)}</p>
                                <p className="mt-1 text-sm text-gray-500">{item.duration} hari</p>
                                <p className="mt-4 flex-1 text-sm leading-relaxed text-gray-600">{item.description || 'No Package Description.'}</p>
                                <Button block className="mt-6 w-full" disabled={submitting} loading={selectedPackage === item.id} onClick={() => handleSubscribe(item.id)}>Order</Button>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
}
