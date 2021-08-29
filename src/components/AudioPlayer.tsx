import React, { ReactElement } from 'react';
import { Recording } from '../common/Recording.interface';
import useAudioPreview from '../hooks/useAudioPreview';

import PlayButton from './PlayButton';
import StopButton from './StopButton';
import AudioAnalyser from './AudioAnalyser';

import LinearProgress from '@material-ui/core/LinearProgress';

interface Props {
  recording: Recording;
  bucketToken: string;
}

export default function AudioPlayer({
  recording,
  bucketToken,
}: Props): ReactElement {
  const { curTime, duration, playing, setPlaying, setClickedTime } =
    useAudioPreview(recording._id);

  const handlePlay = () => {
    setPlaying(true);
  };

  const handleStop = () => {
    setPlaying(false);
  };

  return (
    <div>
      <div
        style={{
          textAlign: 'center',
        }}
      >
        {playing ? (
          <StopButton handleStop={handleStop} />
        ) : (
          <PlayButton handlePlay={handlePlay} />
        )}
      </div>

      <LinearProgress
        variant="determinate"
        value={(curTime / duration) * 100}
      />
      <audio id={recording._id}>
        <source src={recording.remoteLocation + `?token=${bucketToken}`} />
        <source src={'tapes://' + recording.location} />
      </audio>
    </div>
  );
}
