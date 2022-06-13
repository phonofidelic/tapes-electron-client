import React, { ReactElement, useEffect, useRef } from 'react';
import { connect } from 'react-redux';
import * as actions from '../store/actions';
import {
  PauseRecordingAction,
  PlayRecordingAction,
  RecorderState,
  SetSeekedTimeAction,
} from '../store/types';
import { useLocation } from 'react-router';
import { Recording } from '../common/Recording.interface';
import { msToTime } from '../utils';

import PlayButton from './PlayButton';
import PauseButton from './PauseButton';

import {
  Paper,
  Slide,
  Typography,
  LinearProgress,
  useTheme,
} from '@mui/material';

interface Props {
  playing: boolean;
  currentPlaying: Recording;
  currentTime: number;
  caching: boolean;
  playRecording(): PlayRecordingAction;
  pauseRecording(): PauseRecordingAction;
  setSeekedTime(time: number): SetSeekedTimeAction;
}

export function Player({
  playing,
  currentPlaying,
  currentTime,
  caching,
  playRecording,
  pauseRecording,
  setSeekedTime,
}: Props): ReactElement {
  const theme = useTheme();
  const { pathname } = useLocation();
  const progressRef = useRef(null);

  // console.log('currentPlaying?.location', currentPlaying?.location);

  const duration = currentPlaying?.duration || 0;

  const handlePlay = () => {
    playRecording();
  };

  const handlePause = () => {
    pauseRecording();
  };

  const handleProgressClick = (event: React.MouseEvent<HTMLDivElement>) => {
    const clickedProgress = event.clientX / progressRef.current.offsetWidth;
    setSeekedTime(duration * clickedProgress);
  };

  useEffect(() => {
    if (!currentPlaying) return;
    console.log('playing:', playing);
    playing ? handlePlay() : handlePause();
  }, [currentPlaying, caching, playing]);

  // console.log('Player, currentPlaying.title:', currentPlaying?.title);

  if (!currentPlaying) return null;

  return (
    <Slide in={Boolean(currentPlaying)} direction="up">
      <Paper
        style={{
          position: 'fixed',
          right: 0,
          bottom: 0,
          left: 0,
          display: /library/.test(pathname) ? 'flex' : 'none',
          flexDirection: 'column',
          margin: 4,
          zIndex: theme.zIndex.appBar,
          borderRadius: '8px'
        }}
      >
        <div>
          <LinearProgress
            style={{
              borderRadius: '8px, 8px, 0, 0',
            }}
            ref={progressRef}
            variant={caching ? 'indeterminate' : 'determinate'}
            value={(currentTime / duration) * 100}
            onClick={
              !caching
                ? handleProgressClick
                : () => console.log('still caching')
            }
          />
        </div>
        <div
          style={{
            display: 'flex',
            margin: 4,
          }}
        >
          {!playing ? (
            <PlayButton handlePlay={handlePlay} />
          ) : (
            <PauseButton handlePause={handlePause} />
          )}
          <div
            style={{
              marginLeft: 4,
            }}
          >
            <div>
              <Typography noWrap>{currentPlaying.title}</Typography>
            </div>
            <div>
              <Typography variant="caption">
                {msToTime(currentTime * 1000)}
              </Typography>
            </div>
          </div>
        </div>
      </Paper>
    </Slide>
  );
}

const mapStateToProps = (state: RecorderState) => {
  return {
    playing: state.playing,
    currentPlaying: state.currentPlaying,
    currentTime: state.currentTime,
    caching: state.caching,
  };
};

export default connect(mapStateToProps, actions)(Player);
