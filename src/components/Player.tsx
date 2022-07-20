import React, { ReactElement, useEffect, useState, useRef, useMemo } from 'react';
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
  Slider,
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
  const duration = currentPlaying?.duration || 0;
  const theme = useTheme();
  const { pathname } = useLocation();
  const progressRef = useRef(null);
  const [seeking, setSeeking] = useState(false)
  const [progressPosition, setProgressPosition] = useState(0)

  const handlePlay = () => {
    playRecording();
  };

  const handlePause = () => {
    pauseRecording();
  };

  const handleSeek = (event: any) => {
    const position = event.clientX || event.targetTouches?.[0].clientX
    // console.log('handleSeek, position:', position)
    // if (!position) return;

    setProgressPosition((position / progressRef.current.offsetWidth) * 100)
  }

  const handleProgressClick = (event: any, value: number) => {
    console.log('handleProgressClick event:', event)
    console.log('handleProgressClick value:', value)
    // const position = event.clientX || event.targetTouches[0].clientX
    const clickedProgress = value / 100;
    console.log('clickedProgress:', clickedProgress)
    setSeekedTime(duration * clickedProgress);

    const progressPosition = (duration * clickedProgress / duration) * 100
    console.log('progressPosition:', progressPosition)
    setProgressPosition(progressPosition)
    setSeeking(false)
  };

  const handleValueLabelFormat = (n: number) => {
    const percentage = n / 100
    const time = duration * percentage

    return msToTime(time * 1000)
  }

  useEffect(() => {
    if (!currentPlaying) return;
    console.log('playing:', playing);
    playing ? handlePlay() : handlePause();
  }, [currentPlaying, caching, playing]);

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
          borderRadius: '8px',
        }}
      >
        <div 
          style={{ 
            position: 'relative',
            marginBottom: 4
          }}
        >
          { caching ? (
              <LinearProgress variant="indeterminate" />
            ) : (
              <Slider
                ref={progressRef}
                size="small"
                style={{ 
                  position: 'absolute', 
                  padding: 0,
                  borderRadius: '8px 8px 0px 0px',
                  height: 4,
                }}
                value={seeking ? progressPosition : (currentTime / duration) * 100}
                valueLabelDisplay="auto"
                onMouseDown={() => setSeeking(true)}
                onTouchStart={() => setSeeking(true)}
                valueLabelFormat={handleValueLabelFormat}
                onChange={handleSeek}
                onChangeCommitted={handleProgressClick}
              />
            )
          }
          
        </div>
        <div
          style={{
            display: 'flex',
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
          <div style={{ flex: 1 }} />
          {currentPlaying.musicBrainzCoverArt && <div style={{
            width: 48,
            height: 48,
            borderRadius: '0 0 8px 0'
          }}>
            <img style={{ borderRadius: '0 0 8px 0' }} width={48} height={48} src={currentPlaying.musicBrainzCoverArt?.thumbnails?.small || ''} />
          </div>}
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
