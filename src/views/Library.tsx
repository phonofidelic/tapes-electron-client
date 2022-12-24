import React, { useState, useEffect } from 'react';
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

import Loader from '../components/Loader';
import SearchBar from '../components/SearchBar';
import RecordingsListItem from '../components/RecordingsListItem';
import FileDrop from '../components/FileDrop';
import ErrorModal from '../components/ErrorModal';

import { useTheme } from '@mui/material';
import Typography from '@mui/material/Typography';
import List from '@mui/material/List';
import { AccountInfo } from '@/common/AccountInfo.interface';

const {
  loadRecordings,
  deleteRecording,
  editRecording,
  uploadAudioFiles,
  downloadRecording,
  cacheAndPlayRecording,
} = effects;

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
  accountInfo,
  recordings,
  loading,
  databaseInitializing,
  caching,
  playing,
  error,
  selectedRecording,
  currentPlaying,
  selectRecording,
  playRecording,
  confirmError,
}: LibraryProps) {
  const [filteredRecordings, setFilteredRecordings] =
    useState<Recording[]>(recordings);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<keyof Recording | null>(null);

  const dispatch = useDispatch();
  const theme = useTheme();

  const handleSelectRecording = (recording: Recording) => {
    selectRecording(recording);
  };

  const handleEditRecording = (recordingId: string, update: any) => {
    console.log('*** handleEditRecording');
    dispatch(editRecording(recordingId, update));
  };

  const handleDeleteRecording = (recordingId: string) => {
    dispatch(deleteRecording(recordingId));
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
      console.log('*** NO SEARCH TERM ***');
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

    const list = filteredRecordings.length ? filteredRecordings : recordings;
    const sorted = list.sort((a, b) =>
      a[sortByValue] > b[sortByValue] ? 1 : -1
    );
    console.log('*** sorted:', sorted);
    setFilteredRecordings(sorted);
  };

  const handleFileDrop = (audioFiles: File[]) => {
    dispatch(uploadAudioFiles(audioFiles));
  };

  // useEffect(() => {
  //   (!loading && !databaseInitializing) && dispatch(loadRecordings());
  // }, [recordings.length, databaseInitializing]);

  useEffect(() => {
    if (!accountInfo) return;
    dispatch(loadRecordings(accountInfo.recordingsDb?.root));
  }, [accountInfo, recordings.length]);

  console.log('*** searchTerm:', searchTerm);
  console.log('*** recordings:', recordings);
  console.log('*** filteredRecordings:', filteredRecordings);

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
    return <Loader />;
  }

  if (!recordings.length)
    return (
      <FileDrop accept="audio/*" onFileDrop={handleFileDrop}>
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
      </FileDrop>
    );

  if (recordings.length > 0)
    return (
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
          <SearchBar searchLibrary={searchLibrary} sortLibrary={sortLibrary} />
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
        <ErrorModal error={error} onConfirmError={() => confirmError()} />
      </FileDrop>
    );

  return <Loader />;
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
