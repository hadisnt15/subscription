import { useEffect, useState } from 'react';

import api from '../../services/api';
import DashboardLayout from '../../layouts/DashboardLayout';
import Button from '../../components/Button';
import Alert from '../../components/Alert';

export default function Payments() {
    const [payments, setPayments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [processing, setProcessing] = useState(false);

    const [selectedPayment, setSelectedPayment] = useState(null);
    const [decision, setDecision] = useState('');
    const [note, setNote] = useState('');

    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const [proofUrl, setProofUrl] = useState('');
    const [proofType, setProofType] = useState('');
    const [proofLoading, setProofLoading] = useState(false);

    const [currentPage, setCurrentPage] = useState(1);
    const [pagination, setPagination] = useState({
        current_page: 1,
        last_page: 1,
        per_page: 10,
        total: 0,
    });

    useEffect(() => {
        fetchPayments();
    }, []);

    
    async function fetchPayments() {
        try {
            setLoading(true);
            setError('');

            const response = await api.get('/admin/payments', {
                params: {
                    page: currentPage,
                },
            });

            setPayments(response.data.data ?? []);
            setPagination(response.data.pagination ?? {
                current_page: 1,
                last_page: 1,
                per_page: 10,
                total: 0,
            });

        } catch (error) {
            console.error('Fetch payments error:', error.response?.data || error);

            setError(error.response?.data?.message || 'Gagal mengambil data pembayaran.');
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

        return new Date(date).toLocaleString('id-ID', {
            day: '2-digit',
            month: 'long',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    }

    function getStatus(status) {
        const statuses = {
            waiting_for_verification: {
                label: 'Menunggu Verifikasi',
                color: 'bg-yellow-100 text-yellow-700',
            },
            approved: {
                label: 'Disetujui',
                color: 'bg-green-100 text-green-700',
            },
            rejected: {
                label: 'Ditolak',
                color: 'bg-red-100 text-red-700',
            },
        };

        return statuses[status] ?? {
            label: status || '-',
            color: 'bg-gray-100 text-gray-700',
        };
    }

    function openDecision(payment, action) {
        setSelectedPayment(payment);
        setDecision(action);
        setNote('');
        setError('');
        setProofUrl('');
        setProofType('');

        loadProof(payment);
    }

    async function loadProof(payment) {
        try {
            setProofLoading(true);
            const response = await api.get(`/admin/payments/${payment.id}/proof`, { responseType: 'blob' });
            const contentType = response.headers['content-type'];
            const url = URL.createObjectURL(response.data);

            setProofUrl(url);
            setProofType(contentType);
        } catch (error) {
            setError('Gagal memuat bukti pembayaran.');
        } finally {
            setProofLoading(false);
        }
    }

    function closeModal() {
        if (processing) return;

        if (proofUrl) {
            URL.revokeObjectURL(proofUrl);
        }

        setProofUrl('');
        setProofType('');
        setSelectedPayment(null);
        setDecision('');
        setNote('');
    }

    async function handleDecision(e) {
        e.preventDefault();

        if (!selectedPayment) return;

        if (decision === 'reject' && !note.trim()) {
            setError('Catatan penolakan wajib diisi.');
            return;
        }

        try {
            setProcessing(true);
            setError('');

            const endpoint = decision === 'approve' ? `/admin/payments/${selectedPayment.id}/approve` : `/admin/payments/${selectedPayment.id}/reject`;
            const payload = decision === 'reject' ? { note } : {};

            await api.post(endpoint, payload);

            setSuccess(decision === 'approve' ? 'Pembayaran berhasil disetujui.' : 'Pembayaran berhasil ditolak.');
            setSelectedPayment(null);
            setDecision('');
            setNote('');

            await fetchPayments();
        } catch (error) {
            setError(error.response?.data?.message || 'Gagal memproses pembayaran.');
        } finally {
            setProcessing(false);
        }
    }

    function getHistory(payment) {
        return payment.subscription_history || {};
    }

    return (
        <DashboardLayout>
            <div className="space-y-6">
                <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-800">Payments</h1>
                        <p className="mt-1 text-gray-500">Manage and Verify Subscription Payments.</p>
                    </div>
                    <Button variant="secondary" onClick={fetchPayments}>Refresh</Button>
                </div>
                <Alert message={error} type="error" />
                <Alert message={success} type="success" />
                <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
                    <div className="border-b border-gray-100 p-5">
                        <h2 className="font-semibold text-gray-800">Payments List</h2>
                        <p className="mt-1 text-sm text-gray-500">Total {payments.length} payment(s)</p>
                    </div>
                    {loading ? (
                        <div className="p-10 text-center text-gray-500">Loading...</div>
                    ) : payments.length === 0 ? (
                        <div className="p-10 text-center text-gray-500">Payment Data Not Found.</div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm">
                                <thead className="bg-gray-50 text-gray-600">
                                    <tr>
                                        <th className="px-5 py-4">User</th>
                                        <th className="px-5 py-4">Package</th>
                                        <th className="px-5 py-4">Amount</th>
                                        <th className="px-5 py-4">Date</th>
                                        <th className="px-5 py-4">Status</th>
                                        <th className="px-5 py-4 text-right">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {payments.map((payment) => {
                                        const history = getHistory(payment);
                                        const status = getStatus(payment.status);

                                        return (
                                            <tr key={payment.id}>
                                                <td className="px-5 py-4">
                                                    <p className="font-medium text-gray-800">
                                                        {payment.paid_by?.name || payment.user?.name || payment.payer?.name || '-'}
                                                    </p>
                                                    <p className="text-xs text-gray-500">
                                                        {payment.paid_by?.email || payment.user?.email || ''}
                                                    </p>
                                                </td>
                                                <td className="px-5 py-4 text-gray-700">{history.package_name || '-'}</td>
                                                <td className="px-5 py-4 font-semibold text-gray-800">{formatPrice(payment.amount)}</td>
                                                <td className="px-5 py-4 text-gray-600">
                                                    {formatDate(payment.payment_date || payment.created_at)}
                                                </td>
                                                <td className="px-5 py-4">
                                                    <span className={`rounded-full px-3 py-1 text-xs font-semibold ${status.color}`}>{status.label}</span>
                                                </td>
                                                <td className="px-5 py-4 text-right">
                                                    <Button variant="secondary" onClick={() => openDecision(payment, 'approve')} className="text-sm">Periksa</Button>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                            <div className="flex items-center justify-between border-t px-4 py-4">
                                <p className="text-sm text-gray-500">Total {pagination.total} Payment</p>
                                <div className="flex items-center gap-2">
                                    <button onClick={() => setCurrentPage(prev => prev - 1)} disabled={currentPage <= 1 || loading} className="rounded-lg border px-3 py-2 text-sm disabled:opacity-40">
                                        Previous Page
                                    </button>
                                    <span className="text-sm text-gray-600">{pagination.current_page} / {pagination.last_page}</span>
                                    <button onClick={() => setCurrentPage(prev => prev + 1)} disabled={currentPage >= pagination.last_page || loading} className="rounded-lg border px-3 py-2 text-sm disabled:opacity-40">
                                        Next Page
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Modal detail dan keputusan pembayaran */}
                {selectedPayment && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/50 p-4">
                        <div className="my-auto w-full max-w-lg rounded-xl bg-white shadow-xl">
                            <div className="flex items-center justify-between border-b border-gray-100 p-5">
                                <h2 className="text-lg font-bold text-gray-800">Payment Verification</h2>
                                <button type="button" onClick={closeModal} disabled={processing} className="text-2xl text-gray-400 hover:text-gray-700">&times;</button>
                            </div>
                            <form onSubmit={handleDecision}>
                                <div className="space-y-5 p-5">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <p className="text-xs text-gray-500">User</p>
                                            <p className="mt-1 font-medium text-gray-800">
                                                {selectedPayment.paid_by?.name || selectedPayment.user?.name || selectedPayment.payer?.name || '-'}
                                            </p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-gray-500">Package</p>
                                            <p className="mt-1 font-medium text-gray-800">{getHistory(selectedPayment).package_name || '-'}</p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-gray-500">Amount</p>
                                            <p className="mt-1 font-bold text-blue-600">{formatPrice(selectedPayment.amount)}</p>
                                        </div>
                                        <div>
                                            <p className="text-xs text-gray-500">Payment Date</p>
                                            <p className="mt-1 font-medium text-gray-800">{formatDate(selectedPayment.payment_date)}</p>
                                        </div>
                                    </div>

                                    <div>
                                        <p className="mb-2 text-sm font-medium text-gray-700">Payment Proof</p>
                                        <div className="overflow-hidden rounded-lg border border-gray-200 bg-gray-50">
                                            {proofLoading ? (
                                                <div className="flex h-48 items-center justify-center text-sm text-gray-500">Loading...</div>
                                            ) : proofUrl ? (
                                                proofType?.startsWith('image/') ? (
                                                    <img src={proofUrl} alt="Bukti Transfer" className="max-h-[450px] w-full object-contain"/>
                                                ) : (
                                                    <div className="p-5 text-sm text-gray-500">Format file invalid.</div>
                                                )
                                            ) : (
                                                <div className="p-5 text-center text-sm text-red-500">Payment Proof Cannot Be Loaded.</div>
                                            )}
                                        </div>
                                    </div>
                                    <div className="border-t border-gray-100 pt-5">
                                        <p className="mb-3 text-sm font-semibold text-gray-800">Decision</p>
                                        <div className="flex gap-3">
                                            <Button type="button" variant={decision === 'approve' ? 'primary' : 'secondary'} disabled={processing} className="flex-1"
                                                onClick={() => {
                                                    setDecision('approve');
                                                    setError('');
                                                }} >
                                                Approve
                                            </Button>
                                            <Button type="button" variant={decision === 'reject' ? 'danger' : 'secondary'} disabled={processing} className="flex-1"
                                                onClick={() => {
                                                    setDecision('reject');
                                                    setError('');
                                                }} >
                                                Reject
                                            </Button>
                                        </div>
                                    </div>

                                    {decision === 'reject' && (
                                        <div>
                                            <label className="mb-2 block text-sm font-medium text-gray-700">Note</label>
                                            <textarea value={note} onChange={(e) => setNote(e.target.value)} rows={3} placeholder="Reject Reason..." className="w-full rounded-lg border border-gray-300 p-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100" required/>
                                        </div>
                                    )}

                                    {error && (
                                        <Alert message={error} type="error" />
                                    )}
                                </div>

                                <div className="flex justify-end gap-3 border-t border-gray-100 p-5">
                                    <Button variant="secondary" onClick={closeModal} disabled={processing}>Cancel</Button>
                                    <Button type="submit" variant={decision === 'reject' ? 'danger' : 'primary'} loading={processing} disabled={!decision}>
                                        {decision === 'approve' ? 'Approve Confirmation' : 'Reject Confirmation'}
                                    </Button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
}
