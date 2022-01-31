import React, { useState } from 'react';
import { AcoustidResult } from '../common/AcoustidResult.interface';
import { Recording } from '../common/Recording.interface';
import AcoustidReleaseGroupCard from './AcoustidReleaseGroupCard';
import AcoustidRecordingListItem from './AcoustidRecordingListItem';

import { Checkbox, List, Typography } from '@mui/material';

type Props = {
  acoustidResults: AcoustidResult[];
  recording: Recording;
  handleEditRecording(recordingId: string, update: any): void;
};

export default function AcoutidResults({
  acoustidResults,
  recording,
  handleEditRecording,
}: Props) {
  const [excludeCompilations, setExcludeCompilations] = useState(false);

  /**
   * https://yagisanatode.com/2021/07/03/get-a-unique-list-of-objects-in-an-array-of-object-in-javascript/
   */
  const uniqueAcoustidRecordings = acoustidResults
    ? [
        ...new Map(
          acoustidResults[0].recordings.map((item) => [
            item['releasegroups'][0]['id'],
            item,
          ])
        ).values(),
      ]
    : [];

  const handleExcludeCompilations = () => {
    setExcludeCompilations(!excludeCompilations);
  };

  return (
    <div>
      <div
        style={
          {
            // display: 'flex',
          }
        }
      >
        <div style={{ marginBottom: 0 }}>
          <a href="https://acoustid.org/" target="_blank">
            AcoustID results
          </a>
        </div>
        <div style={{ marginBottom: 8, display: 'flex' }}>
          <Typography style={{ lineHeight: '38px' }} variant="caption">
            Exclude compilations
          </Typography>
          <Checkbox
            size="small"
            value={excludeCompilations}
            onChange={handleExcludeCompilations}
          />
        </div>
      </div>

      <List>
        {uniqueAcoustidRecordings.map((acoustidRecording) => (
          <AcoustidRecordingListItem
            key={`acoustid-recording_${acoustidRecording.id}`}
            acoustidRecording={acoustidRecording}
            excludeCompilations={excludeCompilations}
            handleEditRecording={handleEditRecording}
          >
            {acoustidRecording.releasegroups
              .filter((acoustidReleaseGroup) =>
                excludeCompilations
                  ? !acoustidReleaseGroup.secondarytypes?.includes(
                      'Compilation'
                    )
                  : acoustidReleaseGroup
              )
              .map((acoustidReleaseGroup) => (
                <AcoustidReleaseGroupCard
                  key={`acoustid-releasegroup_${acoustidReleaseGroup.id}`}
                  recording={recording}
                  acoustidRecording={acoustidRecording}
                  acoustidReleaseGroup={acoustidReleaseGroup}
                  handleEditRecording={handleEditRecording}
                />
              ))}
          </AcoustidRecordingListItem>
        ))}
      </List>
    </div>
  );
}
