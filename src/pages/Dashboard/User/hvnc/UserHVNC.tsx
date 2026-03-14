import React, { useState } from 'react';
import UserHVNCPortal from './UserHVNCPortal';
import UserHVNCConnecting from './UserHVNCConnecting';
import UserHVNCSession from './UserHVNCSession';
import UserHVNCDashboard from './UserHVNCDashboard';
import { useHVNCSession } from '../../../../hooks/HVNC/User/useHVNCSession';

type Stage = 'dashboard' | 'portal' | 'connecting' | 'session';

const UserHVNC: React.FC = () => {
  const [stage, setStage] = useState<Stage>('dashboard');
  const [accessCode, setAccessCode] = useState('');
  const [selectedDeviceId, setSelectedDeviceId] = useState<string>('');

  const {
    session,
    sessionToken,
    validatedSessionId,
    validateAccessCode,
    cancelSession,
    terminateSession,
    pauseHubstaff,
  } = useHVNCSession();

  const handleStartSession = (code: string) => {
    setAccessCode(code);
    setStage('connecting');
  };

  const handleConnected = () => {
    setStage('session');
  };

  const handleCancel = () => {
    setAccessCode('');
    setStage('portal');
  };

  const handleDisconnect = () => {
    setAccessCode('');
    setStage('dashboard');
  };

  const handleGoToPortal = (deviceId: string) => {
    setSelectedDeviceId(deviceId);
    setStage('portal');
  };

  const handleBackToDashboard = () => {
    setAccessCode('');
    setSelectedDeviceId('');
    setStage('dashboard');
  };

  const handleValidate = async (code: string, email: string, deviceId: string) => {
    const result = await validateAccessCode(code, email, deviceId);
    if (result.success) {
      return { success: true };
    }
    return { success: false, error: result.error };
  };

  const handleCancelApi = async () => {
    if (sessionToken) {
      await cancelSession(sessionToken);
    }
  };

  const handleTerminate = async (sid: string) => {
    const result = await terminateSession(sid);
    return { success: result.success };
  };

  const handlePauseHubstaff = async (sid: string) => {
    const result = await pauseHubstaff(sid);
    return { success: result.success };
  };

  return (
    // Break out of the parent layout padding to fill the content area fully
    <div className="-m-6 min-h-full flex flex-col">
      {stage === 'dashboard' && (
        <UserHVNCDashboard
          onJoinSession={handleGoToPortal}
        />
      )}
      {stage === 'portal' && (
        <UserHVNCPortal
          selectedDeviceId={selectedDeviceId}
          onStartSession={handleStartSession}
          onValidate={handleValidate}
          onBackToDashboard={handleBackToDashboard}
        />
      )}
      {stage === 'connecting' && (
        <UserHVNCConnecting
          accessCode={accessCode}
          onConnected={handleConnected}
          onCancel={handleCancel}
          onCancelApi={handleCancelApi}
        />
      )}
      {stage === 'session' && (
        <UserHVNCSession
          accessCode={accessCode}
          onDisconnect={handleDisconnect}
          sessionId={session?.sessionId}
          initialHubstaffSecs={session?.hubstaffSeconds}
          initialSessionSecs={session?.sessionSeconds}
          onTerminate={handleTerminate}
          onPauseHubstaff={handlePauseHubstaff}
          jwtToken={sessionToken ?? undefined}
          deviceId={selectedDeviceId}
          validatedSessionId={validatedSessionId ?? undefined}
        />
      )}
    </div>
  );
};

export default UserHVNC;
