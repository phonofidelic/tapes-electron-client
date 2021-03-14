import React, { ReactElement } from 'react';
import { Recording } from '../common/Recording.interface';
import RecordingsListItem from './RecordingsListItem';
import { List } from '@material-ui/core';

interface RecordingsListProps {
  recordings: Recording[];
  handleDeleteRecording(recordingId: string): void;
}

export default function RecordingsList({
  recordings,
  handleDeleteRecording,
}: RecordingsListProps): ReactElement {
  return (
    <List>
      {recordings.map((recording: Recording) => (
        <RecordingsListItem
          key={recording.id}
          recording={recording}
          handleDeleteRecording={handleDeleteRecording}
        />
      ))}
    </List>
  );
}
