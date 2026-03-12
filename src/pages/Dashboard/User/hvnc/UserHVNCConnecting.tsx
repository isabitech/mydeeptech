import React, { useEffect, useState } from 'react';
import {
  SettingOutlined,
  CheckCircleOutlined,
  CloseOutlined,
  LockOutlined,
  LoadingOutlined,
  ClockCircleOutlined,
  SafetyOutlined,
} from '@ant-design/icons';

interface Props {
  accessCode: string;
  onConnected: () => void;
  onCancel: () => void;
  onCancelApi?: () => Promise<void>;
}

interface Step {
  label: string;
  subLabel: string;
  activeSubLabel: string;
  status: 'pending' | 'active' | 'done';
}

const STEPS_CONFIG = [
  {
    label: 'Validating access code...',
    subLabel: 'Authorized',
    activeSubLabel: 'Verifying...',
    duration: 2000,
  },
  {
    label: 'Starting hidden Chrome session...',
    subLabel: 'Session deployed',
    activeSubLabel: 'Deploying container...',
    duration: 3000,
  },
  {
    label: 'Initializing remote desktop stream...',
    subLabel: 'Stream ready',
    activeSubLabel: 'Connecting stream...',
    duration: 2500,
  },
];

const UserHVNCConnecting: React.FC<Props> = ({ accessCode, onConnected, onCancel, onCancelApi }) => {
  const [steps, setSteps] = useState<Step[]>(
    STEPS_CONFIG.map((s, i) => ({
      label: s.label,
      subLabel: s.subLabel,
      activeSubLabel: s.activeSubLabel,
      status: i === 0 ? 'active' : 'pending',
    }))
  );
  const [progress, setProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState(0);

  // Total duration across all steps
  const totalDuration = STEPS_CONFIG.reduce((acc, s) => acc + s.duration, 0);

  useEffect(() => {
    let elapsed = 0;
    let stepIndex = 0;

    const advanceStep = () => {
      if (stepIndex >= STEPS_CONFIG.length) {
        setProgress(100);
        setTimeout(() => onConnected(), 600);
        return;
      }

      const duration = STEPS_CONFIG[stepIndex].duration;

      // Animate progress bar for this step
      const startProgress = Math.round((elapsed / totalDuration) * 100);
      const endProgress = Math.round(((elapsed + duration) / totalDuration) * 100);
      const steps_count = 30;
      const interval = duration / steps_count;
      let tick = 0;

      const progressTimer = setInterval(() => {
        tick++;
        const p = startProgress + Math.round(((endProgress - startProgress) * tick) / steps_count);
        setProgress(p);
        if (tick >= steps_count) clearInterval(progressTimer);
      }, interval);

      // Advance to next step after duration
      const stepTimer = setTimeout(() => {
        elapsed += duration;
        const nextIndex = stepIndex + 1;

        setSteps((prev) =>
          prev.map((s, i) => {
            if (i === stepIndex) return { ...s, status: 'done' };
            if (i === nextIndex) return { ...s, status: 'active' };
            return s;
          })
        );
        setCurrentStep(nextIndex);
        stepIndex = nextIndex;
        advanceStep();
      }, duration);

      return () => {
        clearInterval(progressTimer);
        clearTimeout(stepTimer);
      };
    };

    const cleanup = advanceStep();
    return () => { cleanup?.(); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const StepIcon = ({ status }: { status: Step['status'] }) => {
    if (status === 'done')
      return (
        <div className="shrink-0 text-green-500 bg-green-500/10 p-1.5 rounded-full flex items-center justify-center">
          <CheckCircleOutlined className="text-lg" />
        </div>
      );
    if (status === 'active')
      return (
        <div className="shrink-0 text-[#F6921E] p-1.5 flex items-center justify-center">
          <LoadingOutlined className="text-lg" spin />
        </div>
      );
    return (
      <div className="shrink-0 text-slate-500 p-1.5 flex items-center justify-center">
        <ClockCircleOutlined className="text-lg" />
      </div>
    );
  };

  return (
    <div
      className="flex flex-col items-center justify-center min-h-full p-4 font-[gilroy-regular]"
      style={{ background: 'linear-gradient(135deg, #333333, #F6921E)' }}
    >
      <div
        className="w-full max-w-[560px] rounded-xl shadow-2xl overflow-hidden"
        style={{
          background: 'rgba(43,43,43,0.85)',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
          border: '1px solid rgba(255,255,255,0.1)',
        }}
      >
        {/* Header */}
        <header className="flex items-center justify-between border-b border-white/10 px-6 py-4">
          <div className="flex items-center gap-3">
            <SafetyOutlined className="text-[#F6921E] text-2xl" />
            <h2 className="text-white text-lg font-bold tracking-tight">HVNC Platform</h2>
          </div>
          <button className="flex items-center justify-center rounded-lg h-10 w-10 hover:bg-white/10 transition-colors text-slate-300">
            <SettingOutlined className="text-base" />
          </button>
        </header>

        {/* Body */}
        <div className="p-8 flex flex-col items-center text-center">

          {/* Animated Icon */}
          <div className="relative flex items-center justify-center mb-8">
            <div className="absolute w-24 h-24 bg-[#F6921E]/20 rounded-full animate-ping" />
            <div
              className="relative p-6 rounded-full border border-[#F6921E]/30"
              style={{ background: 'rgba(246,146,30,0.1)' }}
            >
              <LoadingOutlined className="text-[#F6921E] text-5xl" spin />
            </div>
          </div>

          <h3 className="text-xl font-bold text-white mb-2">Establishing Secure Connection...</h3>
          <p className="text-slate-400 mb-8 max-w-sm text-sm">
            Connecting to{' '}
            <span className="text-[#F6921E] font-mono bg-[#F6921E]/10 px-2 py-0.5 rounded">
              WORK-PC-01
            </span>
            . Please stay on this screen.
          </p>

          {/* Progress Bar */}
          <div className="w-full space-y-2 mb-8">
            <div className="flex justify-between text-sm font-medium">
              <span className="text-slate-300">Total Progress</span>
              <span className="text-[#F6921E]">{progress}%</span>
            </div>
            <div className="h-2.5 w-full bg-slate-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-[#F6921E] rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          {/* Steps */}
          <div className="w-full space-y-3">
            {steps.map((step, idx) => (
              <div
                key={idx}
                className={`flex items-center gap-4 p-4 rounded-lg border transition-all
                  ${step.status === 'active'
                    ? 'bg-white/5 border-[#F6921E]/30'
                    : step.status === 'done'
                    ? 'bg-white/5 border-white/5'
                    : 'bg-white/5 border-white/5 opacity-50'}`}
              >
                <StepIcon status={step.status} />
                <div className="flex flex-col text-left">
                  <p className={`text-sm font-medium ${step.status === 'pending' ? 'text-slate-400' : 'text-slate-100'}`}>
                    {step.label}
                  </p>
                  <p className={`text-xs mt-0.5 ${step.status === 'done' ? 'text-green-400' : step.status === 'active' ? 'text-[#F6921E]/80' : 'text-slate-600'}`}>
                    {step.status === 'done'
                      ? step.subLabel
                      : step.status === 'active'
                      ? step.activeSubLabel
                      : 'Waiting...'}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Cancel Button */}
        <div className="px-8 pb-8 flex justify-center">
          <button
            onClick={async () => {
              if (onCancelApi) await onCancelApi();
              onCancel();
            }}
            className="flex items-center gap-2 px-6 py-2.5 rounded-lg bg-white/5 hover:bg-white/10
              text-slate-300 text-sm font-medium transition-all border border-white/10"
          >
            <CloseOutlined className="text-sm" /> Cancel Connection
          </button>
        </div>
      </div>

      {/* Encryption note */}
      <div className="mt-6 flex items-center gap-2 text-white/30 text-xs tracking-widest uppercase">
        <LockOutlined className="text-sm" />
        End-to-End Encrypted Session
      </div>
    </div>
  );
};

export default UserHVNCConnecting;
