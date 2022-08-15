import React, { useCallback, useState, useEffect } from 'react';
import { hot } from 'react-hot-loader';
import styled from 'styled-components';
import { connect, useDispatch } from 'react-redux';

import {
  RecorderState,
  SetRecordingSettingsAction,
  ToggleDebugAction,
} from '../store/types';
import * as actions from '../store/actions';
import effects from '../effects';
import { RecordingSettings } from '../common/RecordingSettings.interface';
import { RecordingFormats } from '../common/RecordingFormats.enum';

import QRCodeModal from '../components/QRCodeModal';
import StatusMessage from '../components/StatusMessage';

import Typography from '@mui/material/Typography';
import { useTheme, Theme } from '@mui/material/styles';
import Button from '@mui/material/Button';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import RadioGroup from '@mui/material/RadioGroup';
import Radio from '@mui/material/Radio';
import FormControlLabel from '@mui/material/FormControlLabel';
import FormLabel from '@mui/material/FormLabel';
import QrCodeIcon from '@mui/icons-material/QrCode2';
import { Checkbox, FormGroup, SelectChangeEvent } from '@mui/material';

//@ts-ignore
import { PeerInfo } from 'ipfs';
import { AccountInfo } from '../common/AccountInfo.interface';
import EditableText from '../components/EditableText';
import { Companion } from '../common/Companion.interface';
import CompanionsList from '../components/CompanionsList';

const {
  loadAccountToken,
  setInputDevice,
  loadAccountInfo,
  setAccountInfo,
  getCompanions,
} = effects;

declare const WEB_CLIENT_URL: string;

const SectionHeader = styled('div')(({ theme }: { theme: Theme }) => ({
  // backgroundColor: theme.palette.background.default,
  // color: theme.palette.getContrastText(theme.palette.background.default),
  paddingTop: 8,
  paddingBottom: 0,
  marginLeft: 8,
}));

interface SettingsProps {
  loading: boolean;
  loadingMessage: string | null;
  recordingSettings: RecordingSettings;
  debugEnabled: boolean;
  databaseInitializing: boolean;
  accountInfo: AccountInfo;
  companions: Companion[];
  setRecordingSettings(
    recordingSettings: RecordingSettings
  ): SetRecordingSettingsAction;
  toggleDebug(currentDebugState: boolean): ToggleDebugAction;
}

