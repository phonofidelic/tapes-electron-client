import React, { useState, useEffect } from 'react';
import { connect, useDispatch } from 'react-redux';
import { Recording } from '../common/Recording.interface';
import * as actions from '../store/actions';
import { loadRecordings, deleteRecording } from '../effects';
import { RecorderState } from '../store/types';
import { useTextile } from '../services/TextileProvider';

import RecordingsListItem from '../components/RecordingsListItem';

import Typography from '@material-ui/core/Typography';
import List from '@material-ui/core/List';

interface StorageProps {
  recordings: Recording[];
}

export function Storage({ recordings }: StorageProps) {
  const [selectedRecording, setSelectedRecording] = useState(null);
  const [bucketToken, setBucketToken] = useState('');
  const dispatch = useDispatch();
  const { getBucketToken } = useTextile();

  const handleSelectRecording = (recordingId: string) => {
    setSelectedRecording(recordingId);
  };

  const handleDeleteRecording = (recordingId: string) => {
    dispatch(deleteRecording(recordingId));
  };

  useEffect(() => {
    const setToken = async () => {
      const token = await getBucketToken();
      setBucketToken(token);
    };
    setToken();

    dispatch(loadRecordings());
  }, []);

  if (!bucketToken) {
    return <div>Loading...</div>;
  }

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
      <List>
        {recordings.map((recording: Recording) => (
          <RecordingsListItem
            key={recording.id}
            bucketToken={bucketToken}
            recording={recording}
            selectedRecording={selectedRecording}
            handleSelectRecording={handleSelectRecording}
            handleDeleteRecording={handleDeleteRecording}
          />
        ))}
      </List>
    );
}

const mapStateToProps = (state: RecorderState) => {
  return {
    recordings: state.recordings,
  };
};

export default connect(mapStateToProps, actions)(Storage);
