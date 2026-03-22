'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import API from '@/lib/axios';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';

export default function Login() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const router = useRouter();

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const { data } = await API.post('/auth/login', form);
      login(data.user, data.token);
      router.push(data.user.role === 'admin' ? '/admin' : '/quizzes');
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const inputStyle = {
    width: '100%', padding: '10px 14px', borderRadius: '8px', fontSize: '14px',
    border: '0.5px solid #e2e8f0', outline: 'none', marginTop: '6px',
    transition: 'border-color 0.2s',
    background: 'var(--color-background-primary)',
    color: 'var(--color-text-primary)',
  };

  return (
    <div style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{
        width: '100%', maxWidth: '420px', padding: '40px',
        background: 'var(--color-background-primary)',
        border: '0.5px solid var(--color-border-tertiary)',
        borderRadius: '16px', animation: 'fadeInUp 0.5s ease both',
      }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div style={{
            width: '48px', height: '48px', background: '#EEEDFE',
            borderRadius: '12px', display: 'flex', alignItems: 'center',
            justifyContent: 'center', margin: '0 auto 16px', fontSize: '22px'
          }}>
            🧠
          </div>
          <h2 style={{ fontSize: '22px', fontWeight: 500, color: 'var(--color-text-primary)', marginBottom: '6px' }}>
            Welcome back
          </h2>
          <p style={{ fontSize: '14px', color: 'var(--color-text-secondary)' }}>
            Login to continue to BrainBlitz
          </p>
        </div>

        {/* Error */}
        {error && (
          <div style={{
            background: '#FCEBEB', border: '0.5px solid #F7C1C1',
            borderRadius: '8px', padding: '10px 14px',
            color: '#A32D2D', fontSize: '13px', marginBottom: '20px',
            animation: 'popIn 0.3s ease',
          }}>
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label style={{ fontSize: '13px', fontWeight: 500, color: 'var(--color-text-secondary)' }}>
              Email
            </label>
            <input name="email" type="email" placeholder="john@example.com"
              onChange={handleChange} required style={inputStyle} />
          </div>
          <div>
            <label style={{ fontSize: '13px', fontWeight: 500, color: 'var(--color-text-secondary)' }}>
              Password
            </label>
            <input name="password" type="password" placeholder="••••••••"
              onChange={handleChange} required style={inputStyle} />
          </div>
          <button type="submit" disabled={loading} style={{
            background: loading ? '#9ca3af' : '#7c3aed',
            color: 'white', border: 'none', padding: '11px',
            borderRadius: '8px', fontSize: '14px', fontWeight: 500,
            cursor: loading ? 'not-allowed' : 'pointer',
            transition: 'background 0.2s, transform 0.15s',
            marginTop: '4px',
          }}>
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: '20px', fontSize: '13px', color: 'var(--color-text-secondary)' }}>
          Don't have an account?{' '}
          <Link href="/register" style={{ color: '#7c3aed', textDecoration: 'none', fontWeight: 500 }}>
            Register
          </Link>
        </p>
      </div>
    </div>
  );
}