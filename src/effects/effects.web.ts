import { ThunkAction } from 'redux-thunk';
import { startRecordingRequest } from '../store/actions';
import { RecordingSettings } from '../common/RecordingSettings.interface';
import { Recording } from '../common/Recording.interface';
import { RecorderState, RecorderAction } from '../store/types';

type Effect = ThunkAction<void, RecorderState, unknown, RecorderAction>;

export const uploadAudioFiles = (audioFiles: File[]): Effect => async (dispatch) => {
  console.log('TODO: implement uploadAudioFiles for web')
}

export const startRecording = (recordingSettings: RecordingSettings): Effect => async (dispatch) => {
  console.log('TODO: implement startRecording for web')
}

export const stopRecording = (): Effect => async (dispatch) => {
  console.log('TODO: implement stopRecording for web')
}

export const loadRecordings = (): Effect => async (dispatch) => {
  console.log('TODO: implement loadRecordings for web')
}

export const editRecording = (recordingId: string, update: any): Effect => async (dispatch) => {
  console.log('TODO: implement editRecording for web')
}

export const deleteRecording = (recordingId: string): Effect => async (dispatch) => {
  console.log('TODO: implement deleteRecording for web')
}

export const loadAccountToken = (tokenString: string): Effect => async (dispatch) => {
  console.log('TODO: implement loadAccountToken for web')
}

export const initDatabase = (): Effect => async (dispatch) => {
  console.log('TODO: implement initDatabase for web')
}

export const setInputDevice = (deviceName: string): Effect => async (dispatch) => {
  console.log('TODO: implement setInputDevice for web')
}

export const downloadRecording = (recordingId: string): Effect => async (dispatch) => {
  console.log('TODO: implement downloadRecording for web')
}

export const cacheAndPlayRecording = (recording: Recording): Effect => async (dispatch) => {
  console.log('TODO: implement cacheAndPlayRecording for web')
}

export const getRecordingStorageStatus = (recordingCid: string): Effect => async (dispatch) => {
  console.log('TODO: implement getRecordingStorageStatus for web')
}

export const exportIdentity = (): Effect => async (dispatch) => {
  console.log('TODO: implement exportIdentity for web')
}