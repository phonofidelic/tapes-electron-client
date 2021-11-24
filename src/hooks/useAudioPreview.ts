/**
 * From: https://codesandbox.io/s/5wwj02qy7k?file=/src/useAudioPlayer.js
 */
import { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { cacheRecording } from '../effects';

function useAudioPlayer(recordingId: string) {
  const [duration, setDuration] = useState(0);
  const [curTime, setCurTime] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [clickedTime, setClickedTime] = useState(0);
  const [isCached, setIsCached] = useState(false);

  const dispatch = useDispatch();

  const handlePlay = (audio: HTMLAudioElement) => {
    console.log('handlePlay dispatches cacheRecording');
    dispatch(cacheRecording(recordingId, audio));

    setIsCached(true);
  };

  useEffect(() => {
    const audio = <HTMLAudioElement>document.getElementById(recordingId);

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
    // playing && !audio.ended ? audio.play() : resetAudio();
    playing && !audio.ended
      ? isCached
        ? audio.play()
        : handlePlay(audio)
      : resetAudio();

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
  }, [playing, clickedTime]);

  return {
    curTime,
    duration,
    playing,
    setPlaying,
    setClickedTime,
  };
}

export default useAudioPlayer;
