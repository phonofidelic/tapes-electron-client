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
  uploadAudioFiles,
  downloadRecording,
} from '../effects';
import {
  RecorderState,
  SelectRecordingAction,
  ConfirmErrorAction,
  PlayRecordingAction,
  PauseRecordingAction,
} from '../store/types';
import useAudioPreview from '../hooks/useAudioPreview';

import Loader from '../components/Loader';
import SearchBar from '../components/SearchBar';
import RecordingsListItem from '../components/RecordingsListItem';
import FileDrop from '../components/FileDrop';
import ErrorModal from '../components/ErrorModal';

import { useTheme } from '@material-ui/core';
import Typography from '@material-ui/core/Typography';
import List from '@material-ui/core/List';

interface LibraryProps {
  recordings: Recording[];
  bucketToken: string | null;
  loading: boolean;
  error: Error;
  selectedRecording: Recording | null;
  caching: boolean;
  playing: boolean;
  currentPlaying: Recording;
  selectRecording(recording: Recording): SelectRecordingAction;
  playRecording(recording: Recording): PlayRecordingAction;
  pauseRecording(): PauseRecordingAction;
  confirmError(): ConfirmErrorAction;
}

export function Library({
  recordings,
  bucketToken,
  loading,
  error,
  selectedRecording,
  caching,
  playing,
  currentPlaying,
  selectRecording,
  playRecording,
  pauseRecording,
  confirmError,
}: LibraryProps) {
  const [filteredRecordings, setFilteredRecordings] =
    useState<Recording[]>(recordings);

  const dispatch = useDispatch();
  const theme = useTheme();

  const { setPlaying } = useAudioPreview(
    currentPlaying?._id,
    currentPlaying?.location
  );

  const handleSelectRecording = (recording: Recording) => {
    selectRecording(recording);
  };

  const handleEditRecording = (recordingId: string, update: any) => {
    dispatch(editRecording(recordingId, update));
  };

  const handleDeleteRecording = (recordingId: string) => {
    dispatch(deleteRecording(recordingId));
  };

  const handleDownloadRecording = (recordingId: string) => {
    dispatch(downloadRecording(recordingId));
  };

  const handlePlayRecording = (recording: Recording) => {
    playRecording(recording);
  };

  const handlePauseRecording = () => {
    pauseRecording();
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

  const handleFileDrop = (audioFiles: File[]) => {
    dispatch(uploadAudioFiles(audioFiles));
  };

  useEffect(() => {
    !recordings.length && dispatch(loadRecordings());
    searchLibrary('');
  }, [recordings]);

  if (loading) {
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
      <FileDrop accept="audio/*" handleFileDrop={handleFileDrop}>
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
        <div
          style={{
            paddingBottom: theme.dimensions.Player.height,
          }}
        >
          {filteredRecordings.length ? (
            <List>
              {filteredRecordings.map((recording: Recording) => (
                <RecordingsListItem
                  key={recording._id}
                  recording={recording}
                  selectedRecording={selectedRecording}
                  caching={caching}
                  handleSelectRecording={handleSelectRecording}
                  handleDeleteRecording={handleDeleteRecording}
                  handleEditRecording={handleEditRecording}
                  handleDownloadRecording={handleDownloadRecording}
                  handlePlayRecording={handlePlayRecording}
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
        <ErrorModal error={error} onConfirmError={() => confirmError()} />
      </FileDrop>
    );

  return <Loader />;
}

const mapStateToProps = (state: RecorderState) => {
  return {
    recordings: state.recordings,
    loading: state.loading,
    error: state.error,
    bucketToken: state.bucketToken,
    selectedRecording: state.selectedRecording,
    caching: state.caching,
    playing: state.playing,
    currentPlaying: state.currentPlaying,
  };
};

export default connect(mapStateToProps, actions)(Library);
