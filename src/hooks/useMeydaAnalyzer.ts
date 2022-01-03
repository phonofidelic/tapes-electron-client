import { useState, useEffect } from 'react';
import { getAudioStream } from '../utils';
import Meyda, { MeydaFeaturesObject } from 'meyda';

/**
 * https://stackoverflow.com/a/57301635
 */
export default function useMeydaAnalyzer(
  featureExtractors: string[],
  selectedMediaDeviceId: string
) {
  const [analyzer, setAnalyzer] = useState<Meyda.MeydaAnalyzer>(null);
  const [running, setRunning] = useState(false);
  const [features, setFeatures] = useState(null);

  useEffect(() => {
    const audioContext = new AudioContext();

    let newAnalyzer: Meyda.MeydaAnalyzer;
    getAudioStream(selectedMediaDeviceId).then((stream) => {
      if (audioContext.state === 'closed') return;

      const source = audioContext.createMediaStreamSource(stream);
      newAnalyzer = Meyda.createMeydaAnalyzer({
        audioContext: audioContext,
        source: source,
        bufferSize: 512,
        featureExtractors,
        callback: (features: MeydaFeaturesObject) => {
          // console.log(features);
          setFeatures(features);
        },
      });
      setAnalyzer(newAnalyzer);
    });

    return () => {
      if (newAnalyzer) newAnalyzer.stop();
      if (audioContext) audioContext.close();
    };
  }, []);

  useEffect(() => {
    if (analyzer) {
      running ? analyzer.start() : analyzer.stop();
    }
  }, [running, analyzer]);

  return { running, setRunning, features };
}