export function Settings({
  loading,
  loadingMessage,
  recordingSettings,
  debugEnabled,
  databaseInitializing,
  accountInfo,
  companions,
  setRecordingSettings,
  toggleDebug,
}: SettingsProps) {
  const [audioInputDevices, setAudioInputDevices] = useState([]);
  const [QROpen, setQROpen] = useState(false);
  const [peerInfo, setPeerInfo] = useState<PeerInfo | null>(null);
  const [showDebug, setShowDebug] = useState(0);
  const [localWebClient, setLocalWebClient] = useState(false);

  const selectedMediaDeviceId =
    recordingSettings.selectedMediaDeviceId || 'default';

  const dispatch = useDispatch();
  const theme: Theme = useTheme();

  const onDrop = useCallback(async (acceptedFiles) => {
    const tokenFile = acceptedFiles[0];

    const fileReader = new FileReader();
    fileReader.readAsText(tokenFile);

    fileReader.onloadend = async () => {
      const tokenString = fileReader.result as string;
      dispatch(loadAccountToken(tokenString.trim()));
    };
  }, []);

  const handleRecordingFormatChange = (event: SelectChangeEvent) => {
    setRecordingSettings({
      ...recordingSettings,
      format: event.target.value as RecordingFormats,
    });
  };

  const handleChannelSelect = (event: React.ChangeEvent<{ value: string }>) => {
    setRecordingSettings({
      ...recordingSettings,
      channels: parseInt(event.target.value),
    });
  };

  const handleSelectAudioInput = (event: SelectChangeEvent) => {
    const deviceId = event.target.value;
    const deviceInfo = audioInputDevices.find(
      (device) => device.deviceId === deviceId
    );
    console.log('handleSelectAudioInput, deviceInfo:', deviceInfo);

    // setSelectedMediaDeviceId(event.target.value);
    setRecordingSettings({
      ...recordingSettings,
      selectedMediaDeviceId: deviceId,
    });

    /** TODO: Needs to use device name */
    dispatch(setInputDevice(deviceInfo.label));
  };

  /** TODO: Rename this */
  const handleOpenQR = () => {
    setPeerInfo(window.db.peerInfo);
    setQROpen(true);
  };

  const handleCloseQR = () => {
    setQROpen(false);
  };

  const handleDebugClick = () => {
    setShowDebug(showDebug + 1);
  };

  const handleToggleDebug = () => {
    toggleDebug(debugEnabled);
  };

  const handleToggleLocalWebClient = () => {
    setLocalWebClient(!localWebClient);
  };

  const handleUpdateDeviceName = (newDeviceName: string) => {
    dispatch(setAccountInfo('deviceName', newDeviceName));
  };

  useEffect(() => {
    const getMediaDevices = async () => {
      const foundDevices = await navigator.mediaDevices.enumerateDevices();
      console.log('foundDevices:', foundDevices);

      const audioInputs = foundDevices.filter(
        (device) => device.kind === 'audioinput'
      );
      console.log('audioInputs:', audioInputs);

      setAudioInputDevices(audioInputs);
    };

    getMediaDevices();
  }, []);

  useEffect(() => {
    !loading &&
      !databaseInitializing &&
      (dispatch(loadAccountInfo()), dispatch(getCompanions()));
  }, [databaseInitializing]);

  useEffect(() => {
    /**
     * Check for companion status updates every 10 sec
     */
    const getCompanionsInterval = setInterval(
      () => dispatch(getCompanions()),
      10000
    );
    return () => clearInterval(getCompanionsInterval);
  }, []);

  // if (loading) {
  //   return <Loader />;
  // }

  return (
    <div>
      <StatusMessage />
      <QRCodeModal
        open={QROpen}
        value={`${
          localWebClient ? 'http://localhost:3001' : WEB_CLIENT_URL
        }/?peerid=${peerInfo?.id || ''}&address=${
          window.db?.initialized
            ? window.db?.getAccountInfo().docStores.recordings.root
            : ''
        }`}
        onClose={handleCloseQR}
      />

      <SectionHeader theme={theme}>
        <Typography>Recording Settings</Typography>
      </SectionHeader>
      <div style={{ padding: 8, paddingTop: 0 }}>
        <Typography variant="caption" color="textSecondary">
          Set your desired recording format.
        </Typography>
      </div>
      <div style={{ padding: 8 }}>
        <FormControl variant="outlined" fullWidth style={{ textAlign: 'left' }}>
          <InputLabel id="audio-input-select-label">Input Device</InputLabel>
          <Select
            id="audio-input-select"
            labelId="audio-input-select-label"
            value={selectedMediaDeviceId}
            onChange={handleSelectAudioInput}
            label="Audio Input Device"
          >
            {audioInputDevices.map((device: MediaDeviceInfo) => (
              <MenuItem key={device.deviceId} value={device.deviceId}>
                {device.label.replace(/ *\([^)]*\) */g, '')}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </div>
      <div style={{ padding: 8, textAlign: 'center' }}>
        <FormControl variant="outlined" fullWidth style={{ textAlign: 'left' }}>
          <InputLabel id="recording-format-select-label">
            Recording Format
          </InputLabel>
          <Select
            labelId="recording-format-select-label"
            id="recording-format-select"
            value={recordingSettings.format}
            onChange={handleRecordingFormatChange}
            label="Recording Format"
          >
            <MenuItem value={'flac'}>flac</MenuItem>
            <MenuItem value={'wav'}>wav</MenuItem>
          </Select>
        </FormControl>
      </div>
      <div style={{ padding: 8, paddingLeft: 20 }}>
        <FormControl variant="outlined" fullWidth style={{ textAlign: 'left' }}>
          <FormLabel id="recording-channel-radio-label">
            <Typography variant="caption">Recording Channels</Typography>
          </FormLabel>
          <RadioGroup
            style={{
              display: 'inline',
            }}
            value={recordingSettings.channels.toString()}
            id="input-format-channels"
            name="channels"
            onChange={handleChannelSelect}
          >
            <FormControlLabel
              value="1"
              control={<Radio color="primary" />}
              label="Mono"
            />
            <FormControlLabel
              value="2"
              control={<Radio color="primary" />}
              label="Stereo"
            />
          </RadioGroup>
        </FormControl>
      </div>

      <SectionHeader theme={theme}>
        <Typography>Account Info</Typography>
      </SectionHeader>
      {loading || !accountInfo ? (
        <div style={{ padding: 8 }}>
          <Typography variant="caption" color="textSecondary">
            <i>Loading...</i>
          </Typography>
        </div>
      ) : (
        <>
          <div
            style={{
              padding: 8,
              paddingBottom: 0,
              paddingTop: 0,
              display: 'flex',
            }}
          >
            <Typography color="textSecondary">Device name:&nbsp;</Typography>
            <EditableText
              textValue={accountInfo.deviceName}
              size="small"
              onChangeCommitted={handleUpdateDeviceName}
            >
              <Typography>{accountInfo.deviceName}</Typography>
            </EditableText>
          </div>
          <div
            style={{
              paddingLeft: 8,
            }}
          >
            <CompanionsList companions={companions} />
          </div>
        </>
      )}

      <SectionHeader theme={theme}>
        <Typography>Account Link</Typography>
      </SectionHeader>
      <div style={{ padding: 8, paddingBottom: 0, paddingTop: 0 }}>
        <Typography variant="caption" color="textSecondary">
          Use this link to access your data on multiple devices.
        </Typography>
      </div>
      <div
        style={{
          display: 'flex',
        }}
      >
        <Button
          style={{
            margin: 8,
            flex: 1,
          }}
          variant="outlined"
          endIcon={<QrCodeIcon />}
          onClick={handleOpenQR}
        >
          <Typography noWrap variant="caption" color="textSecondary">
            Share account
          </Typography>
        </Button>
      </div>

      {showDebug >= 3 ? (
        <div style={{ padding: 8 }}>
          <FormGroup>
            <FormControlLabel
              control={
                <Checkbox checked={debugEnabled} onChange={handleToggleDebug} />
              }
              label="Debug enabled"
            />
          </FormGroup>
          <FormGroup>
            <FormControlLabel
              control={
                <Checkbox
                  checked={localWebClient}
                  onChange={handleToggleLocalWebClient}
                />
              }
              label="Local web client"
            />
          </FormGroup>
        </div>
      ) : (
        <div style={{ height: 50, width: '100%' }} onClick={handleDebugClick} />
      )}
    </div>
  );
}

const mapStateToProps = (state: RecorderState) => {
  return {
    recordingSettings: state.recordingSettings,
    loading: state.loading,
    loadingMessage: state.loadingMessage,
    debugEnabled: state.debugEnabled,
    databaseInitializing: state.databaseInitilizing,
    accountInfo: state.accountInfo,
    companions: state.companions,
  };
};

export default hot(module)(connect(mapStateToProps, actions)(Settings));
