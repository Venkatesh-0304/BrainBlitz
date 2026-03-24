'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import API from '@/lib/axios';
import CreatorRoute from '@/components/CreatorRoute';

const LETTERS = ['A', 'B', 'C', 'D'];

export default function CreatorDashboard() {
  const [quizzes, setQuizzes] = useState([]);
  const [form, setForm] = useState({ title: '', description: '' });
  const [questionForm, setQuestionForm] = useState({
    questionText: '', options: ['', '', '', ''],
    correctAnswer: '', timeLimit: 30,
  });
  const [selectedQuiz, setSelectedQuiz] = useState(null);
  const [step, setStep] = useState(1);
  const [message, setMessage] = useState({ text: '', type: '' });
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const fetchQuizzes = async () => {
    try {
      const { data } = await API.get('/live/my');
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
      await API.post('/live/create', form);
      setForm({ title: '', description: '' });
      showMessage('Quiz created!');
      fetchQuizzes();
    } catch { showMessage('Failed to create quiz', 'error'); }
  };

  const handleDeleteQuiz = async (id) => {
    if (!confirm('Delete this quiz?')) return;
    try {
      await API.delete(`/live/${id}`);
      showMessage('Quiz deleted!');
      fetchQuizzes();
    } catch { showMessage('Failed to delete quiz', 'error'); }
  };

  const handleOptionChange = (index, value) => {
    const updated = [...questionForm.options];
    updated[index] = value;
    setQuestionForm({ ...questionForm, options: updated });
  };

  const handleAddQuestion = async () => {
    if (!questionForm.questionText) return showMessage('Please enter question text', 'error');
    if (questionForm.options.some(o => o === '')) return showMessage('Fill all 4 options', 'error');
    if (!questionForm.correctAnswer) return showMessage('Select correct answer', 'error');
    if (!questionForm.options.includes(questionForm.correctAnswer)) {
      return showMessage('Correct answer must match an option', 'error');
    }
    try {
      await API.post(`/live/${selectedQuiz}/question`, questionForm);
      setQuestionForm({ questionText: '', options: ['', '', '', ''], correctAnswer: '', timeLimit: 30 });
      setSelectedQuiz(null);
      setStep(1);
      showMessage('Question added!');
      fetchQuizzes();
    } catch { showMessage('Failed to add question', 'error'); }
  };

  const handleAllowPlayer = async (quizId, userId) => {
    try {
      await API.post(`/live/${quizId}/allow/${userId}`);
      showMessage('Player allowed!');
      fetchQuizzes();
    } catch { showMessage('Failed to allow player', 'error'); }
  };

  const handleRemovePlayer = async (quizId, userId) => {
    try {
      await API.delete(`/live/${quizId}/remove/${userId}`);
      showMessage('Player removed!');
      fetchQuizzes();
    } catch { showMessage('Failed to remove player', 'error'); }
  };

  const handleStartQuiz = async (quizId) => {
  try {
    await API.post(`/live/${quizId}/start`);
    router.push(`/live/${quizId}`); // ✅ creator goes to live page
  } catch (err) {
    showMessage(err.response?.data?.message || 'Failed to start quiz', 'error');
  }
};

  const inputStyle = {
    width: '100%', padding: '9px 12px', borderRadius: '8px', fontSize: '13px',
    border: '0.5px solid var(--color-border-secondary)', outline: 'none',
    background: 'var(--color-background-primary)', color: 'var(--color-text-primary)',
    marginBottom: '10px',
  };

  const StepIndicator = () => (
    <div style={{ display: 'flex', marginBottom: '24px' }}>
      {['Question', 'Options', 'Answer'].map((label, i) => {
        const num = i + 1;
        const isDone = step > num;
        const isActive = step === num;
        return (
          <div key={i} style={{ flex: 1, textAlign: 'center', position: 'relative' }}>
            {i < 2 && (
              <div style={{
                position: 'absolute', top: '14px', left: '50%', right: '-50%',
                height: '1px', background: isDone ? '#7c3aed' : 'var(--color-border-tertiary)',
                transition: 'background 0.3s', zIndex: 0,
              }} />
            )}
            <div style={{
              width: '28px', height: '28px', borderRadius: '50%',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '12px', fontWeight: 500, margin: '0 auto 6px',
              position: 'relative', zIndex: 1, transition: 'all 0.3s',
              background: isDone ? '#7c3aed' : isActive ? '#EEEDFE' : 'var(--color-background-primary)',
              color: isDone ? 'white' : isActive ? '#3C3489' : 'var(--color-text-secondary)',
              border: isActive ? '2px solid #7c3aed' : isDone ? 'none' : '0.5px solid var(--color-border-secondary)',
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
    <CreatorRoute>
      <div style={{ maxWidth: '740px', margin: '0 auto' }}>
        <h2 style={{ fontSize: '22px', fontWeight: 500, color: 'var(--color-text-primary)', marginBottom: '4px', animation: 'fadeInUp 0.4s ease both' }}>
          My quizzes
        </h2>
        <p style={{ fontSize: '14px', color: 'var(--color-text-secondary)', marginBottom: '28px' }}>
          Create and manage your quizzes
        </p>

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
          animation: 'fadeInUp 0.4s ease 0.1s both',
        }}>
          <p style={{ fontSize: '15px', fontWeight: 500, color: 'var(--color-text-primary)', marginBottom: '16px' }}>
            Create new quiz
          </p>
          <input placeholder="Quiz title" value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })} style={inputStyle} />
          <input placeholder="Description" value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            style={{ ...inputStyle, marginBottom: '16px' }} />
          <button onClick={handleCreateQuiz} style={{
            background: '#7c3aed', color: 'white', border: 'none',
            padding: '9px 20px', borderRadius: '8px', fontSize: '13px', cursor: 'pointer',
          }}>
            Create quiz
          </button>
        </div>

        {/* Quiz list */}
        <p style={{ fontSize: '15px', fontWeight: 500, color: 'var(--color-text-primary)', marginBottom: '14px' }}>
          All my quizzes
        </p>

        {loading && <p style={{ color: 'var(--color-text-secondary)', fontSize: '14px' }}>Loading...</p>}

        {quizzes.map((quiz, i) => (
          <div key={quiz._id} style={{
            background: 'var(--color-background-primary)',
            border: `0.5px solid ${selectedQuiz === quiz._id ? '#7c3aed55' : 'var(--color-border-tertiary)'}`,
            borderRadius: '14px', padding: '20px', marginBottom: '12px',
            animation: `fadeInUp 0.4s ease ${i * 0.08}s both`,
          }}>

            {/* Quiz header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
              <div>
                <p style={{ fontSize: '15px', fontWeight: 500, color: 'var(--color-text-primary)', marginBottom: '3px' }}>
                  {quiz.title}
                </p>
                <p style={{ fontSize: '13px', color: 'var(--color-text-secondary)' }}>{quiz.description}</p>
              </div>
              <div style={{ display: 'flex', gap: '8px', flexShrink: 0, marginLeft: '12px' }}>
                <span style={{ fontSize: '11px', padding: '3px 10px', borderRadius: '20px', background: '#EEEDFE', color: '#3C3489', fontWeight: 500 }}>
                  {quiz.questions?.length || 0} questions
                </span>
                <span style={{
                  fontSize: '11px', padding: '3px 10px', borderRadius: '20px', fontWeight: 500,
                  background: quiz.status === 'live' ? '#EAF3DE' : quiz.status === 'ended' ? '#FCEBEB' : '#F1EFE8',
                  color: quiz.status === 'live' ? '#3B6D11' : quiz.status === 'ended' ? '#A32D2D' : '#5F5E5A',
                }}>
                  {quiz.status}
                </span>
              </div>
            </div>

            {/* Quiz code */}
            <div style={{
              display: 'flex', alignItems: 'center', gap: '8px',
              padding: '8px 12px', borderRadius: '8px',
              background: 'var(--color-background-secondary)', marginBottom: '14px',
            }}>
              <span style={{ fontSize: '12px', color: 'var(--color-text-secondary)' }}>Quiz code:</span>
              <span style={{ fontSize: '16px', fontWeight: 500, color: '#7c3aed', letterSpacing: '4px' }}>
                {quiz.quizCode}
              </span>
              <button onClick={() => navigator.clipboard.writeText(quiz.quizCode)} style={{
                background: 'transparent', border: 'none', cursor: 'pointer',
                fontSize: '12px', color: 'var(--color-text-secondary)', marginLeft: 'auto',
              }}>
                Copy
              </button>
            </div>

            {/* Actions */}
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '14px' }}>
              {quiz.status === 'draft' && (
                <button onClick={() => handleStartQuiz(quiz._id)} style={{
                  background: '#059669', color: 'white', border: 'none',
                  padding: '7px 14px', borderRadius: '8px', fontSize: '13px', cursor: 'pointer',
                }}>
                  Start quiz
                </button>
              )}
              {quiz.status === 'live' && (
                <button onClick={() => router.push(`/live/${quiz._id}`)} style={{
                  background: '#059669', color: 'white', border: 'none',
                  padding: '7px 14px', borderRadius: '8px', fontSize: '13px', cursor: 'pointer',
                }}>
                  Go to live quiz
                </button>
              )}
              <button onClick={() => { setSelectedQuiz(selectedQuiz === quiz._id ? null : quiz._id); setStep(1); }} style={{
                background: selectedQuiz === quiz._id ? '#EEEDFE' : 'transparent',
                color: selectedQuiz === quiz._id ? '#3C3489' : 'var(--color-text-secondary)',
                border: `0.5px solid ${selectedQuiz === quiz._id ? '#7c3aed' : 'var(--color-border-secondary)'}`,
                padding: '7px 14px', borderRadius: '8px', fontSize: '13px', cursor: 'pointer',
              }}>
                {selectedQuiz === quiz._id ? 'Cancel' : '+ Add question'}
              </button>
              <button onClick={() => handleDeleteQuiz(quiz._id)} style={{
                background: '#FCEBEB', color: '#A32D2D', border: 'none',
                padding: '7px 14px', borderRadius: '8px', fontSize: '13px', cursor: 'pointer',
              }}>
                Delete
              </button>
            </div>

            {/* Pending players */}
            {quiz.pendingPlayers?.length > 0 && (
              <div style={{
                marginBottom: '14px', padding: '12px 16px',
                borderRadius: '10px', background: '#FAEEDA',
                border: '0.5px solid #FAC775',
              }}>
                <p style={{ fontSize: '13px', fontWeight: 500, color: '#854F0B', marginBottom: '8px' }}>
                  Pending requests ({quiz.pendingPlayers.length})
                </p>
                {quiz.pendingPlayers.map(player => (
                  <div key={player._id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                    <span style={{ fontSize: '13px', color: '#633806' }}>{player.name} ({player.email})</span>
                    <div style={{ display: 'flex', gap: '6px' }}>
                      <button onClick={() => handleAllowPlayer(quiz._id, player._id)} style={{
                        background: '#059669', color: 'white', border: 'none',
                        padding: '4px 10px', borderRadius: '6px', fontSize: '12px', cursor: 'pointer',
                      }}>
                        Allow
                      </button>
                      <button onClick={() => handleRemovePlayer(quiz._id, player._id)} style={{
                        background: '#E24B4A', color: 'white', border: 'none',
                        padding: '4px 10px', borderRadius: '6px', fontSize: '12px', cursor: 'pointer',
                      }}>
                        Deny
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Allowed players */}
            {quiz.allowedPlayers?.length > 0 && (
              <div style={{
                marginBottom: '14px', padding: '12px 16px',
                borderRadius: '10px', background: '#EAF3DE',
                border: '0.5px solid #C0DD97',
              }}>
                <p style={{ fontSize: '13px', fontWeight: 500, color: '#3B6D11', marginBottom: '8px' }}>
                  Allowed players ({quiz.allowedPlayers.length})
                </p>
                {quiz.allowedPlayers.map(player => (
                  <div key={player._id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                    <span style={{ fontSize: '13px', color: '#27500A' }}>{player.name}</span>
                    <button onClick={() => handleRemovePlayer(quiz._id, player._id)} style={{
                      background: '#FCEBEB', color: '#A32D2D', border: 'none',
                      padding: '4px 10px', borderRadius: '6px', fontSize: '12px', cursor: 'pointer',
                    }}>
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* Add question panel */}
            {selectedQuiz === quiz._id && (
              <div style={{
                background: 'var(--color-background-secondary)',
                borderRadius: '12px', padding: '20px',
                border: '0.5px solid #7c3aed33',
                animation: 'slideDown 0.3s ease both',
              }}>
                <StepIndicator />

                {/* Step 1 */}
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
                      style={{ ...inputStyle, resize: 'none', fontFamily: 'var(--font-sans)', marginBottom: '12px' }}
                    />
                    {/* Time limit */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                      <label style={{ fontSize: '13px', color: 'var(--color-text-secondary)', whiteSpace: 'nowrap' }}>
                        Time limit:
                      </label>
                      <input
                        type="range" min="10" max="120" step="5"
                        value={questionForm.timeLimit}
                        onChange={(e) => setQuestionForm({ ...questionForm, timeLimit: Number(e.target.value) })}
                        style={{ flex: 1 }}
                      />
                      <span style={{
                        fontSize: '14px', fontWeight: 500, color: '#7c3aed',
                        minWidth: '50px', textAlign: 'right',
                      }}>
                        {questionForm.timeLimit}s
                      </span>
                    </div>
                    {questionForm.questionText && (
                      <div style={{
                        background: 'var(--color-background-primary)',
                        border: '0.5px solid var(--color-border-tertiary)',
                        borderRadius: '10px', padding: '14px', marginBottom: '16px',
                        animation: 'popIn 0.3s ease',
                      }}>
                        <p style={{ fontSize: '11px', color: 'var(--color-text-secondary)', marginBottom: '8px' }}>Preview</p>
                        <p style={{ fontSize: '14px', fontWeight: 500, color: 'var(--color-text-primary)' }}>
                          {questionForm.questionText}
                        </p>
                        <p style={{ fontSize: '12px', color: '#7c3aed', marginTop: '6px' }}>
                          ⏱ {questionForm.timeLimit} seconds
                        </p>
                      </div>
                    )}
                    <button onClick={() => {
                      if (!questionForm.questionText) return showMessage('Enter question text', 'error');
                      setStep(2);
                    }} style={{
                      background: '#7c3aed', color: 'white', border: 'none',
                      padding: '9px 20px', borderRadius: '8px', fontSize: '13px', cursor: 'pointer',
                    }}>
                      Next: Add options →
                    </button>
                  </div>
                )}

                {/* Step 2 */}
                {step === 2 && (
                  <div style={{ animation: 'fadeInUp 0.3s ease both' }}>
                    <p style={{ fontSize: '13px', color: 'var(--color-text-secondary)', marginBottom: '12px' }}>
                      Step 2 — Add 4 answer options
                    </p>
                    {questionForm.options.map((opt, i) => (
                      <div key={i} style={{ display: 'flex', gap: '10px', alignItems: 'center', marginBottom: '8px' }}>
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
                          style={{ flex: 1, padding: '8px 12px', borderRadius: '8px', fontSize: '13px', border: '0.5px solid var(--color-border-secondary)', outline: 'none', background: 'var(--color-background-primary)', color: 'var(--color-text-primary)' }}
                        />
                      </div>
                    ))}
                    <div style={{ display: 'flex', gap: '8px', marginTop: '16px' }}>
                      <button onClick={() => setStep(1)} style={{ background: 'transparent', color: 'var(--color-text-secondary)', border: '0.5px solid var(--color-border-secondary)', padding: '9px 16px', borderRadius: '8px', fontSize: '13px', cursor: 'pointer' }}>
                        ← Back
                      </button>
                      <button onClick={() => {
                        if (questionForm.options.some(o => o === '')) return showMessage('Fill all 4 options', 'error');
                        setStep(3);
                      }} style={{ background: '#7c3aed', color: 'white', border: 'none', padding: '9px 20px', borderRadius: '8px', fontSize: '13px', cursor: 'pointer' }}>
                        Next: Select answer →
                      </button>
                    </div>
                  </div>
                )}

                {/* Step 3 */}
                {step === 3 && (
                  <div style={{ animation: 'fadeInUp 0.3s ease both' }}>
                    <p style={{ fontSize: '13px', color: 'var(--color-text-secondary)', marginBottom: '12px' }}>
                      Step 3 — Click the correct answer
                    </p>
                    <div style={{ background: 'var(--color-background-primary)', border: '0.5px solid var(--color-border-tertiary)', borderRadius: '10px', padding: '16px', marginBottom: '16px' }}>
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
                            }}>
                            <span><strong style={{ marginRight: '10px', color: isCorrect ? '#3B6D11' : 'var(--color-text-secondary)' }}>{LETTERS[i]}</strong>{opt}</span>
                            {isCorrect && <span>✓</span>}
                          </button>
                        );
                      })}
                    </div>
                    {questionForm.correctAnswer && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '10px 14px', borderRadius: '8px', background: '#EAF3DE', border: '0.5px solid #C0DD97', marginBottom: '16px', fontSize: '13px', color: '#3B6D11', animation: 'popIn 0.3s ease' }}>
                        <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#639922' }} />
                        Correct: <strong style={{ marginLeft: '4px' }}>{questionForm.correctAnswer}</strong>
                      </div>
                    )}
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button onClick={() => setStep(2)} style={{ background: 'transparent', color: 'var(--color-text-secondary)', border: '0.5px solid var(--color-border-secondary)', padding: '9px 16px', borderRadius: '8px', fontSize: '13px', cursor: 'pointer' }}>
                        ← Back
                      </button>
                      <button onClick={handleAddQuestion} style={{
                        background: questionForm.correctAnswer ? '#059669' : '#9ca3af',
                        color: 'white', border: 'none', padding: '9px 20px',
                        borderRadius: '8px', fontSize: '13px',
                        cursor: questionForm.correctAnswer ? 'pointer' : 'not-allowed',
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
    </CreatorRoute>
  );
}