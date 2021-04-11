import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { connect, useDispatch } from 'react-redux';
import * as actions from '../store/actions';
import { useTextile } from '../services/TextileProvider';
import { getBucketInfo } from '../effects';
import { RecorderState } from '../store/types';
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

// const SectionHeader = styled.div`
//   background-color: ${(theme: Theme) => theme.palette.primary.main};
//   color: ${(theme: Theme) =>
//     theme.palette.getContrastText(theme.palette.primary.main)};
//   padding-left: 8px;
// `;

const SectionHeader = styled('div')(({ theme }: { theme: Theme }) => ({
  backgroundColor: theme.palette.background.default,
  color: theme.palette.getContrastText(theme.palette.background.default),
  // paddingLeft: 8,
  paddingTop: 8,
  borderBottom: `1px solid ${theme.palette.primary.main}`,
  marginLeft: 8,
}));

interface SettingsProps {
  bucketInfo: any;
}

export function Settings({ bucketInfo }: SettingsProps) {
  const [recordingFormat, setRecordingFormat] = useState('mp3');
  const [channelCount, setChannelCount] = useState('2');
  const { identity } = useTextile();
  const dispatch = useDispatch();
  const theme: Theme = useTheme();

  const handleChange = (event: React.ChangeEvent<{ value: unknown }>) => {
    setRecordingFormat(event.target.value as string);
  };

  const handleChannelSelect = (
    event: React.ChangeEvent<{ value: unknown }>
  ) => {
    setChannelCount(event.target.value as string);
  };

  useEffect(() => {
    dispatch(getBucketInfo());
  }, []);

  return (
    <div>
      <SectionHeader theme={theme}>
        <Typography variant="caption">Account</Typography>
      </SectionHeader>
      {/* <div>identity: {identity.toString()}</div> */}
      <div style={{ padding: 8 }}>
        <Typography variant="caption" color="textSecondary">
          Use this token to sync your data on multiple devices. Store this
          seccurly and do not share it with anyone you do not want to have
          access to your data.
        </Typography>
      </div>
      <div
        style={{
          padding: 8,
          textAlign: 'center',
        }}
      >
        <Button variant="outlined" size="small">
          Download Token
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
            value={recordingFormat}
            onChange={handleChange}
            label="Recording Format"
          >
            <MenuItem value={'flac'}>flac</MenuItem>
            <MenuItem value={'mp3'}>mp3</MenuItem>
            <MenuItem value={'ogg'}>ogg</MenuItem>
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
            value={channelCount}
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
    bucketInfo: state.bucketInfo,
  };
};

export default connect(mapStateToProps, actions)(Settings);
