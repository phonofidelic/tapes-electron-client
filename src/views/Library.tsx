import React, { useState, useEffect } from 'react';
import { connect, useDispatch } from 'react-redux';
import { Recording } from '../common/Recording.interface';
import * as actions from '../store/actions';
import {
  loadRecordings,
  deleteRecording,
  editRecording,
  getBucketToken,
} from '../effects';
import { RecorderState } from '../store/types';

import Loader from '../components/Loader';
import RecordingsListItem from '../components/RecordingsListItem';

import Typography from '@material-ui/core/Typography';
import List from '@material-ui/core/List';

interface LibraryProps {
  recordings: Recording[];
  bucketToken: string | null;
  loading: boolean;
}

export function Library({ recordings, bucketToken, loading }: LibraryProps) {
  const [selectedRecording, setSelectedRecording] = useState(null);
  const dispatch = useDispatch();

  const handleSelectRecording = (recordingId: string) => {
    setSelectedRecording(recordingId);
  };

  const handleEditRecording = (recordingId: string, update: any) => {
    dispatch(editRecording(recordingId, update));
  };

  const handleDeleteRecording = (recordingId: string) => {
    dispatch(deleteRecording(recordingId));
  };

  useEffect(() => {
    !bucketToken && dispatch(getBucketToken());
    dispatch(loadRecordings());
  }, []);

  if (loading) {
    return <Loader />;
  }

  if (!bucketToken) {
    return <Loader />;
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

  if (recordings.length > 0)
    return (
      <List>
        {recordings.map((recording: Recording) => (
          <RecordingsListItem
            key={recording._id}
            bucketToken={bucketToken}
            recording={recording}
            selectedRecording={selectedRecording}
            handleSelectRecording={handleSelectRecording}
            handleDeleteRecording={handleDeleteRecording}
            handleEditRecording={handleEditRecording}
          />
        ))}
      </List>
    );
}

const mapStateToProps = (state: RecorderState) => {
  return {
    recordings: state.recordings,
    loading: state.loading,
    bucketToken: state.bucketToken,
  };
};

export default connect(mapStateToProps, actions)(Library);