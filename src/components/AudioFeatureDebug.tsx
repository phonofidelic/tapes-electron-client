import React, { ReactElement } from 'react';
import { MeydaFeaturesObject } from 'meyda';
import Typography from '@mui/material/Typography';

const PITCH_CLASS_LABELS = [
  'C',
  'C♯',
  'D',
  'D♯',
  'E',
  'F',
  'F♯',
  'G',
  'G♯',
  'A',
  'A♯',
  'B',
];

interface Props {
  features: MeydaFeaturesObject;
}

export default function AudioFeatureDebug({ features }: Props): ReactElement {
  return (
    <div>
      <div>
        <Typography variant="caption" color="textSecondary">
          rms: {features.rms}
        </Typography>
      </div>
      <div>
        <Typography variant="caption" color="textSecondary">
          amplitudeSpectrum: {features.amplitudeSpectrum[0]}
        </Typography>
      </div>
      <div>
        <Typography variant="caption" color="textSecondary">
          loudness: {features.loudness.total}
        </Typography>
      </div>
      <div>
        <div>
          <Typography variant="caption" color="textSecondary">
            chroma bands:
          </Typography>
        </div>
        <div
          style={{
            height: 20,
            display: 'flex',
            width: '100%',
            justifyContent: 'space-between',
          }}
        >
          {features.chroma.map((pitchClass: number, i: number) => (
            <div
              key={i}
              style={{
                flex: 1,
                backgroundColor: `rgba(0, 100, 0, ${pitchClass})`,
              }}
            >
              {PITCH_CLASS_LABELS[i]}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
