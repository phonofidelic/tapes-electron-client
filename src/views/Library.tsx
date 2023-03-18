import React, { useState } from 'react';
import { connect, useDispatch } from 'react-redux';
import { matchSorter } from 'match-sorter';
import { Recording } from '../common/Recording.interface';
import * as actions from '../store/actions';
import effects from '../effects';
import {
  RecorderState,
  SelectRecordingAction,
  ConfirmErrorAction,
  PlayRecordingAction,
} from '../store/types';

import { Loader } from '@/components/Loader';
import SearchBar from '../components/SearchBar';
import RecordingsListItem from '../components/RecordingsListItem';
import FileDrop from '../components/FileDrop';
import ErrorModal from '../components/ErrorModal';

import { useTheme } from '@mui/material';
import Typography from '@mui/material/Typography';
import List from '@mui/material/List';
import { AccountInfo } from '@/common/AccountInfo.interface';
import { useRecordings } from '@/contexts/RecordingsContext';

const { downloadRecording, cacheAndPlayRecording } = effects;

interface LibraryProps {
  accountInfo: AccountInfo;
  recordings: Recording[];
  loading: boolean;
  databaseInitializing: boolean;
  caching: boolean;
  playing: boolean;
  error: Error;
  selectedRecording: Recording | null;
  currentPlaying: Recording | null;
  selectRecording(recording: Recording): SelectRecordingAction;
  playRecording(): PlayRecordingAction;
  confirmError(): ConfirmErrorAction;
}

export function Library({
  caching,
  playing,
  selectedRecording,
  currentPlaying,
  selectRecording,
  playRecording,
}: LibraryProps) {
  const [
    recordings,
    loading,
    error,
    { uploadAudioFiles, editRecording, deleteRecording, confirmError },
  ] = useRecordings();
  const [filteredRecordings, setFilteredRecordings] = useState<Recording[]>();
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<keyof Recording | null>(null);

  const dispatch = useDispatch();
  const theme = useTheme();

  const handleSelectRecording = (recording: Recording) => {
    selectRecording(recording);
  };

  const handleEditRecording = (
    recordingId: string,
    update: Partial<Recording>
  ) => {
    editRecording(recordingId, update);
  };

  const handleDeleteRecording = async (recordingId: string) => {
    await deleteRecording(recordingId);
  };

  const handleDownloadRecording = (recordingId: string) => {
    dispatch(downloadRecording(recordingId));
  };

  const handleCacheAndPlayRecording = (recording: Recording) => {
    recording._id === currentPlaying?._id
      ? playRecording()
      : dispatch(cacheAndPlayRecording(recording));
  };

  const searchLibrary = (searchValue: string) => {
    setSearchTerm(searchValue);
    if (!searchTerm) {
      return setFilteredRecordings(recordings);
    }

    const filtered = matchSorter(recordings, searchTerm, {
      keys: ['title', 'format'],
      baseSort: (a, b) => (a.index > b.index ? 1 : -1),
    });
    setFilteredRecordings(filtered);
  };

  const sortLibrary = (sortByValue: keyof Recording) => {
    setSortBy(sortByValue);
    if (!sortByValue) return;

    const list = filteredRecordings?.length ? filteredRecordings : recordings;
    const sorted = list.sort((a, b) =>
      a[sortByValue] > b[sortByValue] ? 1 : -1
    );
    setFilteredRecordings(sorted);
  };

  const handleFileDrop = (audioFiles: File[]) => {
    uploadAudioFiles(audioFiles);
  };

  const renderFilteredRecordings = (filteredRecordings: Recording[]) => {
    if (!filteredRecordings.length)
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
            style={{
              display: 'flex',
              width: '100%',
              justifyContent: 'center',
            }}
          >
            <Typography>No results found</Typography>
          </div>
        </div>
      );

    return (
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
    );
  };

  if (loading) {
    return <Loader loading={true} loadingMessage="Loading..." />;
  }

  if (recordings.length < 1) {
    return (
      <>
        <FileDrop accept="audio/*" onFileDrop={handleFileDrop}>
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
              <Typography>Your recordings will live here</Typography>
            </div>
          </div>
        </FileDrop>
        <ErrorModal error={error} onConfirmError={() => confirmError()} />
      </>
    );
  }

  if (recordings.length > 0) {
    return (
      <>
        <FileDrop accept="audio/*" onFileDrop={handleFileDrop}>
          <div
            style={{
              position: 'sticky',
              top: theme.dimensions.Navigation.height,
              zIndex: theme.zIndex.appBar,
              padding: 4,
              paddingTop: 0,
            }}
          >
            <SearchBar
              searchLibrary={searchLibrary}
              sortLibrary={sortLibrary}
            />
          </div>
          <div
            style={{
              paddingBottom: theme.dimensions.Player.height,
            }}
          >
            {searchTerm || sortBy
              ? renderFilteredRecordings(filteredRecordings)
              : recordings.map((recording: Recording) => (
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
          </div>
        </FileDrop>
        <ErrorModal error={error} onConfirmError={() => confirmError()} />
      </>
    );
  }

  return <Loader loading={true} loadingMessage="Loading..." />;
}

const mapStateToProps = (state: RecorderState) => {
  return {
    recordings: state.recordings,
    loading: state.loading,
    databaseInitializing: state.databaseInitializing,
    caching: state.caching,
    playing: state.playing,
    error: state.error,
    selectedRecording: state.selectedRecording,
    currentPlaying: state.currentPlaying,
    accountInfo: state.accountInfo,
  };
};

export default connect(mapStateToProps, actions)(Library);
