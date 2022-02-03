import React, { useState, useEffect } from 'react';
import { connect, useDispatch } from 'react-redux';
import { matchSorter } from 'match-sorter';
import { Recording } from '../common/Recording.interface';
import * as actions from '../store/actions';
import {
  loadRecordings,
  deleteRecording,
  editRecording,
  uploadAudioFiles,
  downloadRecording,
  cacheAndPlayRecording,
} from '../effects';
import {
  RecorderState,
  SelectRecordingAction,
  ConfirmErrorAction,
  PlayRecordingAction,
  PauseRecordingAction,
} from '../store/types';

import Loader from '../components/Loader';
import SearchBar from '../components/SearchBar';
import RecordingsListItem from '../components/RecordingsListItem';
import FileDrop from '../components/FileDrop';
import ErrorModal from '../components/ErrorModal';

import { useTheme } from '@mui/material';
import Typography from '@mui/material/Typography';
import List from '@mui/material/List';

interface LibraryProps {
  recordings: Recording[];
  loading: boolean;
  caching: boolean;
  playing: boolean;
  error: Error;
  selectedRecording: Recording | null;
  currentPlaying: Recording | null;
  selectRecording(recording: Recording): SelectRecordingAction;
  confirmError(): ConfirmErrorAction;
}

export function Library({
  recordings,
  loading,
  caching,
  playing,
  error,
  selectedRecording,
  currentPlaying,
  selectRecording,
  confirmError,
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

  const handleDownloadRecording = (recordingId: string) => {
    dispatch(downloadRecording(recordingId));
  };

  const handleCacheAndPlayRecording = (recording: Recording) => {
    dispatch(cacheAndPlayRecording(recording));
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
        <ErrorModal error={error} onConfirmError={() => confirmError()} />
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
                  caching={caching}
                  playing={playing}
                  selectedRecording={selectedRecording}
                  currentPlayingId={currentPlaying?._id}
                  handleSelectRecording={handleSelectRecording}
                  handleDeleteRecording={handleDeleteRecording}
                  handleEditRecording={handleEditRecording}
                  handleDownloadRecording={handleDownloadRecording}
                  handleCacheAndPlayRecording={handleCacheAndPlayRecording}
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
    caching: state.caching,
    playing: state.playing,
    error: state.error,
    selectedRecording: state.selectedRecording,
    currentPlaying: state.currentPlaying,
  };
};

export default connect(mapStateToProps, actions)(Library);
