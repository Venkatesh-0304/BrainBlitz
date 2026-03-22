'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import API from '@/lib/axios';
import PrivateRoute from '@/components/PrivateRoute';

const cardAccentColors = ['#7c3aed', '#0F6E56', '#185FA5', '#993556', '#854F0B'];

export default function QuizList() {
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchQuizzes = async () => {
      try {
        const { data } = await API.get('/quizzes');
        setQuizzes(data);
      } catch (err) {
        console.error('Failed to fetch quizzes', err);
      } finally {
        setLoading(false);
      }
    };
    fetchQuizzes();
  }, []);

  return (
    <PrivateRoute>
      <div>
        <h2 style={{ fontSize: '22px', fontWeight: 500, color: 'var(--color-text-primary)', marginBottom: '4px', animation: 'fadeInUp 0.5s ease both' }}>
          Available quizzes
        </h2>
        <p style={{ fontSize: '14px', color: 'var(--color-text-secondary)', marginBottom: '24px', animation: 'fadeInUp 0.5s ease 0.1s both' }}>
          Pick a quiz and test your knowledge
        </p>

        {loading && (
          <p style={{ color: 'var(--color-text-secondary)', fontSize: '14px' }}>Loading quizzes...</p>
        )}

        {!loading && quizzes.length === 0 && (
          <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--color-text-secondary)' }}>
            <p style={{ fontSize: '40px', marginBottom: '12px' }}>📭</p>
            <p>No quizzes available yet.</p>
          </div>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px' }}>
          {quizzes.map((quiz, i) => (
            <div key={quiz._id} style={{
              background: 'var(--color-background-primary)',
              border: '0.5px solid var(--color-border-tertiary)',
              borderRadius: '16px', padding: '20px',
              position: 'relative', overflow: 'hidden',
              cursor: 'pointer', transition: 'transform 0.25s ease, border-color 0.25s ease',
              animation: `fadeInUp 0.5s ease ${i * 0.1 + 0.2}s both`,
            }}
              onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.borderColor = '#7c3aed55'; }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.borderColor = 'var(--color-border-tertiary)'; }}>

              {/* Accent bar */}
              <div style={{
                position: 'absolute', top: 0, left: 0, right: 0, height: '3px',
                background: cardAccentColors[i % cardAccentColors.length],
              }} />

              <h3 style={{ fontSize: '16px', fontWeight: 500, color: 'var(--color-text-primary)', marginBottom: '8px', marginTop: '4px' }}>
                {quiz.title}
              </h3>
              <p style={{ fontSize: '13px', color: 'var(--color-text-secondary)', marginBottom: '16px', lineHeight: 1.5 }}>
                {quiz.description}
              </p>

              {/* Meta badges */}
              <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
                <span style={{ fontSize: '11px', padding: '3px 10px', borderRadius: '20px', background: '#EEEDFE', color: '#3C3489', fontWeight: 500 }}>
                  {quiz.questions?.length || 0} questions
                </span>
              </div>

              {/* Buttons */}
              <div style={{ display: 'flex', gap: '8px' }}>
                <button onClick={() => router.push(`/quizzes/${quiz._id}`)} style={{
                  background: '#7c3aed', color: 'white', border: 'none',
                  padding: '8px 16px', borderRadius: '8px', fontSize: '13px',
                  cursor: 'pointer', transition: 'background 0.2s, transform 0.15s',
                }}
                  onMouseEnter={e => e.target.style.background = '#6d28d9'}
                  onMouseLeave={e => e.target.style.background = '#7c3aed'}>
                  Take quiz
                </button>
                <button onClick={() => router.push(`/leaderboard/${quiz._id}`)} style={{
                  background: 'transparent', color: 'var(--color-text-secondary)',
                  border: '0.5px solid var(--color-border-secondary)',
                  padding: '8px 16px', borderRadius: '8px', fontSize: '13px',
                  cursor: 'pointer', transition: 'background 0.2s, transform 0.15s',
                }}
                  onMouseEnter={e => e.target.style.background = 'var(--color-background-secondary)'}
                  onMouseLeave={e => e.target.style.background = 'transparent'}>
                  Leaderboard
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </PrivateRoute>
  );
}