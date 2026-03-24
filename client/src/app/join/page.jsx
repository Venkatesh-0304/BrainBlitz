'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import API from '@/lib/axios';
import PrivateRoute from '@/components/PrivateRoute';

export default function JoinQuiz() {
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const router = useRouter();

  const handleJoin = async (e) => {
    e.preventDefault();
    if (!code.trim()) return setError('Please enter a quiz code');
    setLoading(true);
    setError('');
    setMessage('');
    try {
      const { data } = await API.get(`/live/join/code/${code.toUpperCase()}`);
      setMessage(data.message);

      // ✅ always redirect to lobby first
      setTimeout(() => {
        router.push(`/lobby/${data.quiz._id}`);
      }, 1000);

    } catch (err) {
      setError(err.response?.data?.message || 'Failed to join quiz');
    } finally {
      setLoading(false);
    }
  };

  return (
    <PrivateRoute>
      <div style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{
          width: '100%', maxWidth: '420px', padding: '40px',
          background: 'var(--color-background-primary)',
          border: '0.5px solid var(--color-border-tertiary)',
          borderRadius: '16px', animation: 'fadeInUp 0.5s ease both',
          textAlign: 'center',
        }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>🎮</div>
          <h2 style={{ fontSize: '22px', fontWeight: 500, color: 'var(--color-text-primary)', marginBottom: '8px' }}>
            Join a quiz
          </h2>
          <p style={{ fontSize: '14px', color: 'var(--color-text-secondary)', marginBottom: '28px' }}>
            Enter the 6-digit quiz code from your host
          </p>

          {error && (
            <div style={{
              background: '#FCEBEB', border: '0.5px solid #F7C1C1',
              borderRadius: '8px', padding: '10px 14px',
              color: '#A32D2D', fontSize: '13px', marginBottom: '16px',
            }}>
              {error}
            </div>
          )}

          {message && (
            <div style={{
              background: '#EAF3DE', border: '0.5px solid #C0DD97',
              borderRadius: '8px', padding: '10px 14px',
              color: '#3B6D11', fontSize: '13px', marginBottom: '16px',
              animation: 'popIn 0.3s ease',
            }}>
              {message} Redirecting to lobby...
            </div>
          )}

          <form onSubmit={handleJoin}>
            <input
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              placeholder="e.g. ABC123"
              maxLength={6}
              style={{
                width: '100%', padding: '14px',
                fontSize: '24px', fontWeight: 500,
                textAlign: 'center', letterSpacing: '8px',
                borderRadius: '12px', border: '0.5px solid var(--color-border-secondary)',
                outline: 'none', background: 'var(--color-background-primary)',
                color: 'var(--color-text-primary)', marginBottom: '16px',
              }}
            />
            <button type="submit" disabled={loading || !!message} style={{
              width: '100%', background: loading || message ? '#9ca3af' : '#7c3aed',
              color: 'white', border: 'none', padding: '12px',
              borderRadius: '8px', fontSize: '14px', fontWeight: 500,
              cursor: loading || message ? 'not-allowed' : 'pointer',
            }}>
              {loading ? 'Joining...' : message ? 'Redirecting...' : 'Join Quiz'}
            </button>
          </form>
        </div>
      </div>
    </PrivateRoute>
  );
}