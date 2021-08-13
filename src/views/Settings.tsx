import React, { useCallback } from 'react';
import styled from 'styled-components';
import { connect, useDispatch } from 'react-redux';
import { useDropzone } from 'react-dropzone';

import { RecorderState, SetRecordingSettingsAction } from '../store/types';
import * as actions from '../store/actions';
import { loadAccountToken } from '../effects';
import { RecordingSettings } from '../common/RecordingSettings.interface';
import { RecordingFormats } from '../common/RecordingFormats.enum';

import Loader from '../components/Loader';

import Typography from '@material-ui/core/Typography';
import Tooltip from '@material-ui/core/Tooltip';
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
import GetAppIcon from '@material-ui/icons/GetApp';
import HelpIcon from '@material-ui/icons/Help';

const SectionHeader = styled('div')(({ theme }: { theme: Theme }) => ({
  // backgroundColor: theme.palette.background.default,
  // color: theme.palette.getContrastText(theme.palette.background.default),
  paddingTop: 8,
  paddingBottom: 0,
  marginLeft: 8,
}));

interface SettingsProps {
  loading: boolean;
  recordingSettings: RecordingSettings;
  setRecordingSettings(
    recordingSettings: RecordingSettings
  ): SetRecordingSettingsAction;
}

export function Settings({
  loading,
  recordingSettings,
  setRecordingSettings,
}: SettingsProps) {
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

  const { getRootProps, getInputProps, isDragActive, open } = useDropzone({
    onDrop,
  });

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

    const identity = localStorage.getItem('identity');

    const a = document.createElement('a');
    a.href = 'data:text/plain;charset=utf-8,' + encodeURIComponent(identity);
    a.download = 'tapes_account.token';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  if (loading) {
    return <Loader />;
  }

  return (
    <div>
      <div
        {...getRootProps({
          onClick: (e) => e.stopPropagation(),
        })}
      >
        <input {...getInputProps()} type="file" name="identity" />
        <SectionHeader theme={theme} style={{ paddingTop: 0 }}>
          <Typography variant="caption">Account Token</Typography>
        </SectionHeader>
        {isDragActive ? (
          <div
            style={{
              // width: '100%',
              height: 72,
              border: `4px dashed #ccc`,
              borderRadius: 4,
              textAlign: 'center',
              padding: 8,
              margin: 8,
            }}
          >
            <Typography variant="caption" color="textSecondary">
              Drop your <b>.token</b> file here ...
            </Typography>
          </div>
        ) : (
          <>
            <div style={{ padding: 8, paddingBottom: 0, paddingTop: 0 }}>
              <Typography variant="caption" color="textSecondary">
                Use this token to sync your data on multiple devices. Store this
                securly and do not share it with anyone.
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
                size="small"
                endIcon={<GetAppIcon />}
                onClick={downloadToken}
              >
                <Typography noWrap variant="caption" color="textSecondary">
                  Save token file
                </Typography>
              </Button>

              <div
                style={{
                  border: `4px dashed #ccc`,
                  borderRadius: 4,
                  margin: 8,
                  padding: 8,
                  marginLeft: 0,
                  flex: 1,
                  cursor: 'pointer',
                  display: 'flex',
                  justifyContent: 'space-between',
                }}
                onClick={open}
              >
                <Typography
                  variant="caption"
                  color="textSecondary"
                  style={{
                    lineHeight: '20px',
                  }}
                >
                  Drop a <b>.token</b> file{' '}
                </Typography>
                <Tooltip
                  arrow
                  title="Click or drag a .token file here to load an existing account"
                >
                  <HelpIcon fontSize="small" color="disabled" />
                </Tooltip>
              </div>
            </div>
          </>
        )}
      </div>
      <SectionHeader theme={theme}>
        <Typography variant="caption">Recording</Typography>
      </SectionHeader>
      <div style={{ padding: 8, paddingTop: 0 }}>
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
    loading: state.loading,
  };
};

export default connect(mapStateToProps, actions)(Settings);
