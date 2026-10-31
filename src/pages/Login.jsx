import { useState } from 'react';
import { Link, useNavigate, Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

import AuthLayout from '../layouts/AuthLayout';
import Button from '../components/Button';
import Input from '../components/Input';
import Alert from '../components/Alert';

export default function Login() {
    const { user, loading: authLoading, login } = useAuth();
    const navigate = useNavigate();

    const [form, setForm] = useState({
        email: '',
        password: '',
    });

    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    if (authLoading) {
        return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
    }

    if (user) {
        return <Navigate to={user.is_admin ? '/admin/dashboard' : '/dashboard'} replace />;
    }

    function handleChange(e) {
        setForm({
            ...form,
            [e.target.name]: e.target.value,
        });
    }

    async function handleSubmit(e) {
        e.preventDefault();

        setError('');
        setLoading(true);

        try {
            const user = await login(form.email, form.password);

            navigate(user.is_admin ? '/admin/dashboard' : '/dashboard', { replace: true });
        } catch (error) {
            setError(error.response?.data?.message || error.message || 'Login gagal. Periksa email dan password.');
        } finally {
            setLoading(false);
        }
    }

    return (
        <AuthLayout title="Subscription" description="Please Login to Your Account" >
            <form onSubmit={handleSubmit} className="space-y-5">
                <Alert message={error} type="error" />
                <Input label="Email" name="email" type="email" value={form.email} onChange={handleChange} placeholder="name@email.com" autoComplete="email" required />
                <Input label="Password" name="password" type="password" value={form.password} onChange={handleChange} placeholder="Password" autoComplete="current-password" required />
                <Button type="submit" loading={loading} className="w-full">Login</Button>
            </form>

            <p className="mt-6 text-center text-sm text-gray-600">
                Not Have an Account?{' '}
                <Link to="/register" className="font-semibold text-blue-600 hover:underline" >Register Now</Link>
            </p>
        </AuthLayout>
    );
}