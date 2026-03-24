'use client';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import PrivateRoute from '@/components/PrivateRoute';

export default function PlayerHome() {
  const router = useRouter();
  const { user } = useAuth();

  return (
    <PrivateRoute>
      <div style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ width: '100%', maxWidth: '560px', animation: 'fadeInUp 0.5s ease both' }}>

          {/* Welcome header */}
          <div style={{ textAlign: 'center', marginBottom: '48px' }}>
            <div style={{ fontSize: '56px', marginBottom: '16px' }}>🧠</div>
            <h1 style={{ fontSize: '28px', fontWeight: 500, color: 'var(--color-text-primary)', marginBottom: '8px' }}>
              Welcome, {user?.name}!
            </h1>
            <p style={{ fontSize: '15px', color: 'var(--color-text-secondary)' }}>
              What would you like to do today?
            </p>
          </div>

          {/* Options */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>

            {/* Join Quiz */}
            <button onClick={() => router.push('/join')} style={{
              background: '#1a1a2e', border: '0.5px solid #7c3aed44',
              borderRadius: '20px', padding: '40px 24px',
              cursor: 'pointer', textAlign: 'center',
              transition: 'transform 0.2s, border-color 0.2s',
              animation: 'fadeInUp 0.5s ease 0.1s both',
            }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.borderColor = '#7c3aed'; }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.borderColor = '#7c3aed44'; }}>
              <div style={{ fontSize: '48px', marginBottom: '16px' }}>🎮</div>
              <h2 style={{ fontSize: '18px', fontWeight: 500, color: 'white', marginBottom: '8px' }}>
                Join a quiz
              </h2>
              <p style={{ fontSize: '13px', color: '#c4b5fd', lineHeight: 1.5 }}>
                Enter a quiz code or link from your host to join a live quiz
              </p>
              <div style={{
                marginTop: '20px', background: '#7c3aed',
                color: 'white', padding: '8px 20px',
                borderRadius: '8px', fontSize: '13px', fontWeight: 500,
                display: 'inline-block',
              }}>
                Join now →
              </div>
            </button>

            {/* Create Quiz */}
            <button onClick={() => router.push('/creator')} style={{
              background: '#1a1a2e', border: '0.5px solid #05966944',
              borderRadius: '20px', padding: '40px 24px',
              cursor: 'pointer', textAlign: 'center',
              transition: 'transform 0.2s, border-color 0.2s',
              animation: 'fadeInUp 0.5s ease 0.2s both',
            }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.borderColor = '#059669'; }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.borderColor = '#05966944'; }}>
              <div style={{ fontSize: '48px', marginBottom: '16px' }}>✏️</div>
              <h2 style={{ fontSize: '18px', fontWeight: 500, color: 'white', marginBottom: '8px' }}>
                Create a quiz
              </h2>
              <p style={{ fontSize: '13px', color: '#c4b5fd', lineHeight: 1.5 }}>
                Build your own quiz, add questions and invite players to join
              </p>
              <div style={{
                marginTop: '20px', background: '#059669',
                color: 'white', padding: '8px 20px',
                borderRadius: '8px', fontSize: '13px', fontWeight: 500,
                display: 'inline-block',
              }}>
                Create now →
              </div>
            </button>
          </div>

          {/* Recent activity hint */}
          <div style={{
            marginTop: '24px', padding: '16px 20px',
            background: 'var(--color-background-primary)',
            border: '0.5px solid var(--color-border-tertiary)',
            borderRadius: '12px', textAlign: 'center',
            animation: 'fadeInUp 0.5s ease 0.3s both',
          }}>
            <p style={{ fontSize: '13px', color: 'var(--color-text-secondary)' }}>
              Have a quiz code? Go to{' '}
              <span onClick={() => router.push('/join')}
                style={{ color: '#7c3aed', cursor: 'pointer', fontWeight: 500 }}>
                Join Quiz
              </span>
              {' '}and enter it to get started!
            </p>
          </div>

        </div>
      </div>
    </PrivateRoute>
  );
}