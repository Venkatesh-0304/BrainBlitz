'use client';
import { useSearchParams, useRouter } from 'next/navigation';
import PrivateRoute from '@/components/PrivateRoute';
import { Suspense } from 'react';

function ResultContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const raw = searchParams.get('data');
  const state = raw ? JSON.parse(decodeURIComponent(raw)) : null;

  if (!state) return (
    <div style={{ textAlign: 'center', marginTop: '60px' }}>
      <p style={{ color: 'var(--color-text-secondary)', marginBottom: '16px' }}>No result found.</p>
      <button onClick={() => router.push('/quizzes')} style={{ background: '#7c3aed', color: 'white', border: 'none', padding: '9px 18px', borderRadius: '8px', cursor: 'pointer' }}>
        Back to quizzes
      </button>
    </div>
  );

  const getEmoji = (p) => p === 100 ? '🏆' : p >= 80 ? '🎉' : p >= 60 ? '👍' : p >= 40 ? '😐' : '😢';
  const getMessage = (p) => p === 100 ? 'Perfect score!' : p >= 80 ? 'Great job!' : p >= 60 ? 'Not bad!' : p >= 40 ? 'Keep practicing!' : 'Better luck next time!';

  return (
    <PrivateRoute>
      <div style={{ maxWidth: '620px', margin: '0 auto' }}>

        {/* Hero score card */}
        <div style={{
          background: '#1a1a2e',
          borderRadius: '20px',
          padding: '48px 40px',
          textAlign: 'center',
          marginBottom: '32px',
          animation: 'fadeInUp 0.5s ease both',
          position: 'relative',
          overflow: 'hidden',
        }}>
          {/* Decorative circle */}
          <div style={{
            position: 'absolute', top: '-40px', right: '-40px',
            width: '160px', height: '160px', borderRadius: '50%',
            background: '#7c3aed22',
          }} />
          <div style={{
            position: 'absolute', bottom: '-30px', left: '-30px',
            width: '120px', height: '120px', borderRadius: '50%',
            background: '#a78bfa11',
          }} />

          {/* Emoji */}
          <div style={{ fontSize: '52px', marginBottom: '16px' }}>
            {getEmoji(state.percentage)}
          </div>

          {/* Score circle */}
          <div style={{
            width: '120px', height: '120px', borderRadius: '50%',
            border: '3px solid #7c3aed',
            display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 20px',
            animation: 'countUp 0.6s ease 0.2s both',
            background: '#ffffff0f',
          }}>
            <span style={{ fontSize: '32px', fontWeight: 500, color: '#a78bfa' }}>
              {state.percentage}%
            </span>
          </div>

          <h2 style={{ fontSize: '20px', fontWeight: 500, color: 'white', marginBottom: '8px' }}>
            {getMessage(state.percentage)}
          </h2>
          <p style={{ fontSize: '14px', color: '#c4b5fd' }}>
            You got <strong style={{ color: 'white' }}>{state.score}</strong> out of <strong style={{ color: 'white' }}>{state.total}</strong> correct
          </p>

          {/* Score bar */}
          <div style={{
            background: '#2d2d4e', borderRadius: '20px',
            height: '6px', marginTop: '24px',
          }}>
            <div style={{
              background: 'linear-gradient(90deg, #7c3aed, #a78bfa)',
              height: '6px', borderRadius: '20px',
              width: `${state.percentage}%`,
              transition: 'width 1.2s ease 0.5s',
            }} />
          </div>

          {/* Stats row */}
          <div style={{
            display: 'flex', justifyContent: 'center', gap: '32px', marginTop: '24px',
          }}>
            <div>
              <p style={{ fontSize: '22px', fontWeight: 500, color: '#4ade80' }}>{state.score}</p>
              <p style={{ fontSize: '12px', color: '#c4b5fd' }}>Correct</p>
            </div>
            <div style={{ width: '1px', background: '#ffffff22' }} />
            <div>
              <p style={{ fontSize: '22px', fontWeight: 500, color: '#f87171' }}>{state.total - state.score}</p>
              <p style={{ fontSize: '12px', color: '#c4b5fd' }}>Wrong</p>
            </div>
            <div style={{ width: '1px', background: '#ffffff22' }} />
            <div>
              <p style={{ fontSize: '22px', fontWeight: 500, color: '#a78bfa' }}>{state.total}</p>
              <p style={{ fontSize: '12px', color: '#c4b5fd' }}>Total</p>
            </div>
          </div>
        </div>

        {/* Results breakdown */}
        <h3 style={{
          fontSize: '15px', fontWeight: 500,
          color: 'var(--color-text-primary)',
          marginBottom: '14px',
          animation: 'fadeInUp 0.5s ease 0.2s both',
        }}>
          Results breakdown
        </h3>

        {state.results.map((r, i) => (
          <div key={i} style={{
            borderRadius: '12px', marginBottom: '10px', overflow: 'hidden',
            border: `0.5px solid ${r.isCorrect ? '#C0DD97' : '#F7C1C1'}`,
            animation: `slideInLeft 0.4s ease ${i * 0.1 + 0.3}s both`,
          }}>
            {/* Question header */}
            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '12px 16px',
              background: r.isCorrect ? '#EAF3DE' : '#FCEBEB',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{
                  width: '24px', height: '24px', borderRadius: '50%',
                  background: r.isCorrect ? '#639922' : '#E24B4A',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: '12px', color: 'white', fontWeight: 500, flexShrink: 0,
                }}>
                  {i + 1}
                </div>
                <p style={{
                  fontSize: '13px', fontWeight: 500,
                  color: r.isCorrect ? '#3B6D11' : '#A32D2D',
                }}>
                  {r.questionText}
                </p>
              </div>
              <span style={{ fontSize: '16px', flexShrink: 0, marginLeft: '12px' }}>
                {r.isCorrect ? '✅' : '❌'}
              </span>
            </div>

            {/* Answer details */}
            <div style={{
              padding: '12px 16px',
              background: 'var(--color-background-primary)',
              display: 'flex', gap: '24px', flexWrap: 'wrap',
            }}>
              <div>
                <p style={{ fontSize: '11px', color: 'var(--color-text-secondary)', marginBottom: '3px' }}>
                  YOUR ANSWER
                </p>
                <p style={{
                  fontSize: '13px', fontWeight: 500,
                  color: r.isCorrect ? '#3B6D11' : '#A32D2D',
                }}>
                  {r.userAnswer}
                </p>
              </div>
              {!r.isCorrect && (
                <div>
                  <p style={{ fontSize: '11px', color: 'var(--color-text-secondary)', marginBottom: '3px' }}>
                    CORRECT ANSWER
                  </p>
                  <p style={{ fontSize: '13px', fontWeight: 500, color: '#3B6D11' }}>
                    {r.correctAnswer}
                  </p>
                </div>
              )}
            </div>
          </div>
        ))}

        {/* Action buttons */}
        <div style={{ display: 'flex', gap: '10px', marginTop: '24px', animation: 'fadeInUp 0.5s ease 0.5s both' }}>
          <button onClick={() => router.push('/quizzes')} style={{
            background: '#7c3aed', color: 'white', border: 'none',
            padding: '10px 24px', borderRadius: '8px', fontSize: '14px',
            cursor: 'pointer', transition: 'background 0.2s',
          }}
            onMouseEnter={e => e.target.style.background = '#6d28d9'}
            onMouseLeave={e => e.target.style.background = '#7c3aed'}>
            Back to quizzes
          </button>
          <button onClick={() => router.back()} style={{
            background: 'transparent', color: 'var(--color-text-secondary)',
            border: '0.5px solid var(--color-border-secondary)',
            padding: '10px 24px', borderRadius: '8px', fontSize: '14px',
            cursor: 'pointer', transition: 'background 0.2s',
          }}
            onMouseEnter={e => e.target.style.background = 'var(--color-background-secondary)'}
            onMouseLeave={e => e.target.style.background = 'transparent'}>
            Try again
          </button>
        </div>

      </div>
    </PrivateRoute>
  );
}

export default function Result() {
  return (
    <Suspense fallback={<p style={{ textAlign: 'center', marginTop: '60px' }}>Loading result...</p>}>
      <ResultContent />
    </Suspense>
  );
}