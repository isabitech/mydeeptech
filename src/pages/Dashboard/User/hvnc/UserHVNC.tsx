import React, { useState } from 'react';
import UserHVNCPortal from './UserHVNCPortal';
import UserHVNCConnecting from './UserHVNCConnecting';
import UserHVNCSession from './UserHVNCSession';
import { useHVNCSession } from '../../../../hooks/HVNC/User/useHVNCSession';

type Stage = 'portal' | 'connecting' | 'session';

const UserHVNC: React.FC = () => {
  const [stage, setStage] = useState<Stage>('portal');
  const [accessCode, setAccessCode] = useState('');

  const {
    session,
    sessionToken,
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
    setStage('portal');
  };

  const handleValidate = async (code: string) => {
    const result = await validateAccessCode(code);
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
      {stage === 'portal' && (
        <UserHVNCPortal
          onStartSession={handleStartSession}
          onValidate={handleValidate}
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
        />
      )}
    </div>
  );
};

export default UserHVNC;
