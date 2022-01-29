import React, { ReactElement, useState } from 'react';
import { AcoustidRecording } from '../common/AcoustidResult.interface';

import { Collapse, ListItem, Typography, useTheme } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { Recording } from '../common/Recording.interface';

interface Props {
  acoustidRecording: AcoustidRecording;
  excludeCompilations: boolean;
  handleEditRecording(recordingId: string, update: any): void;
  children: ReactElement[];
}

export default function AcoustidRecordingListItem({
  acoustidRecording,
  excludeCompilations,
  handleEditRecording,
  children,
}: Props): ReactElement {
  const [expanded, setExpanded] = React.useState(false);

  const theme = useTheme();

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
      <ListItem
        button
        style={{
          position: 'sticky',
          top: theme.dimensions.Navigation.height + 34,
          backgroundColor: theme.palette.background.default,
          zIndex: theme.zIndex.appBar,
          display: 'flex',
          justifyContent: 'center',
        }}
        onClick={handleToggleExpand}
      >
        <Typography>
          {acoustidRecording.title} by {acoustidRecording.artists[0].name} -{' '}
          {filteredReleaseGroups.length} release
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
