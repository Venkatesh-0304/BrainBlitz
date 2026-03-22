'use client';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useEffect, useState } from 'react';

const Navbar = () => {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true); // ✅ only render user-specific UI after mount
  }, []);

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  return (
    <nav style={{
      background: '#1a1a2e',
      padding: '14px 24px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      borderRadius: '12px',
      marginBottom: '2rem',
      animation: 'fadeInUp 0.5s ease both',
    }}>
      <Link href="/" style={{ color: '#a78bfa', fontSize: '18px', fontWeight: 500, textDecoration: 'none' }}>
        BrainBlitz
      </Link>

      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        {/* ✅ only show user UI after mounted to avoid hydration mismatch */}
        {mounted && user ? (
          <>
            <span style={{ color: '#c4b5fd', fontSize: '13px' }}>Hi, {user.name}</span>
            {user.role === 'admin' && (
              <Link href="/admin" style={{ color: '#a78bfa', fontSize: '13px', textDecoration: 'none' }}>
                Dashboard
              </Link>
            )}
            <Link href="/quizzes" style={{ color: '#c4b5fd', fontSize: '13px', textDecoration: 'none' }}>
              Quizzes
            </Link>
            <button onClick={handleLogout} style={{
              background: '#7c3aed', color: 'white', border: 'none',
              padding: '6px 16px', borderRadius: '8px', fontSize: '13px',
              cursor: 'pointer', transition: 'background 0.2s',
            }}
              onMouseEnter={e => e.target.style.background = '#6d28d9'}
              onMouseLeave={e => e.target.style.background = '#7c3aed'}>
              Logout
            </button>
          </>
        ) : mounted && (
          <>
            <Link href="/login" style={{ color: '#c4b5fd', fontSize: '13px', textDecoration: 'none' }}>Login</Link>
            <Link href="/register" style={{
              background: '#7c3aed', color: 'white',
              padding: '6px 16px', borderRadius: '8px', fontSize: '13px', textDecoration: 'none'
            }}>Register</Link>
          </>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
