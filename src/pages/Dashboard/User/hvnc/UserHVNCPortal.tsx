import React, { useEffect, useState } from 'react';
import {
  SettingOutlined,
  LoginOutlined,
  InfoCircleOutlined,
  LockOutlined,
  ExclamationCircleOutlined,
  CodeOutlined,
  MailOutlined,
  ClockCircleOutlined,
} from '@ant-design/icons';
import { useUserInfoStates } from '../../../../store/useAuthStore';
import { useUserHVNCPortal } from '../../../../hooks/HVNC/User/useUserHVNCPortal';
import { retrieveUserInfoFromStorage } from '../../../../helpers';

interface Props {
  selectedDeviceId: string;
  onStartSession: (code: string) => void;
  onValidate?: (code: string, email: string, deviceId: string) => Promise<{ success: boolean; error?: string }>;
  onBackToDashboard?: () => void;
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

const UserHVNCPortal: React.FC<Props> = ({ selectedDeviceId, onStartSession, onValidate, onBackToDashboard }) => {
  const [accessCode, setAccessCode] = useState('');
  const [error, setError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('Invalid Access Code. Please check and try again.');
  const [loading, setLoading] = useState(false);
  const [codeRequested, setCodeRequested] = useState(false);
  const [requestLoading, setRequestLoading] = useState(false);
  const [userInfo, setUserInfo] = useState<any>(null);
  const { requestAccessCode } = useUserHVNCPortal();

useEffect(() => {
    const loadUserInfo = async () => {
      try {
        const result = await retrieveUserInfoFromStorage();
        setUserInfo(result);
      } catch (error) {
        console.error("Failed to load user info:", error);
      } finally {
        setLoading(false);
      }
    };

    loadUserInfo();
  }, []);


  
  const handleRequestCode = async () => {
    if (!userInfo?.email) {
      setError(true);
      setErrorMessage('User email not found. Please log in again.');
      return;
    }

    if (!selectedDeviceId) {
      setError(true);
      setErrorMessage('No device selected. Please select a device first.');
      return;
    }

    setRequestLoading(true);
    setError(false);

    try {
      const result = await requestAccessCode(userInfo.email, selectedDeviceId);
      if (result.success) {
        setCodeRequested(true);
        setErrorMessage('');
      } else {
        setError(true);
        setErrorMessage(result.error ?? 'Failed to request access code. Please try again.');
      }
    } catch (err) {
      setError(true);
      setErrorMessage('Failed to request access code. Please check your connection and try again.');
    } finally {
      setRequestLoading(false);
    }
  };

  const handleSubmit = async () => {
    const fullCode = accessCode.trim();

    // Client-side format check
    if (accessCode.length !== 6 ) {
      setError(true);
      setErrorMessage('Invalid Access Code. Please check and try again.');
      return;
    }

    setError(false);
    setLoading(true);

    if (onValidate) {
      // Use real API validation
      const result = await onValidate(fullCode, userInfo.email, selectedDeviceId);
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
          <div className="flex items-center gap-2">
            {onBackToDashboard && (
              <button 
                onClick={onBackToDashboard}
                className="flex items-center justify-center rounded-lg h-10 w-10 bg-white/5 hover:bg-white/10 text-white transition-colors"
                title="Back to Dashboard"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
                </svg>
              </button>
            )}
            <button className="flex items-center justify-center rounded-lg h-10 w-10 bg-white/5 hover:bg-white/10 text-white transition-colors">
              <SettingOutlined className="text-base" />
            </button>
          </div>
        </header>

        {/* Body */}
        <div className="p-8 flex flex-col gap-7">

          {/* Title */}
          <div className="flex flex-col gap-2">
            <h1 className="text-white text-3xl font-black leading-tight tracking-tight">
              Remote Access Portal
            </h1>
            <p className="text-slate-300 text-sm leading-relaxed">
              {codeRequested 
                ? 'Check your email for the 6-character access code and enter it below.'
                : `Request an access code or enter your existing 6-character code to connect to your assigned workstation. Selected Device ID: ${selectedDeviceId}`}
            </p>
          </div>

          {/* Success Banner for Code Request */}
          {codeRequested && !error && (
            <div className="flex items-center gap-2 p-3 rounded-lg bg-green-500/10 border border-green-500/20">
              <MailOutlined className="text-green-500 text-lg shrink-0" />
              <p className="text-green-400 text-sm font-semibold tracking-wide">
                Access code sent to {userInfo?.email}. Check your email and enter the code below.
              </p>
            </div>
          )}

          {/* Error Banner */}
          {error && (
            <div className="flex items-center gap-2 p-3 rounded-lg bg-red-500/10 border border-red-500/20">
              <ExclamationCircleOutlined className="text-red-500 text-lg shrink-0" />
              <p className="text-red-400 text-sm font-semibold tracking-wide">
                {errorMessage}
              </p>
            </div>
          )}

          {/* Code Input */}
          <div className="flex flex-col gap-2">
            <label className="text-slate-200 text-xs font-semibold uppercase tracking-wider">
              Access Code
            </label>
            <input
              className={inputClass(error)}
              maxLength={6}
              placeholder="Enter 6-character code"
              value={accessCode}
              onChange={(e) => {
                const val = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, '');
                setAccessCode(val);
                if (error) setError(false);
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleSubmit();
              }}
            />
          </div>

          {/* CTA */}
          <div className="flex flex-col gap-3">
            {/* Request Code Button */}
            {!codeRequested && (
              <button
                onClick={handleRequestCode}
                disabled={requestLoading}
                className="flex w-full items-center justify-center gap-2 rounded-lg h-12 bg-[#F6921E]
                  hover:bg-[#D47C16] text-[#333333] text-sm font-bold transition-all
                  active:scale-[0.98] disabled:opacity-60 disabled:cursor-not-allowed"
              >
                <MailOutlined className="text-lg" />
                {requestLoading ? 'Sending...' : 'Request Access Code'}
              </button>
            )}
            
            {/* Start Session Button */}
            <button
              onClick={handleSubmit}
              disabled={loading || (!codeRequested && accessCode.length !== 6)}
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
                {codeRequested 
                  ? `Code expires in 15 minutes | User: ${userInfo?.fullName || userInfo?.email || 'Unknown'}`
                  : 'Assigned PC: Available | Ready for Connection'}
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
