import React, { useState, useEffect } from 'react';
import {
  AcoustidRecording,
  AcoustidReleaseGroup,
  AcoustidResult,
} from '../common/AcoustidResult.interface';
import { MusicBrainzCoverArt } from '../common/MusicBrainzCoverArt.interface';
import axios from 'axios';
import { ICommonTagsResult } from 'music-metadata';
import { Recording } from '../common/Recording.interface';

import Card from '@mui/material/Card';
import CardActions from '@mui/material/CardActions';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import { Button, CardHeader, CardMedia, Collapse } from '@mui/material';
import IconButton from '@mui/material/IconButton';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

interface Props {
  recording: Recording;
  acoustidRecording: AcoustidRecording;
  acoustidReleaseGroup: AcoustidReleaseGroup;
  handleEditRecording(recordingId: string, update: any): void;
}

export default function AcoustidReleaseGroupCard({
  recording,
  acoustidRecording,
  acoustidReleaseGroup,
  handleEditRecording,
}: Props) {
  const [coverArt, setCoverArt] = useState<MusicBrainzCoverArt>(null);
  const [error, setError] = useState(null);
  const [expanded, setExpanded] = React.useState(false);

  const infoAdded =
    recording.common.musicbrainz_releasegroupid === acoustidReleaseGroup.id;

  const handleExpandClick = () => {
    setExpanded(!expanded);
  };

  const handleAddInfo = (
    acoustidRecording: AcoustidRecording,
    acoustidReleaseGroup: AcoustidReleaseGroup
  ) => {
    console.log('handleAddInfo, acoustidReleaseGroup:', acoustidReleaseGroup);

    const newCommon: ICommonTagsResult = {
      ...recording.common,
      artist: acoustidRecording.artists[0].name,
      title: acoustidRecording.title,
      album: acoustidReleaseGroup.title,
      releasetype: [acoustidReleaseGroup.type],
      musicbrainz_releasegroupid: acoustidReleaseGroup.id,
    };

    handleEditRecording(recording._id, {
      common: newCommon,
      musicBrainzCoverArt: coverArt,
    });
  };

  useEffect(() => {
    const getCoverArt = async () => {
      try {
        const response = await axios.get(
          `https://coverartarchive.org/release-group/${acoustidReleaseGroup.id}`
        );

        // console.log('getCoverArt response:', response);

        setCoverArt(response.data.images[0]);
      } catch (err) {
        console.error('Could not get cover art:', err);
      }
    };

    getCoverArt();
  }, []);

  return (
    <Card
      style={{
        marginBottom: 8,
      }}
      variant="outlined"
    >
      {coverArt && (
        <CardMedia
          component="img"
          height="140"
          image={coverArt.thumbnails.large}
          alt={`Cover art for the album ${acoustidReleaseGroup.title}`}
        />
      )}
      <CardHeader
        title={acoustidReleaseGroup.title}
        subheader={`Appears on "${acoustidReleaseGroup.title}"`}
        action={
          infoAdded ? <CheckCircleIcon style={{ color: 'green' }} /> : null
        }
      />
      <CardActions
        style={{
          display: 'flex',
        }}
      >
        {infoAdded ? (
          <Typography>Info added</Typography>
        ) : (
          <Button
            onClick={() =>
              handleAddInfo(acoustidRecording, acoustidReleaseGroup)
            }
          >
            Add this info
          </Button>
        )}
        <div style={{ flex: 1 }} />
        <IconButton onClick={handleExpandClick} aria-label="show more" size="large">
          <ExpandMoreIcon
            style={{
              transform: expanded ? 'rotate(180deg)' : 'rotate(0deg)',
            }}
          />
        </IconButton>
      </CardActions>
      <Collapse in={expanded} timeout="auto" unmountOnExit>
        <CardContent>
          <div>
            <Typography variant="caption">
              Artist: {acoustidRecording.artists[0].name || 'No artist info'}
            </Typography>
          </div>
          <div>
            <Typography variant="caption">
              Album: {acoustidReleaseGroup.title}
            </Typography>
          </div>
          <div>
            <Typography variant="caption">
              Release Type: {acoustidReleaseGroup.type}{' '}
              {acoustidReleaseGroup.secondarytypes &&
                ` - ${acoustidReleaseGroup.secondarytypes[0]}`}
            </Typography>
          </div>
          <div>
            <Typography variant="caption">
              Release Group ID: {acoustidReleaseGroup.id}
            </Typography>
          </div>
        </CardContent>
      </Collapse>
    </Card>
  );
}
