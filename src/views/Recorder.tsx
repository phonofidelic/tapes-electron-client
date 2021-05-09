import React from 'react';
import { connect, useDispatch } from 'react-redux';
// import { useTextile } from '../services/TextileProvider';
import { startRecording, stopRecording } from '../effects';
import {
  RecorderState,
  StartMonitorAction,
  StopMonitorAction,
} from '../store/types';
import * as actions from '../store/actions';
import { RecordingFormats } from '../common/RecordingFormats.enum';
import AudioAnalyser from '../components/AudioAnalyser';
import RecorderControls from '../components/RecorderControls';
import Timer from '../components/Timer';
import { RecordingSettings } from '../common/RecordingSettings.interface';

interface RecorderProps {
  isMonitoring: boolean;
  isRecording: boolean;
  recordingSettings: RecordingSettings;
  loading: boolean;
  startMonitor(monitorInstance: MediaStream): StartMonitorAction;
  stopMonitor(): StopMonitorAction;
}

function Recorder({
  isMonitoring,
  isRecording,
  recordingSettings,
  loading,
  startMonitor,
  stopMonitor,
}: RecorderProps) {
  const dispatch = useDispatch();
  // const { getBucketKey } = useTextile();

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

  // if (loading) {
  //   return <div>Loading...</div>;
  // }

  return (
    <div>
      {isRecording && <Timer />}
      <AudioAnalyser isMonitoring={isMonitoring} />
      <RecorderControls
        isMonitoring={isMonitoring}
        isRecording={isRecording}
        handleStartRecording={handleStartRecording}
        handleStopRecording={handleStopRecording}
        handleStartMonitor={handleStartMonitor}
        handleStopMonitor={handleStopMonitor}
      />
    </div>
  );
}

const mapStateToProps = (state: RecorderState) => {
  return {
    isMonitoring: state.isMonitoring,
    isRecording: state.isRecording,
    recordingSettings: state.recordingSettings,
    loading: state.loading,
  };
};

export default connect(mapStateToProps, actions)(Recorder);
