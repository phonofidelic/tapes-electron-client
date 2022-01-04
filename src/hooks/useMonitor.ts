/**
 * https://stackoverflow.com/a/57301635
 */
import { useState, useEffect } from 'react';
import { getAudioStream } from '../utils';

export default function useMonitor(selectedMediaDeviceId: string) {
  const [isMonitoring, setIsMonitoring] = useState(false);

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
