import React, { ReactElement, useEffect, useRef, useState } from 'react';
import { CanvasSpace, ISoundAnalyzer, Sound, SoundType } from 'pts';
import { useTheme } from '@mui/material/styles';
import Meyda, { MeydaFeaturesObject } from 'meyda';

import { getAudioStream } from '../utils';
import { Typography } from '@mui/material';
import AudioFeatureDebug from './AudioFeatureDebug';
import useMeydaAnalyzer from '../hooks/useMeydaAnalyzer';

/**
 * https://github.com/meyda/meyda/issues/891#issuecomment-867279485
 */
// this is the default value from Web Audio API
// see https://webaudio.github.io/web-audio-api/#AnalyserNode-attributes
const minDecibels = -100;
const maxDecibels = -30;
const smoothingTimeConstant = 0.8;

const getSmoothingDataInByte = (spectralFeature: Float32Array) => {
  const smoothingArrayInByte = [];
  const previousSmooth = new Float32Array(spectralFeature.length);
  for (let i = 0; i < spectralFeature.length; i++) {
    const v0 = spectralFeature[i];

    // smooth over data
    // https://webaudio.github.io/web-audio-api/#fft-windowing-and-smoothing-over-time
    previousSmooth[i] =
      smoothingTimeConstant * previousSmooth[i] +
      (1 - smoothingTimeConstant) * v0;

    // convert to dB
    // https://webaudio.github.io/web-audio-api/#conversion-to-db
    const v1 = 20 * Math.log10(previousSmooth[i]);

    // convert to byte
    // https://webaudio.github.io/web-audio-api/#AnalyserNode-methods
    const byte =
      (255 / (maxDecibels - minDecibels)) *
      ((Number.isFinite(v1) ? v1 : 0) - minDecibels);

    smoothingArrayInByte[i] = byte;
  }
  return smoothingArrayInByte;
};

const bufferToWaveForm = (buffer: number[], canvasHeight: number) => {
  const wave = buffer.map((value: number) => {
    return (value / 225.0) * canvasHeight;
  });
  return wave;
};

const ampSpectrumToDB = (amplitudeSpectrum: Float32Array) => {
  return amplitudeSpectrum.map((value: number) => Math.log10(value));
};

interface Props {
  selectedMediaDeviceId: string;
}

const drawReference = (
  ctx: CanvasRenderingContext2D,
  canvasWidth: number,
  canvasHeight: number
) => {
  const y = (ctx.strokeStyle = '#333');
  ctx.beginPath();
  ctx.lineTo(0, canvasHeight / 2);
  ctx.lineTo(canvasWidth, canvasHeight / 2);
  ctx.stroke();
};

const drawFeatures = (
  features: MeydaFeaturesObject,
  ctx: CanvasRenderingContext2D,
  canvasWidth: number,
  canvasHeight: number
) => {
  const drawSpectralFeature = (
    ctx: CanvasRenderingContext2D,
    spectralFeature: Float32Array | number[],
    color: string
  ) => {
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.strokeStyle = color;
    spectralFeature.forEach((value: number, x: number) => {
      // TODO: map value to y
      // const y = (canvasHeight / 22.05) * value;
      ctx.lineTo((canvasWidth / spectralFeature.length) * x, value);
    });
    ctx.stroke();
  };

  const drawTimeDomainFeature = (
    ctx: CanvasRenderingContext2D,
    timeDomainFeature: number,
    color: string
  ) => {
    ctx.beginPath();
    ctx.moveTo(0, canvasHeight * features.rms);
    ctx.lineTo(canvasWidth, canvasHeight * timeDomainFeature);
    ctx.strokeStyle = color;
    ctx.stroke();
  };

  /**
   * Start draw process
   */
  ctx.clearRect(0, 0, canvasWidth, canvasHeight);

  drawReference(ctx, canvasWidth, canvasHeight);

  drawTimeDomainFeature(ctx, features.rms, 'red');

  drawSpectralFeature(ctx, features.amplitudeSpectrum, 'red');

  drawSpectralFeature(
    ctx,
    bufferToWaveForm(features.buffer, canvasHeight),
    'blue'
  );

  drawSpectralFeature(
    ctx,
    getSmoothingDataInByte(features.amplitudeSpectrum),
    'green'
  );

  // drawSpectralFeature(
  //   ctx,
  //   getSmoothingDataInByte(features.powerSpectrum),
  //   'orange'
  // );
};

export default function VolumeMeter({
  selectedMediaDeviceId,
}: Props): ReactElement {
  // const [features, setFeatures] = useState(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const theme = useTheme();
  const { running, setRunning, features } = useMeydaAnalyzer(
    [
      'rms',
      'amplitudeSpectrum',
      'powerSpectrum',
      'chroma',
      'loudness',
      'buffer',
    ],
    selectedMediaDeviceId
  );

  const CANVAS_WIDTH = theme.dimensions.Tray.width;
  const CANVAS_HEIGHT =
    theme.dimensions.Tray.height - theme.dimensions.Navigation.height;

  useEffect(() => {
    setRunning(true);
    if (!canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');

    let requestId: number;
    if (features) {
      requestId = requestAnimationFrame(() =>
        drawFeatures(features, ctx, canvas.width, canvas.height)
      );
    }

    return () => {
      cancelAnimationFrame(requestId);
      setRunning(false);
    };
  }, [running, features]);

  return (
    <>
      <div
        style={{
          position: 'fixed',
          width: '100%',
          top: theme.dimensions.Navigation.height,
          // backgroundColor: `rgba(100, 0, 0, ${features?.rms})`,
          padding: 8,
        }}
      >
        {features && <AudioFeatureDebug features={features} />}
      </div>
      <div
        style={{
          position: 'fixed',
          width: '100%',
          bottom: 32,
        }}
      >
        <canvas
          ref={canvasRef}
          id="audio-visualizer"
          width={CANVAS_WIDTH}
          height={CANVAS_HEIGHT}
          style={{
            transform: 'rotateX(180deg)',
            // backgroundColor: `rgba(100, 0, 0, ${features?.rms})`,
          }}
        />
      </div>
    </>
  );
}
