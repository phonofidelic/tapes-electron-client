import React, { useState, useEffect, SyntheticEvent } from 'react';
import { connect, useDispatch } from 'react-redux';
import { Recording } from '../common/Recording.interface';
import * as actions from '../store/actions';
import { loadRecordings, deleteRecording } from '../effects';
import { RecorderState } from '../store/types';

import RecordingsList from '../components/RecordingsList';

import { Button, Typography } from '@material-ui/core';

interface StorageProps {
  recordings?: Recording[];
}

export function Storage({ recordings }: StorageProps) {
  const [selectedRecording, setSelectedRecording] = useState(null);
  const dispatch = useDispatch();

  const handleSelectRecording = (recordingId: string) => {
    setSelectedRecording(recordingId);
  };

  const handleDeleteRecording = (recordingId: string) => {
    dispatch(deleteRecording(recordingId));
  };

  useEffect(() => {
    dispatch(loadRecordings());
  }, []);

  if (!recordings.length)
    return (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          width: '100%',
          height: 400 - 56,
          justifyContent: 'center',
        }}
      >
        <div
          style={{ display: 'flex', width: '100%', justifyContent: 'center' }}
        >
          <Typography>Your recordings will live here</Typography>
        </div>
      </div>
    );

  if (recordings.length)
    return (
      <RecordingsList
        recordings={recordings}
        selectedRecording={selectedRecording}
        handleSelectRecording={handleSelectRecording}
        handleDeleteRecording={handleDeleteRecording}
      />
    );

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        width: '100%',
        height: 400 - 56,
        justifyContent: 'center',
      }}
    >
      <div style={{ display: 'flex', width: '100%', justifyContent: 'center' }}>
        <Button>Add a storage location</Button>
      </div>
    </div>
  );
}

const mapStateToProps = (state: RecorderState) => {
  return {
    recordings: state.recordings,
  };
};

export default connect(mapStateToProps, actions)(Storage);
