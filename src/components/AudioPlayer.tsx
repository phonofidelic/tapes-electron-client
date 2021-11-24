import React, { ReactElement, useRef } from 'react';
import { Recording } from '../common/Recording.interface';
import useAudioPreview from '../hooks/useAudioPreview';

import PlayButton from './PlayButton';
import StopButton from './StopButton';

import LinearProgress from '@material-ui/core/LinearProgress';

interface Props {
  recording: Recording;
  bucketToken: string;
  caching: boolean;
}

export default function AudioPlayer({
  recording,
  bucketToken,
  caching,
}: Props): ReactElement {
  const { curTime, duration, playing, setPlaying, setClickedTime } =
    useAudioPreview(recording._id);

  const progressRef = useRef(null);

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
        ref={progressRef}
        variant="determinate"
        value={(curTime / duration) * 100}
        onClick={
          !caching ? handleProgressClick : () => console.log('still caching')
        }
      />
      <audio id={recording._id}>
        {/* <source src={recording.remoteLocation + `?token=${bucketToken}`} /> */}
        <source src={'tapes://' + recording.location} />
      </audio>
    </div>
  );
}
