import React, { ReactElement, useRef, useEffect } from 'react';
import { useTheme } from '@material-ui/core/styles';
import useAudioAnalyser from '../hooks/useAudioAnalyser';
import { getAudioStream } from '../utils';

const draw = (
  data: Uint8Array | [],
  feature: 'frequency' | 'time-domain',
  ctx: CanvasRenderingContext2D,
  canvasWidth: number,
  canvasHeight: number
) => {
  let x = 0;
  const sliceWidth = (canvasWidth * 1.0) / data.length;
  ctx.lineWidth = 1;

  ctx.clearRect(0, 0, canvasWidth, canvasHeight);

  const drawAverage = () => {
    /**
     * Draw average
     */
    const sum = (data as any[]).reduce((a: number, b: number) => a + b);
    const average = sum / data.length || 0;
    if (average >= 128) {
      ctx.strokeStyle = 'red';
      ctx.lineWidth = 3;
    }
    const aveY = (average / 255.0) * canvasHeight;
    ctx.beginPath();
    ctx.moveTo(0, aveY);
    ctx.lineTo(canvasWidth, aveY);
    ctx.stroke();
  };
  feature === 'frequency' && drawAverage();

  /**
   * Draw curve
   */
  ctx.lineWidth = 1;
  ctx.strokeStyle = '#333';
  ctx.fillStyle = '#333';
  ctx.beginPath();
  for (const item of data) {
    // Normalize point data to canvas dimensions
    const y = (item / 255.0) * canvasHeight;
    ctx.lineTo(x, y);
    x += sliceWidth;
  }
  feature === 'frequency' ? ctx.lineTo(x, 0) : ctx.lineTo(x, canvasHeight / 2);
  // ctx.strokeStyle = '#333';
  // feature === 'frequency' && ctx.lineTo(0, 0);
  ctx.stroke();
  // ctx.fill();
};

interface Props {
  selectedMediaDeviceId: string;
  feature: 'frequency' | 'time-domain';
}

export default function AudioVisualiser({
  selectedMediaDeviceId,
  feature,
}: Props): ReactElement {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const theme = useTheme();
  // const audioData = useAudioAnalyser(selectedMediaDeviceId, 'frequency');

  const CANVAS_WIDTH = theme.dimensions.Tray.width;
  const CANVAS_HEIGHT =
    theme.dimensions.Tray.height - theme.dimensions.Navigation.height;

  useEffect(() => {
    if (!canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const audioContext = new AudioContext();
    let rafId: number;

    getAudioStream(selectedMediaDeviceId).then((stream) => {
      const source = audioContext.createMediaStreamSource(stream);
      const analyser = audioContext.createAnalyser();
      analyser.fftSize = 128;
      source.connect(analyser);

      let dataArray = new Uint8Array(analyser.frequencyBinCount);

      const tick = () => {
        feature === 'frequency'
          ? analyser.getByteFrequencyData(dataArray)
          : analyser.getByteTimeDomainData(dataArray);

        draw(dataArray, feature, ctx, canvas.width, canvas.height);

        rafId = requestAnimationFrame(tick);
      };

      tick();
    });

    return () => {
      cancelAnimationFrame(rafId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      width={CANVAS_WIDTH}
      height={CANVAS_HEIGHT}
      style={{
        transform: 'rotateX(180deg)',
      }}
    />
  );
}
