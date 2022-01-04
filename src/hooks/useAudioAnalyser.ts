import { useState, useEffect } from 'react';
import { getAudioStream } from '../utils';

export default function useAudioAnalyser(
  selectedMediaDeviceId: string,
  feature: 'time-domain' | 'frequency',
  callback: () => void
) {
  const [audioData, setAudioData] = useState<Uint8Array | []>([]);

  useEffect(() => {
    const audioContext = new AudioContext();
    let rafId: number;
    let source: MediaStreamAudioSourceNode;

    getAudioStream(selectedMediaDeviceId).then((stream) => {
      source = audioContext.createMediaStreamSource(stream);
      const analyser = audioContext.createAnalyser();
      source.connect(analyser);

      let dataArray = new Uint8Array(analyser.frequencyBinCount);

      const tick = () => {
        feature === 'frequency'
          ? analyser.getByteFrequencyData(dataArray)
          : analyser.getByteTimeDomainData(dataArray);

        // console.log('dataArray:', dataArray);
        setAudioData(dataArray);

        rafId = requestAnimationFrame(tick);
      };

      // tick();
      rafId = requestAnimationFrame(tick);
    });

    return () => {
      if (rafId) cancelAnimationFrame(rafId);
      if (source) source.disconnect();
      if (audioContext) audioContext.close();
    };
  }, []);

  // console.log('audioData', audioData);
  return audioData;
}
