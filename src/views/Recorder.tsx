import React, { useEffect } from 'react';
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

// import { providers } from 'ethers';
// import { init } from '@textile/eth-storage';

import {
  connect as connectNear,
  WalletConnection,
  keyStores,
  KeyPair,
} from 'near-api-js';
// import { init, requestSignIn } from '@textile/near-storage';

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

  useEffect(() => {
    const initWallet = async () => {
      // await (window.ethereum as any).enable();
      // const provider = new providers.Web3Provider(window.ethereum);
      // const wallet = provider.getSigner();
      // const network = await provider.getNetwork();
      // console.log('*** network:', network);
      // const storage = await init(wallet);
      // const blob = new Blob(['Hello, world!'], { type: 'text/plain' });
      // const file = new File([blob], 'welcome.txt', {
      //   type: 'text/plain',
      //   lastModified: new Date().getTime(),
      // });
      // await storage.addDeposit();
      // const { id, cid } = await storage.store(file);
      // const { request, deals } = await storage.status(id);
      // console.log(request);
      // console.log([...deals]);
      /**
       * Near
       */
      // const keyStore = new keyStores.BrowserLocalStorageKeyStore();
      // const keyStore = new keyStores.InMemoryKeyStore();
      // const PRIVATE_KEY =
      //   'by8kdJoJHu7uUkKfoaLd2J2Dp1q1TigeWMG123pHdu9UREqPcshCM223kWadm';
      // // creates a public / private key pair using the provided private key
      // const keyPair = KeyPair.fromString(PRIVATE_KEY);
      // // adds the keyPair you created to keyStore
      // await keyStore.setKey('testnet', 'example-account.testnet', keyPair);
      // const config = {
      //   networkId: 'testnet',
      //   keyStore, // optional if not signing transactions
      //   nodeUrl: 'https://rpc.testnet.near.org',
      //   walletUrl: 'https://wallet.testnet.near.org',
      //   helperUrl: 'https://helper.testnet.near.org',
      //   explorerUrl: 'https://explorer.testnet.near.org',
      //   headers: {
      //     // 'Content-Security-Policy': '*',
      //   },
      // };
      // const near = await connectNear(config);
      // const wallet = new WalletConnection(near, null);
    };

    initWallet();
  }, []);

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
