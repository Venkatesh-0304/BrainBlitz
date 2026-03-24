'use client';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import socket from '@/lib/socket';
import API from '@/lib/axios';
import PrivateRoute from '@/components/PrivateRoute';

export default function Lobby() {
  const { id } = useParams();
  const { user } = useAuth();
  const router = useRouter();
  const [quiz, setQuiz] = useState(null);
  const [players, setPlayers] = useState([]);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchQuiz();
  }, [id]);

  const fetchQuiz = async () => {
    try {
      const { data } = await API.get(`/live/join/link/${id}`);
      setQuiz(data.quiz);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!user) return;

    socket.connect();

    // join the room as player
    socket.emit('join-quiz-room', {
      quizId: id,
      userId: user.id,
      userName: user.name,
      role: 'player',
    });

    // another player joined
    socket.on('player-joined', ({ userName }) => {
      setMessage(`${userName} joined!`);
      setPlayers(prev => [...prev.filter(p => p !== userName), userName]);
      setTimeout(() => setMessage(''), 3000);
    });

    // quiz started — redirect to live page
    socket.on('quiz-started', () => {
      router.push(`/live/${id}`);
    });

    // removed from quiz
    socket.on('player-removed', ({ userId }) => {
      if (userId === user.id) {
        router.push('/quizzes');
      }
    });

    return () => {
      socket.off('player-joined');
      socket.off('quiz-started');
      socket.off('player-removed');
      socket.disconnect();
    };
  }, [user, id]);

  if (loading) return <p style={{ textAlign: 'center', marginTop: '60px', color: 'var(--color-text-secondary)' }}>Loading...</p>;

  return (
    <PrivateRoute>
      <div style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{
          width: '100%', maxWidth: '480px', textAlign: 'center',
          animation: 'fadeInUp 0.5s ease both',
        }}>

          {/* Waiting animation */}
          <div style={{
            background: '#1a1a2e', borderRadius: '20px',
            padding: '48px 40px', marginBottom: '24px',
          }}>
            {/* Pulsing dot */}
            <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginBottom: '24px' }}>
              {[0, 1, 2].map(i => (
                <div key={i} style={{
                  width: '10px', height: '10px', borderRadius: '50%',
                  background: '#7c3aed',
                  animation: `pulse 1.2s ease-in-out ${i * 0.2}s infinite`,
                }} />
              ))}
            </div>

            <h2 style={{ fontSize: '22px', fontWeight: 500, color: 'white', marginBottom: '8px' }}>
              Waiting for host
            </h2>
            <p style={{ color: '#c4b5fd', fontSize: '14px', marginBottom: '24px' }}>
              The quiz will start soon...
            </p>

            {quiz && (
              <div style={{
                background: '#ffffff11', borderRadius: '12px',
                padding: '16px', marginBottom: '16px',
              }}>
                <p style={{ color: 'white', fontSize: '16px', fontWeight: 500, marginBottom: '4px' }}>
                  {quiz.title}
                </p>
                <p style={{ color: '#c4b5fd', fontSize: '13px' }}>
                  {quiz.description}
                </p>
              </div>
            )}

            {/* Player info */}
            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              gap: '8px', padding: '10px 16px',
              background: '#7c3aed22', borderRadius: '8px',
            }}>
              <div style={{
                width: '32px', height: '32px', borderRadius: '50%',
                background: '#7c3aed',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '14px', fontWeight: 500, color: 'white',
              }}>
                {user?.name?.[0]?.toUpperCase()}
              </div>
              <span style={{ color: '#c4b5fd', fontSize: '14px' }}>
                You joined as <strong style={{ color: 'white' }}>{user?.name}</strong>
              </span>
            </div>
          </div>

          {/* Join message */}
          {message && (
            <div style={{
              padding: '10px 16px', borderRadius: '8px',
              background: '#EAF3DE', color: '#3B6D11',
              fontSize: '13px', animation: 'popIn 0.3s ease',
              marginBottom: '16px',
            }}>
              {message}
            </div>
          )}

          <button onClick={() => router.push('/quizzes')} style={{
            background: 'transparent', color: 'var(--color-text-secondary)',
            border: '0.5px solid var(--color-border-secondary)',
            padding: '9px 20px', borderRadius: '8px',
            fontSize: '13px', cursor: 'pointer',
          }}>
            Leave lobby
          </button>
        </div>
      </div>

      {/* Pulse animation */}
      <style>{`
        @keyframes pulse {
          0%, 100% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.4); opacity: 0.5; }
        }
      `}</style>
    </PrivateRoute>
  );
}