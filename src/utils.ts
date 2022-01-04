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
