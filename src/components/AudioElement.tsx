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
    setSeekedTime(0);
    audioEl.currentTime = 0;
  };

  const handleSeeked = (event: any) => {
    console.log('handleSeeked, currnetTime:', event.target.currentTime)
    setCurrentTime(event.target.currentTime);
  }

  /**
   * Bind audio element to playing state
   */
  useEffect(() => {
    if (!audioRef.current) return;

    playing
      ? audioRef.current.audioEl.current.play()
      : audioRef.current.audioEl.current.pause();
  }, [playing])

  /**
   * Bind the audio element's currentTime to the updated seekedTime state
   */
  useEffect(() => {
    if (!audioRef.current) return;
    
    if ((seekedTime || seekedTime === 0) && currentTime !== seekedTime) {
      audioRef.current.audioEl.current.currentTime = seekedTime;
    }
  }, [seekedTime]);

  /**
   * Reset currentTime state and audio elemens currentTime state
   * to 0 and play when playing a different recording
   */
  useEffect(() => {
    console.log('### currentPlaying:', currentPlaying)
    if (!audioRef.current) return;

    setCurrentTime(0)
    audioRef.current.audioEl.current.currentTime = 0;
    audioRef.current.audioEl.current.play()
  }, [currentPlaying])

  if (!currentPlaying) return null;
  if (caching) return null;

  const audioSrc = isElectron() ? 'tapes://' + currentPlaying.filename : `https://${currentPlaying.cid}.ipfs.dweb.link/${currentPlaying.filename}`

  return (
    <ReactAudioPlayer
      ref={audioRef}
      src={audioSrc}
      listenInterval={500}
      onListen={handleListen}
      onEnded={handleEnded}
      onSeeked={handleSeeked}
      onCanPlay={() => console.log('*** can play ***')}
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
