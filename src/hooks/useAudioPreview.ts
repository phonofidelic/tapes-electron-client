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

  const dispatch = useDispatch();

  useEffect(() => {
    // const audio = <HTMLAudioElement>document.getElementById(recordingId);
    const audio = <HTMLAudioElement>document.getElementById('audio-player');
    // <HTMLAudioElement>document.getElementById(recordingId) ||
    // <HTMLAudioElement>document.createElement('audio');
    // audio.id = recordingId;
    // const source = document.createElement('source');
    const source = <HTMLSourceElement>document.getElementById('audio-source');
    source.src = 'tapes://' + location;
    // console.log('source:', source);
    // audio.appendChild(source);
    // document.body.appendChild(audio);

    const handlePlay = () => {
      console.log('*** handlePLay ***');
      const cacheAndPlay = () => {
        dispatch(cacheAndPlayRecording(recordingId, playing));
        setIsCached(true);
      };

      isCached ? audio.play() : cacheAndPlay();
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
    // playing && !audio.ended ? audio.play() : resetAudio();
    playing && !audio.ended ? handlePlay() : resetAudio();

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
