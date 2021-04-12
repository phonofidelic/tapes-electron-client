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

interface RecorderProps {
  isMonitoring: boolean;
  isRecording: boolean;
  startMonitor(monitorInstance: MediaStream): StartMonitorAction;
  stopMonitor(): StopMonitorAction;
}

function Recorder({
  isMonitoring,
  isRecording,
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
    // const bucketKey = await getBucketKey();
    // console.log('handleStartRecording, bucketKey:', bucketKey);

    const mockSettings = {
      channels: 2,
      format: 'mp3' as RecordingFormats,
    };

    dispatch(startRecording(mockSettings));
  };

  const handleStopRecording = () => {
    dispatch(stopRecording());
  };

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
  };
};

export default connect(mapStateToProps, actions)(Recorder);
