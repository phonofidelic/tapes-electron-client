import React, { ReactElement } from 'react';
import { RecordingInterface } from '../common/Recording.interface';
import RecordingsListItem from './RecordingsListItem';
import { List } from '@material-ui/core';

interface RecordingsListProps {
  recordings: RecordingInterface[];
  handleDeleteRecording(recordingId: string): void;
}

export default function RecordingsList({
  recordings,
  handleDeleteRecording,
}: RecordingsListProps): ReactElement {
  return (
    <List>
      {recordings.map((recording: RecordingInterface) => (
        <RecordingsListItem
          key={recording.id}
          recording={recording}
          handleDeleteRecording={handleDeleteRecording}
        />
      ))}
    </List>
  );
}
