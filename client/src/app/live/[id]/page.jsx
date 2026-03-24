'use client';
import { useEffect, useState, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import socket from '@/lib/socket';
import API from '@/lib/axios';
import PrivateRoute from '@/components/PrivateRoute';

const LETTERS = ['A', 'B', 'C', 'D'];

export default function LiveQuiz() {
  const { id } = useParams();
  const { user } = useAuth();
  const router = useRouter();

  const [quiz, setQuiz] = useState(null);
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [totalQuestions, setTotalQuestions] = useState(0);
  const [timeLeft, setTimeLeft] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [answerResult, setAnswerResult] = useState(null);
  const [scores, setScores] = useState([]);
  const [players, setPlayers] = useState([]);
  const [quizEnded, setQuizEnded] = useState(false);
  const [isCreator, setIsCreator] = useState(false);
  const [status, setStatus] = useState('waiting'); // waiting | question | result | ended
  const [message, setMessage] = useState('');

  useEffect(() => {
    fetchQuiz();
  }, [id]);

  const fetchQuiz = async () => {
    try {
      const { data } = await API.get(`/live/my`);
      const found = data.find(q => q._id === id);
      if (found) {
        setQuiz(found);
        setIsCreator(true);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (!user) return;

    socket.connect();

    socket.emit('join-quiz-room', {
      quizId: id,
      userId: user.id,
      userName: user.name,
      role: isCreator ? 'creator' : 'player',
    });

    // Someone joined
    socket.on('player-joined', ({ userName }) => {
      setMessage(`${userName} joined!`);
      setTimeout(() => setMessage(''), 3000);
    });

    // Quiz started
    socket.on('quiz-started', ({ question, currentQuestion, totalQuestions }) => {
      setCurrentQuestion(question);
      setQuestionIndex(currentQuestion);
      setTotalQuestions(totalQuestions);
      setTimeLeft(question.timeLimit);
      setSelectedAnswer(null);
      setAnswerResult(null);
      setStatus('question');
    });

    // New question
    socket.on('new-question', ({ question, currentQuestion, totalQuestions }) => {
      setCurrentQuestion(question);
      setQuestionIndex(currentQuestion);
      setTotalQuestions(totalQuestions);
      setTimeLeft(question.timeLimit);
      setSelectedAnswer(null);
      setAnswerResult(null);
      setStatus('question');
    });

    // Timer tick
    socket.on('timer-tick', ({ timeLeft }) => {
      setTimeLeft(timeLeft);
    });

    // Timer ended
    socket.on('timer-ended', () => {
      setStatus('result');
    });

    // Answer result
    socket.on('answer-result', (result) => {
      setAnswerResult(result);
      setStatus('result');
    });

    // Score update
    socket.on('score-update', ({ scores }) => {
      setScores(scores);
    });

    // Player removed
    socket.on('player-removed', ({ userId }) => {
      if (userId === user.id) {
        router.push('/quizzes');
      }
    });

    // Quiz ended
    socket.on('quiz-ended', ({ scores }) => {
      setScores(scores);
      setQuizEnded(true);
      setStatus('ended');
    });

    return () => {
      socket.off('player-joined');
      socket.off('quiz-started');
      socket.off('new-question');
      socket.off('timer-tick');
      socket.off('timer-ended');
      socket.off('answer-result');
      socket.off('score-update');
      socket.off('player-removed');
      socket.off('quiz-ended');
      socket.disconnect();
    };
  }, [user, id, isCreator]);

  const handleStartQuiz = () => {
    socket.emit('start-quiz', { quizId: id });
  };

  const handleNextQuestion = () => {
    socket.emit('next-question', { quizId: id, currentIndex: questionIndex });
  };

  const handleAnswer = (option) => {
    if (selectedAnswer || answerResult) return;
    setSelectedAnswer(option);
    socket.emit('submit-answer', {
      quizId: id,
      questionId: currentQuestion._id,
      answer: option,
      userId: user?.id,
    });
  };

  // Timer color
  const timerColor = timeLeft > 10 ? '#059669' : timeLeft > 5 ? '#EF9F27' : '#E24B4A';
  const timerPercent = currentQuestion ? (timeLeft / currentQuestion.timeLimit) * 100 : 100;

  return (
    <PrivateRoute>
      <div style={{ maxWidth: '700px', margin: '0 auto' }}>

        {/* Status message */}
        {message && (
          <div style={{
            padding: '10px 16px', borderRadius: '8px', marginBottom: '16px',
            background: '#EAF3DE', color: '#3B6D11', fontSize: '13px',
            animation: 'popIn 0.3s ease',
          }}>
            {message}
          </div>
        )}

        {/* Waiting screen */}
        {status === 'waiting' && (
          <div style={{
            background: '#1a1a2e', borderRadius: '16px', padding: '48px',
            textAlign: 'center', animation: 'fadeInUp 0.5s ease both',
          }}>
            <p style={{ fontSize: '48px', marginBottom: '16px' }}>⏳</p>
            <h2 style={{ fontSize: '22px', fontWeight: 500, color: 'white', marginBottom: '8px' }}>
              {isCreator ? 'Ready to start?' : 'Waiting for host to start...'}
            </h2>
            <p style={{ color: '#c4b5fd', fontSize: '14px', marginBottom: '24px' }}>
              {isCreator ? 'All players are waiting for you!' : 'The quiz will begin shortly'}
            </p>

            {/* Scoreboard preview */}
            {scores.length > 0 && (
              <div style={{ marginBottom: '24px' }}>
                {scores.map((s, i) => (
                  <div key={s._id} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 16px', background: '#ffffff11', borderRadius: '8px', marginBottom: '6px' }}>
                    <span style={{ color: 'white', fontSize: '13px' }}>{s.userId?.name}</span>
                    <span style={{ color: '#a78bfa', fontSize: '13px' }}>{s.score} pts</span>
                  </div>
                ))}
              </div>
            )}

            {isCreator && (
              <button onClick={handleStartQuiz} style={{
                background: '#7c3aed', color: 'white', border: 'none',
                padding: '12px 32px', borderRadius: '10px', fontSize: '15px',
                fontWeight: 500, cursor: 'pointer', transition: 'background 0.2s',
              }}>
                Start Quiz 🚀
              </button>
            )}
          </div>
        )}

        {/* Question screen */}
        {status === 'question' && currentQuestion && (
          <div style={{ animation: 'fadeInUp 0.4s ease both' }}>
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <p style={{ fontSize: '14px', color: 'var(--color-text-secondary)' }}>
                Question {questionIndex + 1} of {totalQuestions}
              </p>
              {/* Timer */}
              <div style={{
                display: 'flex', alignItems: 'center', gap: '8px',
                background: '#1a1a2e', padding: '6px 14px', borderRadius: '20px',
              }}>
                <div style={{ fontSize: '16px' }}>⏱</div>
                <span style={{ fontSize: '18px', fontWeight: 500, color: timerColor, transition: 'color 0.3s' }}>
                  {timeLeft}s
                </span>
              </div>
            </div>

            {/* Timer bar */}
            <div style={{ background: 'var(--color-background-secondary)', borderRadius: '20px', height: '6px', marginBottom: '24px' }}>
              <div style={{
                background: timerColor, height: '6px', borderRadius: '20px',
                width: `${timerPercent}%`, transition: 'width 1s linear, background 0.3s',
              }} />
            </div>

            {/* Question */}
            <div style={{
              background: 'var(--color-background-primary)',
              border: '0.5px solid var(--color-border-tertiary)',
              borderRadius: '16px', padding: '28px', marginBottom: '20px',
            }}>
              <p style={{ fontSize: '18px', fontWeight: 500, color: 'var(--color-text-primary)', marginBottom: '24px', lineHeight: 1.5 }}>
                {currentQuestion.questionText}
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {currentQuestion.options.map((option, i) => {
                  const isSelected = selectedAnswer === option;
                  const isCorrect = answerResult && option === answerResult.correctAnswer;
                  const isWrong = answerResult && isSelected && !answerResult.isCorrect;

                  return (
                    <button key={i} onClick={() => handleAnswer(option)} style={{
                      border: isCorrect ? '1.5px solid #639922' : isWrong ? '1.5px solid #E24B4A' : isSelected ? '1.5px solid #7c3aed' : '0.5px solid var(--color-border-tertiary)',
                      borderRadius: '10px', padding: '13px 16px', textAlign: 'left',
                      fontSize: '14px', cursor: selectedAnswer ? 'default' : 'pointer',
                      background: isCorrect ? '#EAF3DE' : isWrong ? '#FCEBEB' : isSelected ? '#EEEDFE' : 'var(--color-background-primary)',
                      color: isCorrect ? '#3B6D11' : isWrong ? '#A32D2D' : isSelected ? '#3C3489' : 'var(--color-text-primary)',
                      transition: 'all 0.2s',
                      display: 'flex', alignItems: 'center', gap: '12px',
                    }}>
                      <span style={{ fontWeight: 500, color: 'var(--color-text-secondary)', width: '20px' }}>{LETTERS[i]}</span>
                      {option}
                      {isCorrect && <span style={{ marginLeft: 'auto' }}>✅</span>}
                      {isWrong && <span style={{ marginLeft: 'auto' }}>❌</span>}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Creator controls */}
            {isCreator && (
              <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <button onClick={handleNextQuestion} style={{
                  background: '#7c3aed', color: 'white', border: 'none',
                  padding: '10px 20px', borderRadius: '8px', fontSize: '13px', cursor: 'pointer',
                }}>
                  {questionIndex >= totalQuestions - 1 ? 'End Quiz' : 'Next Question →'}
                </button>
              </div>
            )}
          </div>
        )}

        {/* Result screen */}
        {status === 'result' && answerResult && !isCreator && (
          <div style={{
            background: answerResult.isCorrect ? '#EAF3DE' : '#FCEBEB',
            border: `0.5px solid ${answerResult.isCorrect ? '#C0DD97' : '#F7C1C1'}`,
            borderRadius: '16px', padding: '32px', textAlign: 'center',
            marginBottom: '20px', animation: 'popIn 0.4s ease both',
          }}>
            <p style={{ fontSize: '48px', marginBottom: '12px' }}>
              {answerResult.isCorrect ? '✅' : '❌'}
            </p>
            <h3 style={{ fontSize: '20px', fontWeight: 500, color: answerResult.isCorrect ? '#3B6D11' : '#A32D2D', marginBottom: '8px' }}>
              {answerResult.isCorrect ? 'Correct!' : 'Wrong!'}
            </h3>
            {!answerResult.isCorrect && (
              <p style={{ fontSize: '14px', color: '#3B6D11' }}>
                Correct answer: <strong>{answerResult.correctAnswer}</strong>
              </p>
            )}
            <p style={{ fontSize: '13px', color: 'var(--color-text-secondary)', marginTop: '12px' }}>
              Waiting for next question...
            </p>
          </div>
        )}

        {/* Live scoreboard */}
        {scores.length > 0 && status !== 'ended' && (
          <div style={{
            background: 'var(--color-background-primary)',
            border: '0.5px solid var(--color-border-tertiary)',
            borderRadius: '14px', padding: '20px',
            animation: 'fadeInUp 0.4s ease both',
          }}>
            <p style={{ fontSize: '14px', fontWeight: 500, color: 'var(--color-text-primary)', marginBottom: '14px' }}>
              Live scores
            </p>
            {scores.map((s, i) => (
              <div key={s._id} style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '10px 14px', borderRadius: '8px', marginBottom: '6px',
                background: i === 0 ? '#FAEEDA' : 'var(--color-background-secondary)',
                animation: `slideInLeft 0.3s ease ${i * 0.05}s both`,
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span style={{ fontSize: '16px' }}>{i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `${i + 1}.`}</span>
                  <span style={{ fontSize: '13px', fontWeight: 500, color: 'var(--color-text-primary)' }}>{s.userId?.name}</span>
                </div>
                <span style={{ fontSize: '14px', fontWeight: 500, color: '#7c3aed' }}>{s.score} pts</span>
              </div>
            ))}
          </div>
        )}

        {/* Quiz ended */}
        {status === 'ended' && (
          <div style={{ animation: 'fadeInUp 0.5s ease both' }}>
            <div style={{
              background: '#1a1a2e', borderRadius: '16px', padding: '40px',
              textAlign: 'center', marginBottom: '24px',
            }}>
              <p style={{ fontSize: '48px', marginBottom: '12px' }}>🏆</p>
              <h2 style={{ fontSize: '22px', fontWeight: 500, color: 'white', marginBottom: '8px' }}>
                Quiz ended!
              </h2>
              <p style={{ color: '#c4b5fd', fontSize: '14px' }}>Final results</p>
            </div>

            {scores.map((s, i) => (
              <div key={s._id} style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '14px 18px', borderRadius: '10px', marginBottom: '8px',
                background: i === 0 ? '#FAEEDA' : 'var(--color-background-primary)',
                border: `0.5px solid ${i === 0 ? '#FAC775' : 'var(--color-border-tertiary)'}`,
                animation: `slideInLeft 0.4s ease ${i * 0.08}s both`,
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                  <span style={{ fontSize: '20px' }}>{i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `${i + 1}.`}</span>
                  <span style={{ fontSize: '14px', fontWeight: 500, color: 'var(--color-text-primary)' }}>{s.userId?.name}</span>
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
              border: 'none', padding: '10px 24px', borderRadius: '8px',
              fontSize: '14px', cursor: 'pointer',
            }}>
              Back to quizzes
            </button>
          </div>
        )}
      </div>
    </PrivateRoute>
  );
}