import { useEffect, useState } from 'react';

import api from '../../services/api';
import DashboardLayout from '../../layouts/DashboardLayout';
import Button from '../../components/Button';
import Input from '../../components/Input';
import Alert from '../../components/Alert';

const initialForm = {
    name: '',
    price: '',
    duration: '',
    description: '',
};

export default function Packages() {
    const [packages, setPackages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    const [showModal, setShowModal] = useState(false);
    const [editingPackage, setEditingPackage] = useState(null);
    const [form, setForm] = useState(initialForm);

    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    useEffect(() => {
        fetchPackages();
    }, []);

    async function fetchPackages() {
        try {
            setLoading(true);
            const response = await api.get('/admin/packages');
            const data = response.data.data ?? response.data.packages ?? response.data;

            setPackages(Array.isArray(data) ? data : []);
        } catch (error) {
            setError(error.response?.data?.message || 'Gagal mengambil daftar paket.');
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

    function openCreateModal() {
        setEditingPackage(null);
        setForm(initialForm);
        setError('');
        setShowModal(true);
    }

    function openEditModal(item) {
        setEditingPackage(item);

        setForm({
            name: item.name || '',
            price: item.price ?? '',
            duration: item.duration ?? '',
            description: item.description || '',
        });

        setError('');
        setShowModal(true);
    }

    function closeModal() {
        if (saving) return;

        setShowModal(false);
        setEditingPackage(null);
        setForm(initialForm);
        setError('');
    }

    function handleChange(e) {
        const { name, value } = e.target;

        setForm((prev) => ({
            ...prev,
            [name]: value,
        }));
    }

    async function handleSubmit(e) {
        e.preventDefault();

        try {
            setSaving(true);
            setError('');
            setSuccess('');

            const payload = {
                name: form.name,
                price: Number(form.price),
                duration: Number(form.duration),
                description: form.description,
            };

            if (editingPackage) {
                await api.put(`/admin/packages/${editingPackage.id}`, payload);

                setSuccess('Paket berhasil diperbarui.');
            } else {
                await api.post('/admin/packages', payload);

                setSuccess('Paket berhasil ditambahkan.');
            }

            closeModal();
            await fetchPackages();
        } catch (error) {
            const validationErrors = error.response?.data?.errors;

            if (validationErrors) {
                setError(Object.values(validationErrors).flat().join(' '));
            } else {
                setError(error.response?.data?.message || 'Gagal menyimpan paket.');
            }
        } finally {
            setSaving(false);
        }
    }

    async function toggleStatus(item) {
        const action = item.is_active ? 'menonaktifkan' : 'mengaktifkan';

        if (!window.confirm(`Yakin ingin ${action} paket "${item.name}"?`)) {
            return;
        }

        try {
            setError('');
            setSuccess('');

            await api.patch(`/admin/packages/${item.id}/toggle-status`);
            setSuccess(`Status paket "${item.name}" berhasil diperbarui.`);
            await fetchPackages();
        } catch (error) {
            setError(error.response?.data?.message || 'Gagal mengubah status paket.');
        }
    }

    return (
        <DashboardLayout>
            <div className="space-y-6">

                {/* Header */}
                <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-800">Manage Packages</h1>
                        <p className="mt-1 text-gray-500">Manage Available Package.</p>
                    </div>
                    <Button onClick={openCreateModal}>+ Create New Package</Button>
                </div>

                <Alert message={error} type="error" />
                <Alert message={success} type="success" />

                {/* Summary */}
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                    <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
                        <p className="text-sm text-gray-500">Total Packages</p>
                        <p className="mt-2 text-2xl font-bold text-gray-800">{packages.length}</p>
                    </div>
                    <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
                        <p className="text-sm text-gray-500">Active Packages</p>
                        <p className="mt-2 text-2xl font-bold text-green-600">{packages.filter((item) => item.is_active).length}</p>
                    </div>
                    <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
                        <p className="text-sm text-gray-500">Inactive Packages</p>
                        <p className="mt-2 text-2xl font-bold text-gray-500">{packages.filter((item) => !item.is_active).length}</p>
                    </div>
                </div>

                {/* Table */}
                <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
                    <div className="border-b border-gray-100 p-5">
                        <h2 className="font-semibold text-gray-800">Packages List</h2>
                    </div>

                    {loading ? (
                        <div className="p-10 text-center text-gray-500">Loading Packages...</div>
                    ) : packages.length === 0 ? (
                        <div className="p-10 text-center text-gray-500">No package yet. Please create new package.</div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm">
                                <thead className="bg-gray-50 text-gray-600">
                                    <tr>
                                        <th className="px-5 py-4">Name</th>
                                        <th className="px-5 py-4">Price</th>
                                        <th className="px-5 py-4">Duration</th>
                                        <th className="px-5 py-4">Status</th>
                                        <th className="px-5 py-4 text-right">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {packages.map((item) => (
                                        <tr key={item.id}>
                                            <td className="px-5 py-4">
                                                <p className="font-semibold text-gray-800">{item.name}</p>
                                                <p className="mt-1 max-w-xs truncate text-xs text-gray-500">{item.description || '-'}</p>
                                            </td>
                                            <td className="whitespace-nowrap px-5 py-4 font-medium text-gray-800">{formatPrice(item.price)}</td>
                                            <td className="whitespace-nowrap px-5 py-4 text-gray-600">{item.duration} day(s)</td>
                                            <td className="px-5 py-4">
                                                <span className={`rounded-full px-3 py-1 text-xs font-semibold ${item.is_active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'}`}>
                                                    {item.is_active ? 'Active' : 'Inactive'}
                                                </span>
                                            </td>
                                            <td className="whitespace-nowrap px-5 py-4">
                                                <div className="flex justify-end gap-2">
                                                    <Button variant="secondary" onClick={() => openEditModal(item)}>Edit</Button>
                                                    <Button variant={item.is_active ? 'danger' : 'primary'} onClick={() => toggleStatus(item)}>
                                                        {item.is_active ? 'Inactivate' : 'Activate'}
                                                    </Button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>

                {/* Modal Create / Edit */}
                {showModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-black/50 p-4">
                        <div className="my-auto w-full max-w-lg rounded-xl bg-white shadow-xl">
                            <div className="flex items-center justify-between border-b border-gray-100 p-5">
                                <h2 className="text-lg font-bold text-gray-800">{editingPackage ? 'Edit Package' : 'Create Package'}</h2>
                                <button type="button" onClick={closeModal} disabled={saving} className="text-2xl text-gray-400 hover:text-gray-700">&times;</button>
                            </div>
                            <form onSubmit={handleSubmit}>
                                <div className="space-y-4 p-5">
                                    <Input label="Package Name" name="name" value={form.name} onChange={handleChange} placeholder="Example: Basic Package" required/>
                                    <Input label="Price (Rupiah)" name="price" type="number" value={form.price} onChange={handleChange} placeholder="50000" required/>
                                    <Input label="Duration (Day)" name="duration" type="number" value={form.duration} onChange={handleChange} placeholder="30" required/>
                                    <div>
                                        <label className="mb-2 block text-sm font-medium text-gray-700">Deskripsi</label>
                                        <textarea name="description" value={form.description} onChange={handleChange} rows={3} placeholder="Package Description..." className="w-full rounded-lg border border-gray-300 p-3 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"/>
                                    </div>
                                </div>
                                <div className="flex justify-end gap-3 border-t border-gray-100 p-5">
                                    <Button variant="secondary" onClick={closeModal} disabled={saving}>Cancel</Button>
                                    <Button type="submit" loading={saving}>{editingPackage ? 'Save Changed' : 'Create Package'}</Button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        </DashboardLayout>
    );
}