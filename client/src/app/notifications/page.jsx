'use client';
import { useEffect, useState } from 'react';
import API from '@/lib/axios';
import PrivateRoute from '@/components/PrivateRoute';

export default function Notifications() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchNotifications = async () => {
    try {
      const { data } = await API.get('/notifications');
      setNotifications(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchNotifications(); }, []);

  const markAllRead = async () => {
    await API.put('/notifications/read/all');
    fetchNotifications();
  };

  const markRead = async (id) => {
    await API.put(`/notifications/${id}/read`);
    fetchNotifications();
  };

  return (
    <PrivateRoute>
      <div style={{ maxWidth: '640px', margin: '0 auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <div>
            <h2 style={{ fontSize: '22px', fontWeight: 500, color: 'var(--color-text-primary)', marginBottom: '4px' }}>
              Notifications
            </h2>
            <p style={{ fontSize: '14px', color: 'var(--color-text-secondary)' }}>
              {notifications.filter(n => !n.read).length} unread
            </p>
          </div>
          {notifications.some(n => !n.read) && (
            <button onClick={markAllRead} style={{
              background: 'transparent', color: '#7c3aed',
              border: '0.5px solid #7c3aed',
              padding: '7px 14px', borderRadius: '8px',
              fontSize: '13px', cursor: 'pointer',
            }}>
              Mark all read
            </button>
          )}
        </div>

        {loading && <p style={{ color: 'var(--color-text-secondary)' }}>Loading...</p>}

        {!loading && notifications.length === 0 && (
          <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--color-text-secondary)' }}>
            <p style={{ fontSize: '40px', marginBottom: '12px' }}>🔔</p>
            <p>No notifications yet!</p>
          </div>
        )}

        {notifications.map((n, i) => (
          <div key={n._id} onClick={() => !n.read && markRead(n._id)} style={{
            padding: '16px 20px',
            borderRadius: '12px', marginBottom: '10px',
            border: `0.5px solid ${n.read ? 'var(--color-border-tertiary)' : '#7c3aed44'}`,
            background: n.read ? 'var(--color-background-primary)' : '#EEEDFE',
            cursor: n.read ? 'default' : 'pointer',
            animation: `slideInLeft 0.4s ease ${i * 0.05}s both`,
            transition: 'all 0.2s',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <p style={{ fontSize: '14px', color: 'var(--color-text-primary)', marginBottom: '4px' }}>
                  {n.message}
                </p>
                <p style={{ fontSize: '12px', color: 'var(--color-text-secondary)' }}>
                  From: {n.from?.name} • {new Date(n.createdAt).toLocaleDateString()}
                </p>
                {n.quizId && (
                  <p style={{ fontSize: '12px', color: '#7c3aed', marginTop: '4px' }}>
                    Quiz: {n.quizId?.title}
                  </p>
                )}
              </div>
              {!n.read && (
                <div style={{
                  width: '8px', height: '8px', borderRadius: '50%',
                  background: '#7c3aed', flexShrink: 0, marginTop: '4px',
                }} />
              )}
            </div>
          </div>
        ))}
      </div>
    </PrivateRoute>
  );
}