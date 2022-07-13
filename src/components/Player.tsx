import React, { ReactElement, useEffect, useState, useRef } from 'react';
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
  const [progressPosition, setProgressPosition] = useState((currentTime / duration) * 100)

  const handlePlay = () => {
    playRecording();
  };

  const handlePause = () => {
    pauseRecording();
  };

  const handleSeek = (event: React.MouseEvent<HTMLDivElement>) => {
    setProgressPosition((event.clientX / progressRef.current.offsetWidth) * 100)
  }

  const handleProgressClick = (event: React.MouseEvent<HTMLDivElement>) => {
    const clickedProgress = event.clientX / progressRef.current.offsetWidth;
    setSeekedTime(duration * clickedProgress);
    setProgressPosition((duration * clickedProgress / duration) * 100)
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
        <div 
          style={{ 
            position: 'relative',
            marginBottom: 4
          }}
        >
          {/* <LinearProgress
            style={{
              borderRadius: '8px 8px 0px 0px',
            }}
            ref={progressRef}
            variant={caching ? 'indeterminate' : 'determinate'}
            value={(currentTime / duration) * 100}
            onClick={
              !caching
                ? handleProgressClick
                : () => console.log('still caching')
            }
          /> */}
          <Slider
            ref={progressRef}
            size="small"
            style={{ 
              position: 'absolute', padding: 0,
              borderRadius: '8px 8px 0px 0px',
              height: 4
            }}
            value={seeking ? progressPosition : (currentTime / duration) * 100}
            valueLabelDisplay="auto"
            onMouseDown={() => setSeeking(true)}
            valueLabelFormat={handleValueLabelFormat}
            //@ts-ignore
            onChange={handleSeek}
            onChangeCommitted={
              !caching
                ? handleProgressClick
                : () => console.log('still caching')
            }
          />
        </div>
        <div
          style={{
            display: 'flex',
            // margin: 4,
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
