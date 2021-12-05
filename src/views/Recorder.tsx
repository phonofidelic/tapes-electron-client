import React from 'react';
import { connect, useDispatch } from 'react-redux';
import { startRecording, stopRecording } from '../effects';
import {
  RecorderState,
  SetRecordingSettingsAction,
  StartMonitorAction,
  StopMonitorAction,
  ConfirmErrorAction,
} from '../store/types';
import * as actions from '../store/actions';
import { RecordingSettings } from '../common/RecordingSettings.interface';

import Loader from '../components/Loader';
import AudioAnalyser from '../components/AudioAnalyser';
import RecorderControls from '../components/RecorderControls';
import Timer from '../components/Timer';
import ErrorModal from '../components/ErrorModal';

interface RecorderProps {
  isMonitoring: boolean;
  isRecording: boolean;
  recordingSettings: RecordingSettings;
  loading: boolean;
  error: Error;
  startMonitor(monitorInstance: MediaStream): StartMonitorAction;
  stopMonitor(): StopMonitorAction;
  setRecordingSettings(
    recordingSettings: RecordingSettings
  ): SetRecordingSettingsAction;
  confirmError(): ConfirmErrorAction;
}

function Recorder({
  isMonitoring,
  isRecording,
  recordingSettings,
  loading,
  error,
  startMonitor,
  stopMonitor,
  confirmError,
}: RecorderProps) {
  const selectedMediaDeviceId =
    recordingSettings.selectedMediaDeviceId || 'default';

  const dispatch = useDispatch();

  const handleStartMonitor = async () => {
    const monitorInstance = await navigator.mediaDevices.getUserMedia({
      audio: true,
      video: false,
    });
    startMonitor(monitorInstance);
  };

  const handleStopMonitor = () => {
    stopMonitor();
  };

  const handleStartRecording = async () => {
    dispatch(startRecording(recordingSettings));
  };

  const handleStopRecording = () => {
    dispatch(stopRecording());
  };

  if (loading) {
    return <Loader />;
  }

  return (
    <div>
      {isRecording && <Timer />}
      <AudioAnalyser
        isMonitoring={isMonitoring}
        selectedMediaDeviceId={selectedMediaDeviceId}
      />
      <RecorderControls
        isMonitoring={isMonitoring}
        isRecording={isRecording}
        handleStartRecording={handleStartRecording}
        handleStopRecording={handleStopRecording}
        handleStartMonitor={handleStartMonitor}
        handleStopMonitor={handleStopMonitor}
      />
      <ErrorModal error={error} onConfirmError={() => confirmError()} />
    </div>
  );
}

const mapStateToProps = (state: RecorderState) => {
  return {
    isMonitoring: state.isMonitoring,
    isRecording: state.isRecording,
    recordingSettings: state.recordingSettings,
    loading: state.loading,
    error: state.error,
  };
};

export default connect(mapStateToProps, actions)(Recorder);
