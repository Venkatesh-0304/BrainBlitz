'use client';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import API from '@/lib/axios';
import PrivateRoute from '@/components/PrivateRoute';

export default function Leaderboard() {
  const { quizId } = useParams();
  const router = useRouter();
  const [scores, setScores] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const { data } = await API.get(`/quizzes/leaderboard/${quizId}`);
        setScores(data);
      } catch (err) {
        console.error('Failed to fetch leaderboard', err);
      } finally {
        setLoading(false);
      }
    };
    fetchLeaderboard();
  }, [quizId]);

  const getMedal = (i) => i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `${i + 1}.`;

  const rowBg = (i) => i === 0 ? '#FAEEDA' : i === 1 ? '#F1EFE8' : i === 2 ? '#FAECE7' : 'var(--color-background-primary)';
  const rowBorder = (i) => i === 0 ? '#FAC775' : i === 1 ? '#D3D1C7' : i === 2 ? '#F5C4B3' : 'var(--color-border-tertiary)';

  return (
    <PrivateRoute>
      <div style={{ maxWidth: '580px', margin: '0 auto' }}>
        <h2 style={{ fontSize: '22px', fontWeight: 500, color: 'var(--color-text-primary)', marginBottom: '4px', animation: 'fadeInUp 0.5s ease both' }}>
          Leaderboard
        </h2>
        <p style={{ fontSize: '14px', color: 'var(--color-text-secondary)', marginBottom: '24px', animation: 'fadeInUp 0.5s ease 0.1s both' }}>
          Top 10 scores
        </p>

        {loading && <p style={{ color: 'var(--color-text-secondary)', fontSize: '14px' }}>Loading...</p>}

        {!loading && scores.length === 0 && (
          <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--color-text-secondary)' }}>
            <p style={{ fontSize: '40px', marginBottom: '12px' }}>🏅</p>
            <p>No scores yet! Be the first to take this quiz.</p>
          </div>
        )}

        {scores.map((s, i) => (
          <div key={s._id} style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '14px 18px', borderRadius: '10px', marginBottom: '8px',
            background: rowBg(i), border: `0.5px solid ${rowBorder(i)}`,
            animation: `slideInLeft 0.4s ease ${i * 0.1 + 0.2}s both`,
            transition: 'transform 0.2s',
          }}
            onMouseEnter={e => e.currentTarget.style.transform = 'translateX(4px)'}
            onMouseLeave={e => e.currentTarget.style.transform = 'translateX(0)'}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
              <span style={{ fontSize: '20px', width: '28px' }}>{getMedal(i)}</span>
              <span style={{ fontSize: '14px', fontWeight: 500, color: 'var(--color-text-primary)' }}>
                {s.userId?.name}
              </span>
            </div>
            <div style={{ textAlign: 'right' }}>
              <p style={{ fontSize: '15px', fontWeight: 500, color: '#7c3aed' }}>{s.score}/{s.total}</p>
              <p style={{ fontSize: '12px', color: 'var(--color-text-secondary)' }}>
                {Math.round((s.score / s.total) * 100)}%
              </p>
            </div>
          </div>
        ))}

        <button onClick={() => router.push('/quizzes')} style={{
          marginTop: '20px', background: '#7c3aed', color: 'white',
          border: 'none', padding: '10px 20px', borderRadius: '8px',
          fontSize: '14px', cursor: 'pointer', transition: 'background 0.2s',
        }}>
          Back to quizzes
        </button>
      </div>
    </PrivateRoute>
  );
}