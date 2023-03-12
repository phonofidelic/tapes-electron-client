import React from 'react';
import { AcoustidRecording } from '@/common/AcoustidResult.interface';
import { Collapse, ListItem, Typography, useTheme } from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { Recording } from '@/common/Recording.interface';
import { getArtistNameFromAcoustidRecording } from '@/utils';

interface Props {
  acoustidRecording: AcoustidRecording;
  excludeCompilations: boolean;
  handleEditRecording(recordingId: string, update: Partial<Recording>): void;
  children: React.ReactNode;
}

export default function AcoustidRecordingListItem({
  acoustidRecording,
  excludeCompilations,
  children,
}: Props) {
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
          {acoustidRecording.title} by{' '}
          {getArtistNameFromAcoustidRecording(acoustidRecording)} -{' '}
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
        {children}
      </Collapse>
    </>
  );
}
