import React, { useRef, useEffect } from 'react';
import isElectron from 'is-electron';
import { connect } from 'react-redux';
import * as actions from '../store/actions';
import {
  PauseRecordingAction,
  RecorderState,
  SetCurrentTimeAction,
  SetSeekedTimeAction,
} from '../store/types';
import ReactAudioPlayer from 'react-audio-player';
import { Recording } from '../common/Recording.interface';

type AudioElementProps = {
  playing: boolean;
  currentTime: number;
  seekedTime: number;
  currentPlaying: Recording;
  caching: boolean;
  setSeekedTime(time: number): SetSeekedTimeAction;
  setCurrentTime(time: number): SetCurrentTimeAction;
  pauseRecording(): PauseRecordingAction;
};

export function AudioElement({
  playing,
  currentTime,
  seekedTime,
  currentPlaying,
  caching,
  setSeekedTime,
  setCurrentTime,
  pauseRecording,
}: AudioElementProps) {
  const audioRef = useRef(null);

  const handleListen = (currentTime: number) => {
    setCurrentTime(currentTime);
  };

  const handleEnded = (event: Event) => {
    const audioEl = event.currentTarget as HTMLAudioElement;
    pauseRecording();
    setCurrentTime(0);
    audioEl.currentTime = 0;
  };

  const handleSeeked = (event: any) => {
    setCurrentTime(event.target.currentTime);
  }

  useEffect(() => {
    if (!audioRef.current) return;

    playing
      ? audioRef.current.audioEl.current.play()
      : audioRef.current.audioEl.current.pause();

    if (seekedTime && currentTime !== seekedTime) {
      audioRef.current.audioEl.current.currentTime = seekedTime;
      setSeekedTime(0);
    }
  }, [playing, seekedTime, caching]);

  if (!currentPlaying) return null;
  if (caching) return null;

  const audioSrc = isElectron() ? 'tapes://' + currentPlaying.filename : `https://${currentPlaying.cid}.ipfs.dweb.link/${currentPlaying.filename}`

  return (
    <ReactAudioPlayer
      ref={audioRef}
      // src={'tapes://' + currentPlaying.filename}
      src={audioSrc}
      listenInterval={500}
      onListen={handleListen}
      onEnded={handleEnded}
      onSeeked={handleSeeked}
    />
  );
}

const mapStateToProps = (state: RecorderState) => {
  return {
    playing: state.playing,
    currentTime: state.currentTime,
    seekedTime: state.seekedTime,
    currentPlaying: state.currentPlaying,
    caching: state.caching
  };
};

export default connect(mapStateToProps, actions)(AudioElement);
