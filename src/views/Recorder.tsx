import React from 'react';
import { connect } from 'react-redux';
import {
  RecorderState,
  SetRecordingSettingsAction,
  StartMonitorAction,
  StopMonitorAction,
  ConfirmErrorAction,
} from '../store/types';
import * as actions from '../store/actions';
import { RecordingSettings } from '../common/RecordingSettings.interface';
import useMonitor from '../hooks/useMonitor';

import Loader from '../components/Loader';
import RecorderControls from '../components/RecorderControls';
import Timer from '../components/Timer';
import ErrorModal from '../components/ErrorModal';
import AudioVisualiser from '../components/AudioVisualiser';
import useRecorder from '@/hooks/useRecorder';

interface RecorderProps {
  recordingSettings: RecordingSettings;
  loading: boolean;
  startMonitor(monitorInstance: MediaStream): StartMonitorAction;
  stopMonitor(): StopMonitorAction;
  setRecordingSettings(
    recordingSettings: RecordingSettings
  ): SetRecordingSettingsAction;
  confirmError(): ConfirmErrorAction;
}

function Recorder({ recordingSettings, loading, confirmError }: RecorderProps) {
  const selectedMediaDeviceId =
    recordingSettings.selectedMediaDeviceId || 'default';

  const { isMonitoring, setIsMonitoring } = useMonitor(selectedMediaDeviceId);
  const [isRecording, error, { startRecording, stopRecording }] = useRecorder();

  const handleStartMonitor = async () => {
    setIsMonitoring(true);
  };

  const handleStopMonitor = () => {
    setIsMonitoring(false);
  };

  const handleStartRecording = async () => {
    await startRecording(recordingSettings);
  };

  const handleStopRecording = () => {
    stopRecording();
  };

  if (loading) {
    return <Loader />;
  }

  return (
    <div>
      {isRecording && <Timer />}
      <div
        style={{
          position: 'fixed',
          width: '100%',
          left: 0,
          bottom: 32,
        }}
      >
        <AudioVisualiser
          selectedMediaDeviceId={selectedMediaDeviceId}
          feature="frequency"
        />
      </div>
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
    recordingSettings: state.recordingSettings,
    loading: state.loading,
  };
};

export default connect(mapStateToProps, actions)(Recorder);
