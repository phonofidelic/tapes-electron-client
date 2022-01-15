import React, { ReactElement, useEffect, useRef } from 'react';
import { connect } from 'react-redux';
import * as actions from '../store/actions';
import {
  PauseRecordingAction,
  PlayRecordingAction,
  RecorderState,
} from '../store/types';
import { useLocation } from 'react-router';
import useAudioPreview from '../hooks/useAudioPreview';
import { Recording } from '../common/Recording.interface';

import PlayButton from './PlayButton';
import PauseButton from './PauseButton';
import AudioPlayer from './AudioPlayer';

import {
  Paper,
  Slide,
  Typography,
  LinearProgress,
  useTheme,
} from '@material-ui/core';

interface Props {
  playing: boolean;
  currentPlaying: Recording;
  caching: boolean;
  playRecording(recording: Recording): PlayRecordingAction;
  pauseRecording(): PauseRecordingAction;
}

export function Player({
  playing,
  currentPlaying,
  caching,
  playRecording,
  pauseRecording,
}: Props): ReactElement {
  const theme = useTheme();
  const { pathname } = useLocation();
  const progressRef = useRef(null);

  const {
    curTime,
    // playing,
    duration,
    setPlaying,
    setClickedTime,
  } = useAudioPreview(currentPlaying?._id, currentPlaying?.location);

  // console.log('currentPlaying?.location', currentPlaying?.location);

  const handlePlay = () => {
    setPlaying(true);
    playRecording(currentPlaying);
  };

  const handlePause = () => {
    setPlaying(false);
    pauseRecording();
  };

  const handleProgressClick = (event: React.MouseEvent<HTMLDivElement>) => {
    const clickedProgress = event.clientX / progressRef.current.offsetWidth;
    setClickedTime(duration * clickedProgress);
  };

  useEffect(() => {
    if (!currentPlaying) return;
    console.log('currentPlaying:', currentPlaying?.title);
    // !caching && handlePlay();
    playing ? handlePlay() : handlePause();
  }, [currentPlaying, caching]);

  // console.log('Player, curTime:', curTime);

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
          // padding: 4,
          // paddingTop: 0,
          zIndex: theme.zIndex.appBar,
        }}
      >
        <div>
          {playing && (
            <LinearProgress
              style={{
                borderRadius: '4px, 4px, 0, 0',
              }}
              ref={progressRef}
              variant={caching ? 'indeterminate' : 'determinate'}
              value={(curTime / duration) * 100}
              onClick={
                !caching
                  ? handleProgressClick
                  : () => console.log('still caching')
              }
            />
          )}
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
              <Typography>{currentPlaying.title}</Typography>
            </div>
          </div>
          {/* <audio id={currentPlaying._id}>
          <source src={'tapes://' + currentPlaying.location} />
        </audio> */}
        </div>
      </Paper>
    </Slide>
  );
}

const mapStateToProps = (state: RecorderState) => {
  return {
    playing: state.playing,
    currentPlaying: state.currentPlaying,
    caching: state.caching,
  };
};

export default connect(mapStateToProps, actions)(Player);
