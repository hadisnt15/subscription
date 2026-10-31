import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

import api from '../services/api';
import DashboardLayout from '../layouts/DashboardLayout';
import Button from '../components/Button';
import Alert from '../components/Alert';

export default function Subscription() {
    const [subscription, setSubscription] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const [selectedHistory, setSelectedHistory] = useState(null);
    const [proofFile, setProofFile] = useState(null);
    const [uploading, setUploading] = useState(false);
    const [success, setSuccess] = useState('');

    useEffect(() => {
        fetchSubscription();
    }, []);

    async function fetchSubscription() {
        try {
            const response = await api.get('/subscription');
            const data = response.data.data ?? response.data;

            setSubscription(data);
        } catch (error) {
            setError(error.response?.data?.message || 'Failed to Collect Subscriptions.');
        } finally {
            setLoading(false);
        }
    }

    function formatPrice(price) {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0,
        }).format(price || 0);
    }

    function formatDate(date) {
        if (!date) return '-';

        return new Date(date).toLocaleDateString('id-ID', {
            day: '2-digit',
            month: 'long',
            year: 'numeric',
        });
    }

    function getStatus(status) {
        const statuses = {
            pending: {
                label: 'Pending',
                color: 'bg-yellow-100 text-yellow-700',
            },
            waiting_for_verification: {
                label: 'Waiting for Verification',
                color: 'bg-blue-100 text-blue-700',
            },
            active: {
                label: 'Active',
                color: 'bg-green-100 text-green-700',
            },
            rejected: {
                label: 'Rejected',
                color: 'bg-red-100 text-red-700',
            },
            expired: {
                label: 'Expired',
                color: 'bg-gray-100 text-gray-700',
            },
        };

        return statuses[status] ?? {
            label: status ?? '-',
            color: 'bg-gray-100 text-gray-700',
        };
    }

    const histories = Array.isArray(subscription) ? subscription : subscription?.histories ?? subscription?.subscription_histories ?? (subscription?.package_name ? [subscription] : []);

    async function handleUploadPayment(e) {
        e.preventDefault();

        if (!proofFile) {
            setError('Select payment proof.');
            return;
        }

        try {
            setUploading(true);
            setError('');
            setSuccess('');

            const formData = new FormData();
            formData.append('payment_proof', proofFile);

            await api.post(`/subscription/${selectedHistory.id}/payment`, formData);

            setSuccess('Payment proof uploaded.');

            setSelectedHistory(null);
            setProofFile(null);

            await fetchSubscription();
        } catch (error) {
            setError(error.response?.data?.message || 'Failed to upload payment proof.');
        } finally {
            setUploading(false);
        }
    }

    return (
        <DashboardLayout>
            <div className="space-y-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-800">Subscription Saya</h1>
                    <p className="mt-1 text-gray-500">Informasi paket dan riwayat langganan Anda.</p>
                </div>
                <Alert message={error} type="error" />

                {loading ? (
                    <div className="py-12 text-center text-gray-500">
                        Loading...
                    </div>
                ) : histories.length === 0 ? (
                    <div className="rounded-xl bg-white p-8 text-center shadow-sm">
                        <h3 className="text-lg font-semibold text-gray-800">No Subscription</h3>
                        <p className="mt-2 text-gray-500">No Subscription Package.</p>
                        <Link to="/packages">
                            <Button className="mt-5">Select Package</Button>
                        </Link>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
                        {histories.map((item) => {
                            const status = getStatus(item.status);
                            return (
                                <div key={item.id} className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
                                    <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-start">
                                        <div>
                                            <p className="text-sm text-gray-500">Subscription Package</p>
                                            <h2 className="mt-1 text-xl font-bold text-gray-800">{item.package_name || item.package?.name || 'Nama Paket'}</h2>
                                        </div>
                                        <span className={`w-fit rounded-full px-3 py-1 text-xs font-semibold ${status.color}`}>{status.label}</span>
                                    </div>
                                    <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
                                        <div>
                                            <p className="text-sm text-gray-500">Price</p>
                                            <p className="mt-1 font-semibold text-gray-800">{formatPrice(item.price ?? item.package?.price)}</p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-500">Duration</p>
                                            <p className="mt-1 font-semibold text-gray-800">{item.duration ?? item.package?.duration ?? '-'} hari</p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-500">Start Date</p>
                                            <p className="mt-1 font-semibold text-gray-800">{formatDate(item.start_date)}</p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-500">End Date</p>
                                            <p className="mt-1 font-semibold text-gray-800">{formatDate(item.end_date)}</p>
                                        </div>
                                    </div>

                                    {item.status === 'pending' && (
                                        <div className="mt-6 border-t border-gray-100 pt-5">
                                            <p className="text-sm text-yellow-700">Your order has been created. Please make a payment and upload your payment proof.</p>
                                            <Button className="mt-3" onClick={() => { setSelectedHistory(item); setProofFile(null); setError(''); }}>
                                                Upload Payment Proof
                                            </Button>
                                        </div>
                                    )}
                                    {item.status === 'rejected' && (
                                        <div className="mt-5 rounded-lg border border-red-200 bg-red-50 p-4">
                                            <p className="font-semibold text-red-700">Payment Rejected</p>
                                            <p className="mt-1 text-sm text-red-600">Payment rejected. Please check the reason below and make a new order.</p>
                                            {(item.payments?.[0]?.note || item.payment?.note) && (
                                                <div className="mt-3 rounded-lg bg-white p-3">
                                                    <p className="mt-1 whitespace-pre-line text-sm text-gray-700">{item.payments?.[0]?.note || item.payment?.note}</p>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
            {selectedHistory && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                    <div className="w-full max-w-lg rounded-xl bg-white p-6 shadow-xl">
                        <div className="mb-5 flex items-center justify-between">
                            <h2 className="text-xl font-bold text-gray-800">Upload Payment Proof</h2>
                            <button type="button" onClick={() => { setSelectedHistory(null); setProofFile(null); setError(''); }} className="text-2xl text-gray-400 hover:text-gray-700">
                                &times;
                            </button>
                        </div>

                        <div className="mb-5 rounded-lg bg-gray-50 p-4">
                            <p className="text-sm text-gray-500">Selected Packages</p>
                            <p className="mt-1 font-semibold text-gray-800">{selectedHistory.package_name}</p>
                            <p className="mt-2 text-xl font-bold text-blue-600">{formatPrice(selectedHistory.price)}</p>
                        </div>

                        <form onSubmit={handleUploadPayment}>
                            <div className="mb-5">
                                <label className="mb-2 block text-sm font-medium text-gray-700">Payment Proof</label>
                                <input type="file" accept=".jpg,.jpeg,.png" onChange={(e) => { setProofFile(e.target.files[0] || null); }} className="block w-full rounded-lg border border-gray-300 p-3 text-sm" required/>
                                <p className="mt-2 text-xs text-gray-500">Format JPG, JPEG, or PNG. Max 1 MB.</p>
                                {proofFile && (
                                    <p className="mt-2 text-sm text-green-600">Selected File: {proofFile.name}</p>
                                )}
                            </div>

                            {error && (
                                <div className="mb-4 rounded-lg bg-red-50 p-3 text-sm text-red-600">{error}</div>
                            )}

                            <div className="flex justify-end gap-3">
                                <Button variant="secondary" onClick={() => { setSelectedHistory(null); setProofFile(null); setError(''); }} disabled={uploading}>
                                    Cancel
                                </Button>
                                <Button type="submit" loading={uploading} disabled={!proofFile}>
                                    Upload
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </DashboardLayout>
    );
}
