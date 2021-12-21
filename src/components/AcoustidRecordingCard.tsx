import React, { useState, useEffect } from 'react';
import { AcoustidRecording } from '../common/AcoustidResult.interface';
import { MusicBrainzCoverArt } from '../common/MusicBrainzCoverArt.interface';
import axios from 'axios';

import Card from '@material-ui/core/Card';
import CardActions from '@material-ui/core/CardActions';
import CardContent from '@material-ui/core/CardContent';
import Typography from '@material-ui/core/Typography';
import { Button, CardHeader, CardMedia, Collapse } from '@material-ui/core';
import IconButton from '@material-ui/core/IconButton';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import MoreVertIcon from '@material-ui/icons/MoreVert';

interface Props {
  acoustidRecording: AcoustidRecording;
}

export const AcoustidRecordingCard = ({ acoustidRecording }: Props) => {
  const [coverArt, setCoverArt] = useState<MusicBrainzCoverArt>(null);
  const [error, setError] = useState(null);
  const [expanded, setExpanded] = React.useState(false);

  const handleExpandClick = () => {
    setExpanded(!expanded);
  };

  useEffect(() => {
    const getCoverArt = async () => {
      try {
        const response = await axios.get(
          `https://coverartarchive.org/release-group/${acoustidRecording.releasegroups[0]?.id}`
        );

        console.log('getCoverArt response:', response);

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
          alt={`Cover art for the album ${acoustidRecording.releasegroups[0]?.title}`}
        />
      )}
      <CardHeader
        title={acoustidRecording.title}
        subheader={`Appears on "${acoustidRecording.releasegroups[0]?.title}"`}
      />
      <CardActions
        style={{
          display: 'flex',
        }}
      >
        <Button>Add this info</Button>
        <div style={{ flex: 1 }} />
        <IconButton onClick={handleExpandClick} aria-label="show more">
          <ExpandMoreIcon
            style={{
              transform: expanded ? 'rotate(180deg)' : 'rotate(0deg)',
            }}
          />
        </IconButton>
      </CardActions>
      <Collapse in={expanded} timeout="auto" unmountOnExit>
        <CardContent>
          <ul>
            {acoustidRecording.releasegroups.map((acoustidReleaseGroup) => (
              <li
                key={`acoustid-releaase-group_${acoustidReleaseGroup.id}`}
                style={{ listStyle: 'none' }}
              >
                <div>
                  <Typography variant="caption">
                    Artist: "{acoustidRecording.artists[0].name}"
                  </Typography>
                </div>
                <div>
                  <Typography variant="caption">
                    Appears on: "{acoustidReleaseGroup.title}"
                  </Typography>
                </div>
                <div>
                  <Typography variant="caption">
                    Release Type: {acoustidReleaseGroup.type}{' '}
                    {acoustidReleaseGroup.secondarytypes &&
                      ` - ${acoustidReleaseGroup.secondarytypes[0]}`}
                  </Typography>
                </div>
              </li>
            ))}
          </ul>
        </CardContent>
      </Collapse>
    </Card>
  );
};
