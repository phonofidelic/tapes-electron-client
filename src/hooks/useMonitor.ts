/**
 * https://stackoverflow.com/a/57301635
 */
import { useState, useEffect } from 'react';

export default function useMonitor(selectedMediaDeviceId: string) {
  const [isMonitoring, setIsMonitoring] = useState(false);

  const getAudioStream = async (selectedMediaDeviceId: string) => {
    let audioStream;
    try {
      audioStream = await navigator.mediaDevices.getUserMedia({
        audio: { deviceId: selectedMediaDeviceId },
        video: false,
      });
    } catch (err) {
      console.error('*** Could not get media stream:', err);
      throw new Error('Could not get media stream');
    }
    return audioStream;
  };

  useEffect(() => {
    const audioCtx = new window.AudioContext();

    getAudioStream(selectedMediaDeviceId).then((audioStream) => {
      if (audioCtx.state === 'closed') return;

      const sourceNode = audioCtx.createMediaStreamSource(audioStream);
      if (isMonitoring) {
        sourceNode.connect(audioCtx.destination);
      }
    });

    return () => {
      audioCtx.close();
    };
  }, [isMonitoring]);

  return {
    isMonitoring,
    setIsMonitoring,
  };
}
