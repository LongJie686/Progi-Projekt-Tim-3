import React, { useEffect, useRef, useState, useCallback } from 'react';
import Button from '../common/Button';

interface VideoRoomProps {
  bookingId: string;
  roomName: string;
  displayName: string;
  onLeave: () => void;
}

const VideoRoom: React.FC<VideoRoomProps> = ({
  bookingId,
  roomName,
  displayName,
  onLeave,
}) => {
  const jitsiRef = useRef<HTMLDivElement>(null);
  const [isJoined, setIsJoined] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const apiRef = useRef<any>(null);

  const initializeJitsi = useCallback(() => {
    if (!jitsiRef.current || !window.JitsiMeetExternalAPI) {
      setError('Video service not available');
      return;
    }

    const domain = 'meet.jit.si';
    const options = {
      roomName: `stemtutor-${bookingId}-${roomName}`,
      width: '100%',
      height: '100%',
      parentNode: jitsiRef.current,
      userInfo: {
        displayName: displayName,
      },
      configOverwrite: {
        prejoinPageEnabled: false,
        startWithAudioMuted: true,
        startWithVideoMuted: false,
        disableInviteFunctions: true,
      },
      interfaceConfigOverwrite: {
        SHOW_JITSI_WATERMARK: false,
        SHOW_WATERMARK_FOR_GUESTS: false,
        DEFAULT_BACKGROUND: '#1a1a2e',
        TOOLBAR_BUTTONS: [
          'microphone', 'camera', 'closedcaptions', 'desktop',
          'fullscreen', 'fodeviceselection', 'hangup',
          'profile', 'chat', 'settings', 'raisehand',
          'videoquality', 'filmstrip', 'feedback',
          'shortcuts', 'tileview', 'select-background',
          'help', 'mute-everyone',
        ],
      },
    };

    try {
      // @ts-ignore - Jitsi external API
      apiRef.current = new window.JitsiMeetExternalAPI(domain, options);

      apiRef.current.addEventListeners({
        readyToClose: () => {
          onLeave();
        },
        participantLeft: (participant: any) => {
          console.log('Participant left:', participant);
        },
        participantJoined: (participant: any) => {
          console.log('Participant joined:', participant);
        },
        videoConferenceJoined: () => {
          setIsJoined(true);
        },
        videoConferenceLeft: () => {
          setIsJoined(false);
        },
      });
    } catch (err) {
      setError('Failed to initialize video room');
      console.error('Jitsi init error:', err);
    }
  }, [bookingId, roomName, displayName, onLeave]);

  useEffect(() => {
    // Load Jitsi script if not already loaded
    if (!window.JitsiMeetExternalAPI) {
      const script = document.createElement('script');
      script.src = 'https://meet.jit.si/external_api.js';
      script.async = true;
      script.onload = initializeJitsi;
      script.onerror = () => setError('Failed to load video service');
      document.body.appendChild(script);

      return () => {
        if (script.parentNode) {
          script.parentNode.removeChild(script);
        }
      };
    } else {
      initializeJitsi();
    }

    return () => {
      if (apiRef.current) {
        apiRef.current.dispose();
      }
    };
  }, [initializeJitsi]);

  const handleLeave = () => {
    if (apiRef.current) {
      apiRef.current.executeCommand('hangup');
    }
    onLeave();
  };

  if (error) {
    return (
      <div className="bg-red-50 text-red-600 p-4 rounded-lg">
        <p>{error}</p>
        <Button variant="outline" onClick={onLeave} className="mt-2">
          Go Back
        </Button>
      </div>
    );
  }

  return (
    <div className="relative h-full w-full bg-gray-900">
      <div ref={jitsiRef} className="h-full w-full" />
      {isJoined && (
        <div className="absolute top-4 right-4 z-10">
          <Button variant="danger" onClick={handleLeave}>
            Leave Session
          </Button>
        </div>
      )}
    </div>
  );
};

export default VideoRoom;