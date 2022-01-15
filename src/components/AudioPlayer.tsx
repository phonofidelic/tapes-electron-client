import React, { ReactElement, useRef } from 'react';
import { Recording } from '../common/Recording.interface';
import useAudioPreview from '../hooks/useAudioPreview';

import PlayButton from './PlayButton';
import StopButton from './StopButton';

import { useTheme } from '@material-ui/core';
import LinearProgress from '@material-ui/core/LinearProgress';

interface Props {
  recording: Recording;
  caching: boolean;
}

export default function AudioPlayer({
  recording,
  caching,
}: Props): ReactElement {
  const { curTime, duration, playing, setPlaying, setClickedTime } =
    useAudioPreview(recording._id);

  const progressRef = useRef(null);

  const theme = useTheme();

  const handlePlay = () => {
    setPlaying(true);
  };

  const handleStop = () => {
    setPlaying(false);
  };

  const handleProgressClick = (event: React.MouseEvent<HTMLDivElement>) => {
    const clickedProgress = event.clientX / progressRef.current.offsetWidth;
    setClickedTime(duration * clickedProgress);
  };

  return (
    <div style={{ backgroundColor: theme.palette.background.default }}>
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
        ref={progressRef}
        variant="determinate"
        value={(curTime / duration) * 100}
        onClick={
          !caching ? handleProgressClick : () => console.log('still caching')
        }
      />
    </div>
  );
}
