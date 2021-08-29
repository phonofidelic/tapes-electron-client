import React, { useState, useEffect } from 'react';
import { connect, useDispatch } from 'react-redux';
import { matchSorter } from 'match-sorter';
import { Recording } from '../common/Recording.interface';
import * as actions from '../store/actions';
import {
  loadRecordings,
  deleteRecording,
  editRecording,
  getBucketToken,
} from '../effects';
import { RecorderState, SelectRecordingAction } from '../store/types';

import Loader from '../components/Loader';
import SearchBar from '../components/SearchBar';
import RecordingsListItem from '../components/RecordingsListItem';

import { useTheme } from '@material-ui/core';
import Typography from '@material-ui/core/Typography';
import List from '@material-ui/core/List';

interface LibraryProps {
  recordings: Recording[];
  bucketToken: string | null;
  loading: boolean;
  selectedRecording: Recording | null;
  selectRecording(recording: Recording): SelectRecordingAction;
}

export function Library({
  recordings,
  bucketToken,
  loading,
  selectedRecording,
  selectRecording,
}: LibraryProps) {
  const [filteredRecordings, setFilteredRecordings] =
    useState<Recording[]>(recordings);

  const dispatch = useDispatch();
  const theme = useTheme();

  const handleSelectRecording = (recording: Recording) => {
    selectRecording(recording);
  };

  const handleEditRecording = (recordingId: string, update: any) => {
    dispatch(editRecording(recordingId, update));
  };

  const handleDeleteRecording = (recordingId: string) => {
    dispatch(deleteRecording(recordingId));
  };

  const searchLibrary = (searchTerm: string) => {
    const filtered = matchSorter(recordings, searchTerm, {
      keys: ['title', 'format'],
      baseSort: (a, b) => (a.index < b.index ? -1 : 1),
    });
    setFilteredRecordings(filtered);
  };

  const sortLibrary = (sortBy: keyof Recording) => {
    const sorted = [...filteredRecordings].sort((a, b) =>
      a[sortBy] < b[sortBy] ? -1 : 1
    );

    setFilteredRecordings(sorted);
  };

  useEffect(() => {
    !bucketToken && dispatch(getBucketToken());
    !recordings.length && dispatch(loadRecordings());
    searchLibrary('');
  }, [recordings]);

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
          height:
            theme.dimensions.Tray.height - theme.dimensions.Navigation.height,
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
      <div>
        <div
          style={{
            position: 'sticky',
            top: theme.dimensions.Navigation.height,
            zIndex: theme.zIndex.appBar,
            padding: 4,
            paddingTop: 0,
          }}
        >
          <SearchBar searchLibrary={searchLibrary} sortLibrary={sortLibrary} />
        </div>
        <div>
          {filteredRecordings.length ? (
            <List>
              {filteredRecordings.map((recording: Recording) => (
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
          ) : (
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                width: '100%',
                height:
                  theme.dimensions.Tray.height -
                  theme.dimensions.Navigation.height,
                justifyContent: 'center',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  width: '100%',
                  justifyContent: 'center',
                }}
              >
                <Typography>No results found</Typography>
              </div>
            </div>
          )}
        </div>
      </div>
    );

  return <Loader />;
}

const mapStateToProps = (state: RecorderState) => {
  return {
    recordings: state.recordings,
    loading: state.loading,
    bucketToken: state.bucketToken,
    selectedRecording: state.selectedRecording,
  };
};

export default connect(mapStateToProps, actions)(Library);
