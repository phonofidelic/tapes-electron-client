import React, { useState, useEffect } from 'react';
import { connect, useDispatch } from 'react-redux';
import { Recording } from '../common/Recording.interface';
import * as actions from '../store/actions';
import { loadRecordings, deleteRecording } from '../effects';
import { RecorderState } from '../store/types';
import { db } from '../db';
import { IpcService } from '../IpcService';

import { Button, Typography } from '@material-ui/core';
import RecordingsList from '../components/RecordingsList';

const ipc = new IpcService();

interface StorageProps {
  recordings?: Recording[];
  // loadRecordings: () => void;
}

export function Storage({ recordings }: StorageProps) {
  // const [recordings, setRecordings] = useState([]);
  const dispatch = useDispatch();

  const handleDeleteRecording = (recordingId: string) => {
    console.log('*** delete recording:', recordingId);
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
