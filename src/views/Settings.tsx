import React, { useEffect } from 'react';
import styled from 'styled-components';
import { connect, useDispatch } from 'react-redux';
import * as actions from '../store/actions';
import { useTextile } from '../services/TextileProvider';
import { getBucketInfo } from '../effects';
import { RecorderState, SetRecordingSettingsAction } from '../store/types';
import { RecordingSettings } from '../common/RecordingSettings.interface';
import { RecordingFormats } from '../common/RecordingFormats.enum';
import Typography from '@material-ui/core/Typography';
import { useTheme } from '@material-ui/core/styles';
import { Theme } from '@material-ui/core/styles/createMuiTheme';
import Button from '@material-ui/core/Button';
import FormControl from '@material-ui/core/FormControl';
import InputLabel from '@material-ui/core/InputLabel';
import Select from '@material-ui/core/Select';
import MenuItem from '@material-ui/core/MenuItem';
import RadioGroup from '@material-ui/core/RadioGroup';
import Radio from '@material-ui/core/Radio';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import FormLabel from '@material-ui/core/FormLabel';

const SectionHeader = styled('div')(({ theme }: { theme: Theme }) => ({
  // backgroundColor: theme.palette.background.default,
  // color: theme.palette.getContrastText(theme.palette.background.default),
  paddingTop: 8,
  marginLeft: 8,
}));

interface SettingsProps {
  recordingSettings: RecordingSettings;
  setRecordingSettings(
    recordingSettings: RecordingSettings
  ): SetRecordingSettingsAction;
}

export function Settings({
  recordingSettings,
  setRecordingSettings,
}: SettingsProps) {
  const { identity } = useTextile();
  const dispatch = useDispatch();
  const theme: Theme = useTheme();

  const handleRecordingFormatChange = (
    event: React.ChangeEvent<{ value: RecordingFormats }>
  ) => {
    setRecordingSettings({
      ...recordingSettings,
      format: event.target.value,
    });
  };

  const handleChannelSelect = (event: React.ChangeEvent<{ value: string }>) => {
    setRecordingSettings({
      ...recordingSettings,
      channels: parseInt(event.target.value),
    });
  };

  const downloadToken = () => {
    console.log('Downloading token');

    const a = document.createElement('a');
    a.href = 'data:text/plain;charset=utf-8, ' + encodeURIComponent(identity);
    a.download = 'tapes_account.token';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  useEffect(() => {
    dispatch(getBucketInfo());
  }, []);

  return (
    <div>
      <SectionHeader theme={theme} style={{ paddingTop: 0 }}>
        <Typography variant="caption">Account Token</Typography>
      </SectionHeader>
      <div style={{ padding: 8 }}>
        <Typography variant="caption" color="textSecondary">
          Use this token to sync your data on multiple devices. Store this
          securly and do not share it with anyone.
        </Typography>
      </div>
      <div
        style={{
          padding: 8,
          paddingTop: 0,
        }}
      >
        <Button variant="outlined" size="small" onClick={downloadToken}>
          Download Account Token
        </Button>
      </div>
      <SectionHeader theme={theme}>
        <Typography variant="caption">Recording</Typography>
      </SectionHeader>
      <div style={{ padding: 8 }}>
        <Typography variant="caption" color="textSecondary">
          Set your desired recording format.
        </Typography>
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
            <MenuItem value={'mp3'}>mp3</MenuItem>
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
    </div>
  );
}

const mapStateToProps = (state: RecorderState) => {
  return {
    recordingSettings: state.recordingSettings,
  };
};

export default connect(mapStateToProps, actions)(Settings);
