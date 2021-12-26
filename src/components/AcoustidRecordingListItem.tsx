import React, { ReactElement, useState } from 'react';
import { AcoustidRecording } from '../common/AcoustidResult.interface';

import { Collapse, ListItem, Typography } from '@material-ui/core';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import { Recording } from '../common/Recording.interface';

interface Props {
  acoustidRecording: AcoustidRecording;
  recording: Recording;
  excludeCompilations: boolean;
  handleEditRecording(recordingId: string, update: any): void;
  children: ReactElement[];
}

export default function AcoustidRecordingListItem({
  acoustidRecording,
  recording,
  excludeCompilations,
  handleEditRecording,
  children,
}: Props): ReactElement {
  const [expanded, setExpanded] = React.useState(false);

  const handleToggleExpand = () => {
    setExpanded(!expanded);
  };

  const filteredReleaseGroups = acoustidRecording.releasegroups.filter(
    (acoustidReleaseGroup) =>
      excludeCompilations
        ? !acoustidReleaseGroup.secondarytypes?.includes('Compilation')
        : acoustidReleaseGroup
  );

  if (!filteredReleaseGroups.length) return null;

  return (
    <>
      <ListItem button onClick={handleToggleExpand}>
        <Typography>
          {acoustidRecording.title} - {filteredReleaseGroups.length} release
          {filteredReleaseGroups.length > 1 && 's'}
        </Typography>
        <ExpandMoreIcon
          style={{
            transform: expanded ? 'rotate(180deg)' : 'rotate(0deg)',
          }}
        />
      </ListItem>
      <Collapse in={expanded} timeout="auto" unmountOnExit>
        {...children}
      </Collapse>
    </>
  );
}
