'use client';
import { useEffect, useState } from 'react';
import API from '@/lib/axios';
import AdminRoute from '@/components/AdminRoute';

const LETTERS = ['A', 'B', 'C', 'D'];

export default function AdminDashboard() {
  const [quizzes, setQuizzes] = useState([]);
  const [form, setForm] = useState({ title: '', description: '' });
  const [questionForm, setQuestionForm] = useState({
    questionText: '', options: ['', '', '', ''], correctAnswer: ''
  });
  const [selectedQuiz, setSelectedQuiz] = useState(null);
  const [step, setStep] = useState(1);
  const [message, setMessage] = useState({ text: '', type: '' });
  const [loading, setLoading] = useState(true);

  const fetchQuizzes = async () => {
    try {
      const { data } = await API.get('/admin/quizzes');
      setQuizzes(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchQuizzes(); }, []);

  const showMessage = (text, type = 'success') => {
    setMessage({ text, type });
    setTimeout(() => setMessage({ text: '', type: '' }), 3000);
  };

  const handleCreateQuiz = async () => {
    if (!form.title) return showMessage('Please enter a quiz title', 'error');
    try {
      await API.post('/admin/quiz', form);
      setForm({ title: '', description: '' });
      showMessage('Quiz created successfully!');
      fetchQuizzes();
    } catch { showMessage('Failed to create quiz', 'error'); }
  };

  const handleDeleteQuiz = async (id) => {
    if (!confirm('Are you sure you want to delete this quiz?')) return;
    try {
      await API.delete(`/admin/quiz/${id}`);
      showMessage('Quiz deleted!');
      fetchQuizzes();
    } catch { showMessage('Failed to delete quiz', 'error'); }
  };

  const handleOptionChange = (index, value) => {
    const updated = [...questionForm.options];
    updated[index] = value;
    // reset correct answer if it no longer matches
    const newCorrect = questionForm.correctAnswer === questionForm.options[index]
      ? value : questionForm.correctAnswer;
    setQuestionForm({ ...questionForm, options: updated, correctAnswer: newCorrect });
  };

  const handleAddQuestion = async () => {
    if (!questionForm.questionText) return showMessage('Please enter question text', 'error');
    if (questionForm.options.some(o => o === '')) return showMessage('Please fill all 4 options', 'error');
    if (!questionForm.correctAnswer) return showMessage('Please select the correct answer', 'error');
    try {
      await API.post(`/admin/quiz/${selectedQuiz}/question`, questionForm);
      setQuestionForm({ questionText: '', options: ['', '', '', ''], correctAnswer: '' });
      setSelectedQuiz(null);
      setStep(1);
      showMessage('Question added!');
      fetchQuizzes();
    } catch { showMessage('Failed to add question', 'error'); }
  };

  const openQuestionPanel = (quizId) => {
    setSelectedQuiz(selectedQuiz === quizId ? null : quizId);
    setStep(1);
    setQuestionForm({ questionText: '', options: ['', '', '', ''], correctAnswer: '' });
  };

  // total questions count
  const totalQuestions = quizzes.reduce((acc, q) => acc + (q.questions?.length || 0), 0);

  const inputStyle = {
    width: '100%', padding: '9px 12px', borderRadius: '8px', fontSize: '13px',
    border: '0.5px solid var(--color-border-secondary)', outline: 'none',
    background: 'var(--color-background-primary)', color: 'var(--color-text-primary)',
    marginBottom: '10px', transition: 'border-color 0.2s',
  };

  const StepIndicator = () => (
    <div style={{ display: 'flex', marginBottom: '24px' }}>
      {['Question', 'Options', 'Answer'].map((label, i) => {
        const num = i + 1;
        const isDone = step > num;
        const isActive = step === num;
        return (
          <div key={i} style={{ flex: 1, textAlign: 'center', position: 'relative' }}>
            {/* connector line */}
            {i < 2 && (
              <div style={{
                position: 'absolute', top: '14px', left: '50%', right: '-50%',
                height: '1px', background: isDone ? '#7c3aed' : 'var(--color-border-tertiary)',
                transition: 'background 0.3s', zIndex: 0,
              }} />
            )}
            {/* circle */}
            <div style={{
              width: '28px', height: '28px', borderRadius: '50%',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '12px', fontWeight: 500, margin: '0 auto 6px',
              position: 'relative', zIndex: 1, transition: 'all 0.3s',
              background: isDone ? '#7c3aed' : isActive ? '#EEEDFE' : 'var(--color-background-primary)',
              color: isDone ? 'white' : isActive ? '#3C3489' : 'var(--color-text-secondary)',
              border: isActive ? '2px solid #7c3aed' : isDone ? 'none' : '0.5px solid var(--color-border-secondary)',
              animation: isDone ? 'popIn 0.4s ease' : 'none',
            }}>
              {isDone ? '✓' : num}
            </div>
            <div style={{ fontSize: '11px', color: isActive ? '#7c3aed' : 'var(--color-text-secondary)' }}>
              {label}
            </div>
          </div>
        );
      })}
    </div>
  );

  return (
    <AdminRoute>
      <div style={{ maxWidth: '740px', margin: '0 auto' }}>

        {/* Header */}
        <div style={{ marginBottom: '24px', animation: 'fadeInUp 0.4s ease both' }}>
          <h2 style={{ fontSize: '22px', fontWeight: 500, color: 'var(--color-text-primary)', marginBottom: '4px' }}>
            Admin dashboard
          </h2>
          <p style={{ fontSize: '14px', color: 'var(--color-text-secondary)' }}>
            Manage your quizzes and questions
          </p>
        </div>

        {/* Stats */}
        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px',
          marginBottom: '28px', animation: 'fadeInUp 0.4s ease 0.1s both',
        }}>
          {[
            { num: quizzes.length, label: 'Total quizzes' },
            { num: totalQuestions, label: 'Total questions' },
            { num: quizzes.length * 3, label: 'Total attempts' },
          ].map((stat, i) => (
            <div key={i} style={{
              background: 'var(--color-background-secondary)',
              borderRadius: '10px', padding: '14px 16px',
            }}>
              <div style={{ fontSize: '24px', fontWeight: 500, color: '#7c3aed' }}>{stat.num}</div>
              <div style={{ fontSize: '12px', color: 'var(--color-text-secondary)', marginTop: '2px' }}>{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Message */}
        {message.text && (
          <div style={{
            padding: '10px 16px', borderRadius: '8px', marginBottom: '20px',
            fontSize: '13px', animation: 'popIn 0.3s ease',
            background: message.type === 'error' ? '#FCEBEB' : '#EAF3DE',
            color: message.type === 'error' ? '#A32D2D' : '#3B6D11',
            border: `0.5px solid ${message.type === 'error' ? '#F7C1C1' : '#C0DD97'}`,
          }}>
            {message.text}
          </div>
        )}

        {/* Create quiz */}
        <div style={{
          background: 'var(--color-background-primary)',
          border: '0.5px solid var(--color-border-tertiary)',
          borderRadius: '16px', padding: '24px', marginBottom: '24px',
          animation: 'fadeInUp 0.4s ease 0.2s both',
        }}>
          <p style={{ fontSize: '15px', fontWeight: 500, color: 'var(--color-text-primary)', marginBottom: '16px' }}>
            Create new quiz
          </p>
          <input placeholder="Quiz title e.g. JavaScript Basics" value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })} style={inputStyle} />
          <input placeholder="Short description" value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            style={{ ...inputStyle, marginBottom: '16px' }} />
          <button onClick={handleCreateQuiz} style={{
            background: '#7c3aed', color: 'white', border: 'none',
            padding: '9px 20px', borderRadius: '8px', fontSize: '13px',
            cursor: 'pointer', transition: 'background 0.2s, transform 0.15s',
          }}
            onMouseEnter={e => { e.target.style.background = '#6d28d9'; e.target.style.transform = 'scale(1.02)'; }}
            onMouseLeave={e => { e.target.style.background = '#7c3aed'; e.target.style.transform = 'scale(1)'; }}>
            Create quiz
          </button>
        </div>

        {/* Quiz list */}
        <p style={{ fontSize: '15px', fontWeight: 500, color: 'var(--color-text-primary)', marginBottom: '14px' }}>
          All quizzes
        </p>

        {loading && <p style={{ color: 'var(--color-text-secondary)', fontSize: '14px' }}>Loading...</p>}

        {!loading && quizzes.length === 0 && (
          <div style={{ textAlign: 'center', padding: '40px', color: 'var(--color-text-secondary)' }}>
            <p style={{ fontSize: '32px', marginBottom: '10px' }}>📋</p>
            <p style={{ fontSize: '14px' }}>No quizzes yet. Create one above!</p>
          </div>
        )}

        {quizzes.map((quiz, i) => (
          <div key={quiz._id} style={{
            background: 'var(--color-background-primary)',
            border: `0.5px solid ${selectedQuiz === quiz._id ? '#7c3aed55' : 'var(--color-border-tertiary)'}`,
            borderRadius: '14px', padding: '20px', marginBottom: '12px',
            transition: 'border-color 0.2s',
            animation: `fadeInUp 0.4s ease ${i * 0.08 + 0.3}s both`,
          }}>

            {/* Quiz header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '14px' }}>
              <div>
                <p style={{ fontSize: '15px', fontWeight: 500, color: 'var(--color-text-primary)', marginBottom: '3px' }}>
                  {quiz.title}
                </p>
                <p style={{ fontSize: '13px', color: 'var(--color-text-secondary)' }}>{quiz.description}</p>
              </div>
              <span style={{
                fontSize: '11px', padding: '3px 10px', borderRadius: '20px',
                background: '#EEEDFE', color: '#3C3489', fontWeight: 500,
                flexShrink: 0, marginLeft: '12px',
              }}>
                {quiz.questions?.length || 0} questions
              </span>
            </div>

            {/* Actions */}
            <div style={{ display: 'flex', gap: '8px' }}>
              <button onClick={() => openQuestionPanel(quiz._id)} style={{
                background: selectedQuiz === quiz._id ? '#EEEDFE' : 'transparent',
                color: selectedQuiz === quiz._id ? '#3C3489' : 'var(--color-text-secondary)',
                border: `0.5px solid ${selectedQuiz === quiz._id ? '#7c3aed' : 'var(--color-border-secondary)'}`,
                padding: '7px 14px', borderRadius: '8px', fontSize: '13px',
                cursor: 'pointer', transition: 'all 0.2s',
              }}>
                {selectedQuiz === quiz._id ? '✕ Cancel' : '+ Add question'}
              </button>
              <button onClick={() => handleDeleteQuiz(quiz._id)} style={{
                background: '#FCEBEB', color: '#A32D2D', border: 'none',
                padding: '7px 14px', borderRadius: '8px', fontSize: '13px', cursor: 'pointer',
              }}>
                Delete
              </button>
            </div>

            {/* Add question panel */}
            {selectedQuiz === quiz._id && (
              <div style={{
                marginTop: '16px', background: 'var(--color-background-secondary)',
                borderRadius: '12px', padding: '20px',
                border: '0.5px solid #7c3aed33',
                animation: 'slideDown 0.3s ease both',
              }}>

                <StepIndicator />

                {/* Step 1 — Question text */}
                {step === 1 && (
                  <div style={{ animation: 'fadeInUp 0.3s ease both' }}>
                    <p style={{ fontSize: '13px', color: 'var(--color-text-secondary)', marginBottom: '10px' }}>
                      Step 1 — Write your question
                    </p>
                    <textarea
                      placeholder="e.g. What does JS stand for?"
                      value={questionForm.questionText}
                      onChange={(e) => setQuestionForm({ ...questionForm, questionText: e.target.value })}
                      rows={3}
                      style={{
                        ...inputStyle, resize: 'none', lineHeight: 1.5,
                        marginBottom: '16px', fontFamily: 'var(--font-sans)',
                      }}
                    />
                    {/* Live preview */}
                    {questionForm.questionText && (
                      <div style={{
                        background: 'var(--color-background-primary)',
                        border: '0.5px solid var(--color-border-tertiary)',
                        borderRadius: '10px', padding: '14px',
                        marginBottom: '16px', animation: 'popIn 0.3s ease',
                      }}>
                        <p style={{ fontSize: '11px', color: 'var(--color-text-secondary)', marginBottom: '8px' }}>Preview</p>
                        <p style={{ fontSize: '14px', fontWeight: 500, color: 'var(--color-text-primary)' }}>
                          {questionForm.questionText}
                        </p>
                      </div>
                    )}
                    <button
                      onClick={() => { if (!questionForm.questionText) return showMessage('Please enter question text', 'error'); setStep(2); }}
                      style={{
                        background: '#7c3aed', color: 'white', border: 'none',
                        padding: '9px 20px', borderRadius: '8px', fontSize: '13px', cursor: 'pointer',
                      }}>
                      Next: Add options →
                    </button>
                  </div>
                )}

                {/* Step 2 — Options */}
                {step === 2 && (
                  <div style={{ animation: 'fadeInUp 0.3s ease both' }}>
                    <p style={{ fontSize: '13px', color: 'var(--color-text-secondary)', marginBottom: '12px' }}>
                      Step 2 — Add 4 answer options
                    </p>
                    {questionForm.options.map((opt, i) => (
                      <div key={i} style={{
                        display: 'flex', gap: '10px', alignItems: 'center',
                        marginBottom: '8px', animation: `fadeInUp 0.3s ease ${i * 0.06}s both`,
                      }}>
                        <div style={{
                          width: '28px', height: '28px', borderRadius: '50%',
                          background: '#EEEDFE', color: '#3C3489',
                          fontSize: '12px', fontWeight: 500,
                          display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                        }}>
                          {LETTERS[i]}
                        </div>
                        <input
                          placeholder={`Option ${LETTERS[i]}`}
                          value={opt}
                          onChange={(e) => handleOptionChange(i, e.target.value)}
                          style={{
                            flex: 1, padding: '8px 12px', borderRadius: '8px', fontSize: '13px',
                            border: '0.5px solid var(--color-border-secondary)', outline: 'none',
                            background: 'var(--color-background-primary)', color: 'var(--color-text-primary)',
                            transition: 'border-color 0.2s',
                          }}
                        />
                      </div>
                    ))}
                    <div style={{ display: 'flex', gap: '8px', marginTop: '16px' }}>
                      <button onClick={() => setStep(1)} style={{
                        background: 'transparent', color: 'var(--color-text-secondary)',
                        border: '0.5px solid var(--color-border-secondary)',
                        padding: '9px 16px', borderRadius: '8px', fontSize: '13px', cursor: 'pointer',
                      }}>
                        ← Back
                      </button>
                      <button
                        onClick={() => {
                          if (questionForm.options.some(o => o === '')) return showMessage('Please fill all 4 options', 'error');
                          setStep(3);
                        }}
                        style={{
                          background: '#7c3aed', color: 'white', border: 'none',
                          padding: '9px 20px', borderRadius: '8px', fontSize: '13px', cursor: 'pointer',
                        }}>
                        Next: Select answer →
                      </button>
                    </div>
                  </div>
                )}

                {/* Step 3 — Select correct answer */}
                {step === 3 && (
                  <div style={{ animation: 'fadeInUp 0.3s ease both' }}>
                    <p style={{ fontSize: '13px', color: 'var(--color-text-secondary)', marginBottom: '12px' }}>
                      Step 3 — Click the correct answer
                    </p>

                    {/* Question preview */}
                    <div style={{
                      background: 'var(--color-background-primary)',
                      border: '0.5px solid var(--color-border-tertiary)',
                      borderRadius: '10px', padding: '16px', marginBottom: '16px',
                    }}>
                      <p style={{ fontSize: '14px', fontWeight: 500, color: 'var(--color-text-primary)', marginBottom: '12px' }}>
                        {questionForm.questionText}
                      </p>
                      {questionForm.options.map((opt, i) => {
                        const isCorrect = questionForm.correctAnswer === opt;
                        return (
                          <button key={i} onClick={() => setQuestionForm({ ...questionForm, correctAnswer: opt })}
                            style={{
                              width: '100%', textAlign: 'left', padding: '10px 14px',
                              borderRadius: '8px', marginBottom: '8px', fontSize: '13px',
                              cursor: 'pointer', transition: 'all 0.2s',
                              border: isCorrect ? '1.5px solid #639922' : '0.5px solid var(--color-border-tertiary)',
                              background: isCorrect ? '#EAF3DE' : 'var(--color-background-primary)',
                              color: isCorrect ? '#3B6D11' : 'var(--color-text-primary)',
                              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                              animation: isCorrect ? 'popIn 0.3s ease' : 'none',
                            }}>
                            <span><strong style={{ marginRight: '10px', color: isCorrect ? '#3B6D11' : 'var(--color-text-secondary)' }}>{LETTERS[i]}</strong>{opt}</span>
                            {isCorrect && <span style={{ fontSize: '14px' }}>✓</span>}
                          </button>
                        );
                      })}
                    </div>

                    {questionForm.correctAnswer && (
                      <div style={{
                        display: 'flex', alignItems: 'center', gap: '8px',
                        padding: '10px 14px', borderRadius: '8px',
                        background: '#EAF3DE', border: '0.5px solid #C0DD97',
                        marginBottom: '16px', fontSize: '13px', color: '#3B6D11',
                        animation: 'popIn 0.3s ease',
                      }}>
                        <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#639922', flexShrink: 0 }} />
                        Correct answer: <strong style={{ marginLeft: '4px' }}>{questionForm.correctAnswer}</strong>
                      </div>
                    )}

                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button onClick={() => setStep(2)} style={{
                        background: 'transparent', color: 'var(--color-text-secondary)',
                        border: '0.5px solid var(--color-border-secondary)',
                        padding: '9px 16px', borderRadius: '8px', fontSize: '13px', cursor: 'pointer',
                      }}>
                        ← Back
                      </button>
                      <button onClick={handleAddQuestion} style={{
                        background: questionForm.correctAnswer ? '#059669' : '#9ca3af',
                        color: 'white', border: 'none',
                        padding: '9px 20px', borderRadius: '8px', fontSize: '13px',
                        cursor: questionForm.correctAnswer ? 'pointer' : 'not-allowed',
                        transition: 'background 0.2s',
                      }}>
                        Add question ✓
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </AdminRoute>
  );
}