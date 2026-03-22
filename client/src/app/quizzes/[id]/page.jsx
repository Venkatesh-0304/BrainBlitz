'use client';
import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import API from '@/lib/axios';
import PrivateRoute from '@/components/PrivateRoute';

export default function TakeQuiz() {
  const { id } = useParams();
  const router = useRouter();
  const [quiz, setQuiz] = useState(null);
  const [answers, setAnswers] = useState({});
  const [current, setCurrent] = useState(0);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchQuiz = async () => {
      try {
        const { data } = await API.get(`/quizzes/${id}`);
        setQuiz(data);
      } catch (err) {
        console.error('Failed to fetch quiz', err);
      } finally {
        setLoading(false);
      }
    };
    fetchQuiz();
  }, [id]);

  const handleAnswer = (questionId, answer) => {
    setAnswers({ ...answers, [questionId]: answer });
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      const formatted = Object.entries(answers).map(([questionId, answer]) => ({ questionId, answer }));
      const { data } = await API.post(`/quizzes/${id}/submit`, { answers: formatted });
      router.push(`/result?data=${encodeURIComponent(JSON.stringify(data))}`);
    } catch (err) {
      console.error('Submit failed', err);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <p style={{ textAlign: 'center', marginTop: '60px', color: 'var(--color-text-secondary)' }}>Loading quiz...</p>;
  if (!quiz) return <p style={{ textAlign: 'center', marginTop: '60px', color: '#E24B4A' }}>Quiz not found!</p>;
  if (quiz.questions.length === 0) return (
    <div style={{ textAlign: 'center', marginTop: '60px' }}>
      <p style={{ color: 'var(--color-text-secondary)', marginBottom: '16px' }}>This quiz has no questions yet!</p>
      <button onClick={() => router.push('/quizzes')} style={{ background: '#7c3aed', color: 'white', border: 'none', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer' }}>
        Back to Quizzes
      </button>
    </div>
  );

  const question = quiz.questions[current];
  const progress = ((current + 1) / quiz.questions.length) * 100;
  const isAnswered = !!answers[question._id];
  const isLast = current === quiz.questions.length - 1;

  return (
    <PrivateRoute>
      <div style={{ maxWidth: '640px', margin: '0 auto', animation: 'fadeInUp 0.5s ease both' }}>

        <h2 style={{ fontSize: '22px', fontWeight: 500, color: 'var(--color-text-primary)', marginBottom: '4px' }}>
          {quiz.title}
        </h2>
        <p style={{ fontSize: '13px', color: 'var(--color-text-secondary)', marginBottom: '20px' }}>
          Question {current + 1} of {quiz.questions.length}
        </p>

        {/* Progress bar */}
        <div style={{ background: 'var(--color-background-secondary)', borderRadius: '20px', height: '6px', marginBottom: '28px' }}>
          <div style={{
            background: 'linear-gradient(90deg, #7c3aed, #a78bfa)',
            height: '6px', borderRadius: '20px',
            width: `${progress}%`, transition: 'width 0.4s ease',
          }} />
        </div>

        {/* Question card */}
        <div style={{
          background: 'var(--color-background-primary)',
          border: '0.5px solid var(--color-border-tertiary)',
          borderRadius: '16px', padding: '28px', marginBottom: '20px',
        }}>
          <p style={{ fontSize: '16px', fontWeight: 500, color: 'var(--color-text-primary)', marginBottom: '24px', lineHeight: 1.6 }}>
            {question.questionText}
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {question.options.map((option, i) => {
              const isSelected = answers[question._id] === option;
              return (
                <button key={i} onClick={() => handleAnswer(question._id, option)} style={{
                  border: isSelected ? '1.5px solid #7c3aed' : '0.5px solid var(--color-border-tertiary)',
                  borderRadius: '10px', padding: '13px 16px', textAlign: 'left',
                  fontSize: '14px', cursor: 'pointer',
                  background: isSelected ? '#EEEDFE' : 'var(--color-background-primary)',
                  color: isSelected ? '#3C3489' : 'var(--color-text-primary)',
                  transition: 'all 0.2s ease',
                }}
                  onMouseEnter={e => { if (!isSelected) { e.currentTarget.style.borderColor = '#7c3aed55'; e.currentTarget.style.transform = 'translateX(4px)'; } }}
                  onMouseLeave={e => { if (!isSelected) { e.currentTarget.style.borderColor = 'var(--color-border-tertiary)'; e.currentTarget.style.transform = 'translateX(0)'; } }}>
                  {option}
                </button>
              );
            })}
          </div>
        </div>

        {/* Navigation */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <button onClick={() => setCurrent(current - 1)} disabled={current === 0} style={{
            background: 'transparent', color: 'var(--color-text-secondary)',
            border: '0.5px solid var(--color-border-secondary)',
            padding: '9px 18px', borderRadius: '8px', fontSize: '13px',
            cursor: current === 0 ? 'not-allowed' : 'pointer', opacity: current === 0 ? 0.4 : 1,
          }}>
            ← Previous
          </button>

          {isLast ? (
            <button onClick={handleSubmit} disabled={submitting || !isAnswered} style={{
              background: isAnswered ? '#059669' : '#9ca3af',
              color: 'white', border: 'none',
              padding: '9px 20px', borderRadius: '8px', fontSize: '13px',
              cursor: isAnswered ? 'pointer' : 'not-allowed',
            }}>
              {submitting ? 'Submitting...' : 'Submit quiz'}
            </button>
          ) : (
            <button onClick={() => setCurrent(current + 1)} disabled={!isAnswered} style={{
              background: isAnswered ? '#7c3aed' : '#9ca3af',
              color: 'white', border: 'none',
              padding: '9px 18px', borderRadius: '8px', fontSize: '13px',
              cursor: isAnswered ? 'pointer' : 'not-allowed',
            }}>
              Next →
            </button>
          )}
        </div>

        {!isAnswered && (
          <p style={{ textAlign: 'center', fontSize: '12px', color: 'var(--color-text-secondary)', marginTop: '14px' }}>
            Select an answer to continue
          </p>
        )}
      </div>
    </PrivateRoute>
  );
}
