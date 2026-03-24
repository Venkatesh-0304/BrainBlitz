'use client';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useEffect, useState } from 'react';
import API from '@/lib/axios';

const Navbar = () => {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const [unread, setUnread] = useState(0);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (user) fetchUnread();
  }, [user]);

 const fetchUnread = async () => {
  try {
    const { data } = await API.get('/notifications');
    setUnread(data.filter(n => !n.read).length);
  } catch (err) {
    // silently fail - don't crash navbar
    console.log('Notifications not available');
  }
};

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  return (
    <nav style={{
      background: '#1a1a2e', padding: '14px 24px',
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      borderRadius: '12px', marginBottom: '2rem',
      animation: 'fadeInUp 0.5s ease both',
    }}>
      <Link href="/" style={{ color: '#a78bfa', fontSize: '18px', fontWeight: 500, textDecoration: 'none' }}>
        BrainBlitz
      </Link>

      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        {mounted && user ? (
          <>
            <span style={{ color: '#c4b5fd', fontSize: '13px' }}>Hi, {user.name}</span>

            {/* Role badge */}
            <span style={{
              fontSize: '11px', padding: '2px 8px', borderRadius: '20px', fontWeight: 500,
              background: user.role === 'superadmin' ? '#FAEEDA' :
                          user.role === 'admin' ? '#FCEBEB' :
                          user.role === 'creator' ? '#EEEDFE' : '#E1F5EE',
              color: user.role === 'superadmin' ? '#854F0B' :
                     user.role === 'admin' ? '#A32D2D' :
                     user.role === 'creator' ? '#3C3489' : '#085041',
            }}>
              {user.role}
            </span>

            <Link href="/quizzes" style={{ color: '#c4b5fd', fontSize: '13px', textDecoration: 'none' }}>
              Quizzes
            </Link>

            <Link href="/join" style={{ color: '#c4b5fd', fontSize: '13px', textDecoration: 'none' }}>
              Join
            </Link>

            {['creator', 'admin', 'superadmin'].includes(user.role) && (
              <Link href="/creator" style={{ color: '#a78bfa', fontSize: '13px', textDecoration: 'none' }}>
                My Quizzes
              </Link>
            )}

            {['admin', 'superadmin'].includes(user.role) && (
              <Link href="/admin" style={{ color: '#a78bfa', fontSize: '13px', textDecoration: 'none' }}>
                Admin
              </Link>
            )}

            {user.role === 'superadmin' && (
              <Link href="/superadmin" style={{ color: '#FAC775', fontSize: '13px', textDecoration: 'none' }}>
                Super Admin
              </Link>
            )}

            {/* Notification bell */}
            <Link href="/notifications" style={{ position: 'relative', textDecoration: 'none' }}>
              <span style={{ fontSize: '16px' }}>🔔</span>
              {unread > 0 && (
                <span style={{
                  position: 'absolute', top: '-6px', right: '-6px',
                  background: '#E24B4A', color: 'white',
                  fontSize: '10px', fontWeight: 500,
                  width: '16px', height: '16px', borderRadius: '50%',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  {unread}
                </span>
              )}
            </Link>

            <button onClick={handleLogout} style={{
              background: '#7c3aed', color: 'white', border: 'none',
              padding: '6px 16px', borderRadius: '8px', fontSize: '13px', cursor: 'pointer',
            }}>
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