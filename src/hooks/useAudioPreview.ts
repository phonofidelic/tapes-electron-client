/**
 * Adapted from: https://codesandbox.io/s/5wwj02qy7k?file=/src/useAudioPlayer.js
 */
import { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { cacheAndPlayRecording } from '../effects';

function useAudioPreview(recordingId: string, location?: string) {
  const [duration, setDuration] = useState(0);
  const [curTime, setCurTime] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [clickedTime, setClickedTime] = useState(0);
  const [isCached, setIsCached] = useState(false);

  const [pausedTime, setPausedTime] = useState(0);

  const dispatch = useDispatch();

  useEffect(() => {
    const audio = <HTMLAudioElement>document.getElementById('audio-player');
    const source = <HTMLSourceElement>document.getElementById('audio-source');
    source.src = 'tapes://' + location;

    const handlePlay = () => {
      const cacheAndPlay = () => {
        dispatch(cacheAndPlayRecording(recordingId, playing));
        setIsCached(true);
      };

      audio.load();
      if (pausedTime) audio.currentTime = pausedTime;
      isCached ? audio.play() : cacheAndPlay();
      setPausedTime(0);
    };

    const handlePause = () => {
      setPausedTime(curTime);
      audio.pause();
    };

    // state setters wrappers
    const setAudioData = () => {
      setDuration(audio.duration);
      setCurTime(audio.currentTime);
    };

    const setAudioTime = () => setCurTime(audio.currentTime);

    const resetAudio = () => {
      setPlaying(false);
      audio.pause();
      audio.load();
    };

    // DOM listeners: update React state on DOM events
    audio.addEventListener('loadedmetadata', setAudioData);
    audio.addEventListener('timeupdate', setAudioTime);
    audio.addEventListener('ended', resetAudio);

    // React state listeners: update DOM on React state changes
    playing && !audio.ended ? handlePlay() : handlePause();
    audio.ended && resetAudio();

    if (clickedTime && clickedTime !== curTime) {
      console.log('clickedTime:', clickedTime);
      audio.currentTime = clickedTime;
      setClickedTime(null);
    }

    // effect cleanup
    return () => {
      audio.removeEventListener('loadedmetadata', setAudioData);
      audio.removeEventListener('timeupdate', setAudioTime);
      audio.removeEventListener('ended', resetAudio);
    };
  }, [playing, clickedTime, recordingId]);

  return {
    curTime,
    duration,
    playing,
    setPlaying,
    setClickedTime,
  };
}

export default useAudioPreview;
