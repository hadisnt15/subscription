import { useState } from 'react';
import { Link, useNavigate, Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

import api from '../services/api';
import AuthLayout from '../layouts/AuthLayout';
import Input from '../components/Input';
import Button from '../components/Button';
import Alert from '../components/Alert';

export default function Register() {
    const { user, loading: authLoading } = useAuth();
    const navigate = useNavigate();

    const [form, setForm] = useState({
        name: '',
        email: '',
        password: '',
        password_confirmation: '',
    });

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    if (authLoading) {
        return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
    }

    if (user) {
        return <Navigate to={user.is_admin ? '/admin/dashboard' : '/dashboard'} replace />;
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

        setError('');
        setSuccess('');

        if (form.password !== form.password_confirmation) {
            setError('Konfirmasi password tidak sesuai.');
            return;
        }

        try {
            setLoading(true);
            await api.post('/register', form);
            setSuccess('Registrasi berhasil. Mengalihkan ke halaman login...');

            setTimeout(() => {
                navigate('/login');
            }, 1200);
        } catch (err) {
            const validationErrors = err.response?.data?.errors;
            if (validationErrors) {
                setError(Object.values(validationErrors).flat().join(' '));
            } else {
                setError(err.response?.data?.message || 'Registrasi gagal. Silakan coba kembali.');
            }
        } finally {
            setLoading(false);
        }
    }

    return (
        <AuthLayout title="Buat Akun" description="Daftar untuk mulai berlangganan layanan kami.">
            <Alert message={error} type="error" />
            <Alert message={success} type="success" />

            <form onSubmit={handleSubmit} className="space-y-5">
                <Input label="Nama Lengkap" name="name" value={form.name} onChange={handleChange} placeholder="Masukkan nama lengkap" autoComplete="name" required/>
                <Input label="Email" name="email" type="email" value={form.email} onChange={handleChange} placeholder="nama@email.com" autoComplete="email" required />
                <Input label="Password" name="password" type="password" value={form.password} onChange={handleChange} placeholder="Minimal 8 karakter" autoComplete="new-password" required/>
                <Input label="Konfirmasi Password" name="password_confirmation" type="password" value={form.password_confirmation} onChange={handleChange} placeholder="Ulangi password" autoComplete="new-password" required />
                <Button type="submit" loading={loading} disabled={loading} className="w-full" >Daftar Sekarang</Button>
            </form>

            <div className="mt-6 text-center text-sm text-gray-600">
                Already Have an Account?{' '}
                <Link to="/login" className="font-semibold text-blue-600 hover:text-blue-700">
                    Login
                </Link>
            </div>
        </AuthLayout>
    );
}