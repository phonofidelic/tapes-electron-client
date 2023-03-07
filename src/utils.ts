import { AcoustidRecording } from './common/AcoustidResult.interface';

export function msToTime(duration: number): string {
  let milliseconds: string | number = (duration % 1000) / 100,
    seconds: string | number = Math.floor((duration / 1000) % 60),
    minutes: string | number = Math.floor((duration / (1000 * 60)) % 60),
    hours: string | number = Math.floor((duration / (1000 * 60 * 60)) % 24);

  hours = hours < 10 ? '0' + hours : hours;
  minutes = minutes < 10 ? '0' + minutes : minutes;
  seconds = seconds < 10 ? '0' + seconds : seconds;

  return hours + ':' + minutes + ':' + seconds;
}

export const getAudioStream = async (selectedMediaDeviceId: string) => {
  let audioStream;
  try {
    audioStream = await navigator.mediaDevices.getUserMedia({
      audio: { deviceId: selectedMediaDeviceId },
      video: false,
    });
  } catch (err) {
    console.error('*** Could not get media stream:', err);
    throw new Error('Could not get media stream');
  }
  return audioStream;
};

/*
 * https://javascript.plainenglish.io/how-to-add-a-timeout-limit-to-asynchronous-javascript-functions-3676d89c186d
 */
export const asyncCallWithTimeout = async (
  asyncPromise: Promise<any>,
  timeLimit: number
) => {
  let timeoutHandle: ReturnType<typeof setTimeout>;

  const timeoutPromise = new Promise((_resolve, reject) => {
    timeoutHandle = setTimeout(
      () => reject(new Error('Async call timeout limit reached')),
      timeLimit
    );
  });

  return Promise.race([asyncPromise, timeoutPromise]).then((result) => {
    clearTimeout(timeoutHandle);
    return result;
  });
};

export const getArtistNameFromAcoustidRecording = (
  acoustidRecording: AcoustidRecording
) => {
  return acoustidRecording.artists
    ? acoustidRecording.artists[0].name
    : acoustidRecording.artist
    ? acoustidRecording.artist[0].name
    : 'No artist name found';
};
