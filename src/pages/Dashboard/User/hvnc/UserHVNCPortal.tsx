import React, { useState } from 'react';
import {
  SettingOutlined,
  LoginOutlined,
  InfoCircleOutlined,
  LockOutlined,
  ExclamationCircleOutlined,
  CodeOutlined,
} from '@ant-design/icons';

interface Props {
  onStartSession: (code: string) => void;
  onValidate?: (code: string) => Promise<{ success: boolean; error?: string }>;
}

const GlassCard = ({ children }: { children: React.ReactNode }) => (
  <div
    className="w-full max-w-[520px] rounded-xl shadow-2xl overflow-hidden"
    style={{
      background: 'rgba(43,43,43,0.85)',
      backdropFilter: 'blur(12px)',
      WebkitBackdropFilter: 'blur(12px)',
      border: '1px solid rgba(255,255,255,0.1)',
    }}
  >
    {children}
  </div>
);

const UserHVNCPortal: React.FC<Props> = ({ onStartSession, onValidate }) => {
  const [part1, setPart1] = useState('');
  const [part2, setPart2] = useState('');
  const [error, setError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('Invalid Access Code. Please check and try again.');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    const fullCode = `${part1}${part2}`.trim();

    // Client-side format check
    if (fullCode.length !== 8) {
      setError(true);
      setErrorMessage('Invalid Access Code. Please check and try again.');
      return;
    }

    setError(false);
    setLoading(true);

    if (onValidate) {
      // Use real API validation
      const result = await onValidate(fullCode);
      setLoading(false);
      if (result.success) {
        onStartSession(fullCode);
      } else {
        setError(true);
        setErrorMessage(result.error ?? 'Invalid Access Code. Please check and try again.');
      }
    } else {
      // Fallback: simulate delay (dev / no-backend mode)
      setTimeout(() => {
        setLoading(false);
        onStartSession(fullCode);
      }, 800);
    }
  };

  const inputClass = (hasError: boolean) =>
    `w-full rounded-lg text-white text-center text-xl tracking-[0.5em] font-mono
     focus:outline-none focus:ring-2 h-16 placeholder-slate-600 transition-all bg-[#0F172A] px-3
     ${hasError
       ? 'border-2 border-red-500 focus:ring-red-500/40'
       : 'border border-[#334155] focus:ring-[#F6921E]/40'}`;

  return (
    <div
      className="flex flex-col items-center justify-center min-h-full p-4 font-[gilroy-regular]"
      style={{ background: 'linear-gradient(135deg, #333333, #F6921E)' }}
    >
      <GlassCard>

        {/* Header */}
        <header className="flex items-center justify-between border-b border-white/10 px-8 py-5">
          <div className="flex items-center gap-3 text-white">
            <div className="size-8 bg-[#F6921E] rounded-lg flex items-center justify-center">
              <CodeOutlined className="text-[#333333] font-bold text-base" />
            </div>
            <h2 className="text-white text-lg font-bold tracking-tight">HVNC Platform</h2>
          </div>
          <button className="flex items-center justify-center rounded-lg h-10 w-10 bg-white/5 hover:bg-white/10 text-white transition-colors">
            <SettingOutlined className="text-base" />
          </button>
        </header>

        {/* Body */}
        <div className="p-8 flex flex-col gap-7">

          {/* Title */}
          <div className="flex flex-col gap-2">
            <h1 className="text-white text-3xl font-black leading-tight tracking-tight">
              Remote Access Portal
            </h1>
            <p className="text-slate-300 text-sm leading-relaxed">
              Enter your 8-character access code to connect to your assigned workstation.
            </p>
          </div>

          {/* Error Banner */}
          {error && (
            <div className="flex items-center gap-2 p-3 rounded-lg bg-red-500/10 border border-red-500/20">
              <ExclamationCircleOutlined className="text-red-500 text-lg shrink-0" />
              <p className="text-red-400 text-sm font-semibold tracking-wide">
                {errorMessage}
              </p>
            </div>
          )}

          {/* Code Inputs */}
          <div className="grid grid-cols-2 gap-4">
            <label className="flex flex-col gap-2">
              <span className="text-slate-200 text-xs font-semibold uppercase tracking-wider">
                Access Code (Part 1)
              </span>
              <input
                className={inputClass(error)}
                maxLength={4}
                placeholder="****"
                value={part1}
                onChange={(e) => {
                  const val = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '');
                  setPart1(val);
                  if (error) setError(false);
                  // Auto-focus part 2 when 4 chars entered
                  if (val.length === 4) {
                    const next = document.getElementById('hvnc-part2');
                    next?.focus();
                  }
                }}
              />
            </label>
            <label className="flex flex-col gap-2">
              <span className="text-slate-200 text-xs font-semibold uppercase tracking-wider">
                Access Code (Part 2)
              </span>
              <input
                id="hvnc-part2"
                className={inputClass(error)}
                maxLength={4}
                placeholder="****"
                value={part2}
                onChange={(e) => {
                  const val = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '');
                  setPart2(val);
                  if (error) setError(false);
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleSubmit();
                }}
              />
            </label>
          </div>

          {/* CTA */}
          <div className="flex flex-col gap-3">
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="flex w-full items-center justify-center gap-2 rounded-lg h-14 bg-[#333333]
                hover:bg-black text-white text-base font-bold transition-all shadow-lg
                active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed"
            >
              <LoginOutlined className="text-lg" />
              {loading ? 'Validating...' : 'Start Session'}
            </button>

            {/* Info bar */}
            <div className="flex items-center justify-center gap-2 py-2 px-4 bg-black/20 rounded-lg border border-white/5">
              <InfoCircleOutlined className="text-[#F6921E] text-sm" />
              <p className="text-slate-400 text-xs font-medium uppercase tracking-tight">
                Assigned PC: WORK-PC-01 | Shift ends at 5:00 PM EST
              </p>
            </div>
          </div>
        </div>

        {/* Footer bar */}
        <div className="px-8 py-4 bg-black/30 flex justify-between items-center text-[10px] text-slate-500 uppercase font-bold tracking-widest">
          <span>Security Status: Encrypted</span>
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            <span>Server Online</span>
          </div>
        </div>
      </GlassCard>

      {/* Below-card links */}
      <div className="mt-7 flex gap-6 text-white/40 text-sm font-medium">
        {['Help Center', 'Privacy Policy', 'System Status'].map((link) => (
          <button key={link} className="hover:text-white transition-colors">{link}</button>
        ))}
      </div>

      {/* Encryption note */}
      <div className="mt-4 flex items-center gap-2 text-white/30 text-xs tracking-widest uppercase">
        <LockOutlined className="text-sm" />
        End-to-End Encrypted Session
      </div>
    </div>
  );
};

export default UserHVNCPortal;
