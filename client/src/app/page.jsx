'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';

export default function Home() {
  const { user } = useAuth();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    if (user) {
      if (user.role === 'superadmin') router.push('/superadmin');
      else if (user.role === 'admin') router.push('/admin');
      else router.push('/quizzes');
    }
  }, [user, mounted]);

  // show landing page if not logged in
  if (!mounted || user) return null;

  return (
    <div>
      {/* Hero Section */}
      <div style={{
        background: '#1a1a2e', borderRadius: '20px',
        padding: '80px 40px', textAlign: 'center',
        marginBottom: '32px', position: 'relative',
        overflow: 'hidden', animation: 'fadeInUp 0.5s ease both',
      }}>
        {/* Decorative circles */}
        <div style={{
          position: 'absolute', top: '-60px', right: '-60px',
          width: '240px', height: '240px', borderRadius: '50%',
          background: '#7c3aed22',
        }} />
        <div style={{
          position: 'absolute', bottom: '-40px', left: '-40px',
          width: '180px', height: '180px', borderRadius: '50%',
          background: '#a78bfa11',
        }} />

        <div style={{ fontSize: '64px', marginBottom: '20px' }}>🧠</div>
        <h1 style={{
          fontSize: '42px', fontWeight: 500, color: 'white',
          marginBottom: '16px', lineHeight: 1.2,
        }}>
          Welcome to <span style={{ color: '#a78bfa' }}>BrainBlitz</span>
        </h1>
        <p style={{
          fontSize: '18px', color: '#c4b5fd',
          marginBottom: '40px', maxWidth: '500px',
          margin: '0 auto 40px', lineHeight: 1.6,
        }}>
          The ultimate real-time quiz platform. Create, host and play
          live quizzes with friends!
        </p>

        {/* CTA Buttons */}
        <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link href="/register" style={{
            background: '#7c3aed', color: 'white',
            padding: '14px 32px', borderRadius: '10px',
            fontSize: '15px', fontWeight: 500, textDecoration: 'none',
            transition: 'background 0.2s, transform 0.15s',
            display: 'inline-block',
          }}
            onMouseEnter={e => { e.target.style.background = '#6d28d9'; e.target.style.transform = 'scale(1.03)'; }}
            onMouseLeave={e => { e.target.style.background = '#7c3aed'; e.target.style.transform = 'scale(1)'; }}>
            Get started free →
          </Link>
          <Link href="/login" style={{
            background: 'transparent', color: '#c4b5fd',
            padding: '14px 32px', borderRadius: '10px',
            fontSize: '15px', fontWeight: 500, textDecoration: 'none',
            border: '0.5px solid #7c3aed66', display: 'inline-block',
            transition: 'border-color 0.2s',
          }}
            onMouseEnter={e => e.target.style.borderColor = '#a78bfa'}
            onMouseLeave={e => e.target.style.borderColor = '#7c3aed66'}>
            Login
          </Link>
        </div>
      </div>

      {/* Features */}
      <div style={{
        display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        gap: '16px', marginBottom: '32px',
      }}>
        {[
          { icon: '⚡', title: 'Real-time quizzes', desc: 'Live scoring and instant feedback powered by Socket.io', delay: '0.1s' },
          { icon: '⏱️', title: 'Timed questions', desc: 'Set custom time limits per question to keep it exciting', delay: '0.2s' },
          { icon: '🏆', title: 'Live leaderboard', desc: 'Watch scores update in real time as players answer', delay: '0.3s' },
          { icon: '🔐', title: 'Private lobbies', desc: 'Control who joins your quiz with approval system', delay: '0.4s' },
        ].map((f, i) => (
          <div key={i} style={{
            background: 'var(--color-background-primary)',
            border: '0.5px solid var(--color-border-tertiary)',
            borderRadius: '16px', padding: '24px',
            animation: `fadeInUp 0.5s ease ${f.delay} both`,
            transition: 'transform 0.2s, border-color 0.2s',
          }}
            onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.borderColor = '#7c3aed44'; }}
            onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.borderColor = 'var(--color-border-tertiary)'; }}>
            <div style={{ fontSize: '32px', marginBottom: '12px' }}>{f.icon}</div>
            <h3 style={{ fontSize: '15px', fontWeight: 500, color: 'var(--color-text-primary)', marginBottom: '8px' }}>
              {f.title}
            </h3>
            <p style={{ fontSize: '13px', color: 'var(--color-text-secondary)', lineHeight: 1.6 }}>
              {f.desc}
            </p>
          </div>
        ))}
      </div>

      {/* How it works */}
      <div style={{
        background: 'var(--color-background-primary)',
        border: '0.5px solid var(--color-border-tertiary)',
        borderRadius: '16px', padding: '32px',
        marginBottom: '32px', animation: 'fadeInUp 0.5s ease 0.3s both',
      }}>
        <h2 style={{ fontSize: '20px', fontWeight: 500, color: 'var(--color-text-primary)', marginBottom: '24px', textAlign: 'center' }}>
          How it works
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '24px' }}>
          {[
            { step: '1', icon: '📝', title: 'Create an account', desc: 'Sign up for free in seconds' },
            { step: '2', icon: '🎯', title: 'Create or join', desc: 'Build your own quiz or join with a code' },
            { step: '3', icon: '🚀', title: 'Play live', desc: 'Answer questions with countdown timer' },
            { step: '4', icon: '🏅', title: 'See results', desc: 'Live leaderboard shows winners instantly' },
          ].map((s, i) => (
            <div key={i} style={{ textAlign: 'center' }}>
              <div style={{
                width: '40px', height: '40px', borderRadius: '50%',
                background: '#EEEDFE', color: '#3C3489',
                fontSize: '16px', fontWeight: 500,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                margin: '0 auto 12px',
              }}>
                {s.step}
              </div>
              <div style={{ fontSize: '28px', marginBottom: '8px' }}>{s.icon}</div>
              <h4 style={{ fontSize: '14px', fontWeight: 500, color: 'var(--color-text-primary)', marginBottom: '4px' }}>
                {s.title}
              </h4>
              <p style={{ fontSize: '12px', color: 'var(--color-text-secondary)', lineHeight: 1.5 }}>
                {s.desc}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Roles section */}
      <div style={{
        display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '16px', marginBottom: '32px',
      }}>
        {[
          { role: 'Player', icon: '🎮', color: '#E1F5EE', textColor: '#085041', desc: 'Join quizzes using a code or link. Compete and climb the leaderboard!', delay: '0.1s' },
          { role: 'Creator', icon: '✏️', color: '#EEEDFE', textColor: '#3C3489', desc: 'Build quizzes, manage players and host live games with full control.', delay: '0.2s' },
          { role: 'Admin', icon: '🛡️', color: '#FCEBEB', textColor: '#A32D2D', desc: 'Oversee all quizzes, edit content and keep the platform running smoothly.', delay: '0.3s' },
        ].map((r, i) => (
          <div key={i} style={{
            background: r.color, borderRadius: '16px', padding: '24px',
            animation: `fadeInUp 0.5s ease ${r.delay} both`,
            transition: 'transform 0.2s',
          }}
            onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-4px)'}
            onMouseLeave={e => e.currentTarget.style.transform = 'translateY(0)'}>
            <div style={{ fontSize: '32px', marginBottom: '12px' }}>{r.icon}</div>
            <h3 style={{ fontSize: '15px', fontWeight: 500, color: r.textColor, marginBottom: '8px' }}>
              {r.role}
            </h3>
            <p style={{ fontSize: '13px', color: r.textColor, lineHeight: 1.6, opacity: 0.8 }}>
              {r.desc}
            </p>
          </div>
        ))}
      </div>

      {/* Bottom CTA */}
      <div style={{
        background: '#1a1a2e', borderRadius: '16px',
        padding: '48px 40px', textAlign: 'center',
        animation: 'fadeInUp 0.5s ease 0.4s both',
      }}>
        <h2 style={{ fontSize: '24px', fontWeight: 500, color: 'white', marginBottom: '12px' }}>
          Ready to play? 🚀
        </h2>
        <p style={{ color: '#c4b5fd', fontSize: '15px', marginBottom: '28px' }}>
          Join thousands of players already using BrainBlitz
        </p>
        <Link href="/register" style={{
          background: '#7c3aed', color: 'white',
          padding: '14px 40px', borderRadius: '10px',
          fontSize: '15px', fontWeight: 500, textDecoration: 'none',
          display: 'inline-block', transition: 'background 0.2s',
        }}>
          Create free account →
        </Link>
      </div>
    </div>
  );
}