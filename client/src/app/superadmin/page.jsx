'use client';
import { useEffect, useState } from 'react';
import API from '@/lib/axios';
import SuperAdminRoute from '@/components/SuperAdminRoute.jsx';

const ROLES = ['player', 'creator', 'admin', 'superadmin'];

const roleColor = (role) => {
  if (role === 'superadmin') return { bg: '#FAEEDA', color: '#854F0B' };
  if (role === 'admin') return { bg: '#FCEBEB', color: '#A32D2D' };
  if (role === 'creator') return { bg: '#EEEDFE', color: '#3C3489' };
  return { bg: '#E1F5EE', color: '#085041' };
};

export default function SuperAdmin() {
  const [users, setUsers] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');

  const fetchData = async () => {
    try {
      const [usersRes, statsRes] = await Promise.all([
        API.get('/superadmin/users'),
        API.get('/superadmin/stats'),
      ]);
      setUsers(usersRes.data);
      setStats(statsRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const showMessage = (msg) => {
    setMessage(msg);
    setTimeout(() => setMessage(''), 3000);
  };

  const handleRoleChange = async (userId, role) => {
    try {
      await API.put(`/superadmin/user/${userId}/role`, { role });
      showMessage('Role updated successfully! ✅');
      fetchData();
    } catch (err) {
      showMessage('Failed to update role ❌');
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!confirm('Are you sure you want to delete this user?')) return;
    try {
      await API.delete(`/superadmin/user/${userId}`);
      showMessage('User deleted! 🗑️');
      fetchData();
    } catch (err) {
      showMessage('Failed to delete user ❌');
    }
  };

  return (
    <SuperAdminRoute>
      <div style={{ maxWidth: '800px', margin: '0 auto' }}>
        <h2 style={{ fontSize: '22px', fontWeight: 500, color: 'var(--color-text-primary)', marginBottom: '4px', animation: 'fadeInUp 0.4s ease both' }}>
          Super admin panel
        </h2>
        <p style={{ fontSize: '14px', color: 'var(--color-text-secondary)', marginBottom: '28px' }}>
          Full system control
        </p>

        {message && (
          <div style={{
            padding: '10px 16px', borderRadius: '8px', marginBottom: '20px',
            background: '#EAF3DE', color: '#3B6D11', fontSize: '13px',
            animation: 'popIn 0.3s ease',
          }}>
            {message}
          </div>
        )}

        {/* Stats */}
        {stats && (
          <div style={{
            display: 'grid', gridTemplateColumns: 'repeat(3 ,1fr)',
            gap: '12px', marginBottom: '28px',
            animation: 'fadeInUp 0.4s ease 0.1s both',
          }}>
            {[
              { label: 'Total users', value: stats.totalUsers },
              { label: 'Total quizzes', value: stats.totalQuizzes },
              { label: 'Total attempts', value: stats.totalScores },
            ].map((s, i) => (
              <div key={i} style={{
                background: 'var(--color-background-secondary)',
                borderRadius: '10px', padding: '14px 16px',
              }}>
                <div style={{ fontSize: '24px', fontWeight: 500, color: '#7c3aed' }}>{s.value}</div>
                <div style={{ fontSize: '12px', color: 'var(--color-text-secondary)', marginTop: '2px' }}>{s.label}</div>
              </div>
            ))}
          </div>
        )}

        {/* Users by role */}
        {stats?.usersByRole && (
          <div style={{
            display: 'flex', gap: '10px', marginBottom: '24px', flexWrap: 'wrap',
          }}>
            {stats.usersByRole.map((r, i) => {
              const c = roleColor(r._id);
              return (
                <div key={i} style={{
                  padding: '6px 14px', borderRadius: '20px',
                  background: c.bg, color: c.color, fontSize: '12px', fontWeight: 500,
                }}>
                  {r._id}: {r.count}
                </div>
              );
            })}
          </div>
        )}

        {/* Users list */}
        <h3 style={{ fontSize: '15px', fontWeight: 500, color: 'var(--color-text-primary)', marginBottom: '14px' }}>
          All users
        </h3>

        {loading && <p style={{ color: 'var(--color-text-secondary)', fontSize: '14px' }}>Loading...</p>}

        {users.map((user, i) => {
          const c = roleColor(user.role);
          return (
            <div key={user._id} style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '14px 18px', borderRadius: '12px', marginBottom: '8px',
              background: 'var(--color-background-primary)',
              border: '0.5px solid var(--color-border-tertiary)',
              animation: `fadeInUp 0.4s ease ${i * 0.05}s both`,
            }}>
              <div>
                <p style={{ fontSize: '14px', fontWeight: 500, color: 'var(--color-text-primary)', marginBottom: '3px' }}>
                  {user.name}
                </p>
                <p style={{ fontSize: '12px', color: 'var(--color-text-secondary)' }}>{user.email}</p>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                {/* Role selector */}
                <select
                  value={user.role}
                  onChange={(e) => handleRoleChange(user._id, e.target.value)}
                  style={{
                    padding: '5px 10px', borderRadius: '8px', fontSize: '12px',
                    border: '0.5px solid var(--color-border-secondary)',
                    background: c.bg, color: c.color, cursor: 'pointer', outline: 'none',
                  }}>
                  {ROLES.map(r => (
                    <option key={r} value={r}>{r}</option>
                  ))}
                </select>

                <button onClick={() => handleDeleteUser(user._id)} style={{
                  background: '#FCEBEB', color: '#A32D2D', border: 'none',
                  padding: '5px 12px', borderRadius: '8px',
                  fontSize: '12px', cursor: 'pointer',
                }}>
                  Delete
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </SuperAdminRoute>
  );
}