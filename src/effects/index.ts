import * as electronEffects from './effects.electron'
import * as webEffects from './effects.web'
import isElectron from 'is-electron';
import { ThunkAction } from 'redux-thunk';
import { Recording } from '../common/Recording.interface';
import { RecorderState, RecorderAction } from '../store/types';
import { RecordingSettings } from '../common/RecordingSettings.interface';
// const electronEffects = import(/* webpackChunkName: "electronEffects" */'./effects.electron')
// const webEffects = import(/* webpackChunkName: "webEffects" */'./effects.web')

type Effect = ThunkAction<void, RecorderState, unknown, RecorderAction>;

interface EffectsExport {
  uploadAudioFiles(audioFiles: File[]): Effect;
  startRecording(recordingSettings: RecordingSettings): Effect;
  stopRecording(): Effect;
  loadRecordings(): Effect;
  editRecording(recordingId: string, update: any): Effect;
  deleteRecording(recordingId: string): Effect;
  loadAccountToken(tokenString: string): Effect;
  initDatabase(): Effect;
  setInputDevice(deviceName: string): Effect;
  downloadRecording(recordingId: string): Effect;
  cacheAndPlayRecording(recording: Recording): Effect;
  getRecordingStorageStatus(recordingCid: string): Effect;
  exportIdentity(): Effect;
}

let effectsExports: EffectsExport
(async () => {
  if (!isElectron()) {
    effectsExports = webEffects
  } else {
    effectsExports = electronEffects
  }
})()

export default effectsExports 