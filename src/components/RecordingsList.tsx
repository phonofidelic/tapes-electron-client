import React, { ReactElement } from 'react';
import { Recording } from '../common/Recording.interface';
import RecordingsListItem from './RecordingsListItem';
import { List } from '@material-ui/core';

interface RecordingsListProps {
  recordings: Recording[];
  selectedRecording: string;
  handleSelectRecording(recordingId: string): void;
  handleDeleteRecording(recordingId: string): void;
}

export default function RecordingsList({
  recordings,
  selectedRecording,
  handleSelectRecording,
  handleDeleteRecording,
}: RecordingsListProps): ReactElement {
  return (
    <List>
      {recordings.map((recording: Recording) => (
        <RecordingsListItem
          key={recording.id}
          recording={recording}
          selectedRecording={selectedRecording}
          handleSelectRecording={handleSelectRecording}
          handleDeleteRecording={handleDeleteRecording}
        />
      ))}
    </List>
  );
}
