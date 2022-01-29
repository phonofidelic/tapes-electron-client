import React from 'react';
import { ICommonTagsResult } from 'music-metadata';
import { MusicBrainzCoverArt } from '../common/MusicBrainzCoverArt.interface';

import { Button, Typography } from '@mui/material';

interface CommonTagsResult extends ICommonTagsResult {
  [key: string]: any;
}

type Props = {
  common: CommonTagsResult;
  musicBrainzCoverArt: MusicBrainzCoverArt;
};

const renderCommonValue = (value: any) => {
  if (typeof value === 'string') return value;

  if (Array.isArray(value)) return value.join(', ');

  if (typeof value === 'object')
    return Object.keys(value).map(
      (key) =>
        `${key.replace('no', '').replace('of', ' / ')} ${JSON.stringify(
          value[key]
        ).replace('null', '0')} `
    );

  return JSON.stringify(value);
};

export default function CommonMetadata({ common, musicBrainzCoverArt }: Props) {
  const keys = Object.keys(common);

  const IGNORED_COMMON_KEYS = ['musicbrainz_releasegroupid'];

  return (
    <div style={{ marginTop: 16 }}>
      <Typography>Metadata:</Typography>
      <table style={{ width: '100%' }}>
        <tbody>
          {musicBrainzCoverArt && (
            <tr>
              <td style={{ border: `1px solid #fff` }}>
                <Typography variant="caption" color="textSecondary">
                  Cover Art
                </Typography>
              </td>
              <td style={{ border: `1px solid #fff` }}>
                <img
                  height="50"
                  width="50"
                  src={
                    musicBrainzCoverArt?.thumbnails.small ||
                    musicBrainzCoverArt?.image
                  }
                />
              </td>
            </tr>
          )}
          {keys
            .filter((key) => !IGNORED_COMMON_KEYS.includes(key))
            .sort()
            .map((key, i) => (
              <tr key={`common-meta_${i}`}>
                <td style={{ border: `1px solid #fff` }}>
                  <Typography variant="caption" color="textSecondary">
                    {key.charAt(0).toUpperCase() + key.slice(1)}
                  </Typography>
                </td>
                <td style={{ border: `1px solid #fff` }}>
                  <Typography variant="caption" color="textSecondary">
                    {renderCommonValue(common[key])}
                  </Typography>
                </td>
              </tr>
            ))}
        </tbody>
        <tfoot>
          <tr>
            <td></td>
            <td>
              <Button size="small" style={{ textTransform: 'none' }}>
                <Typography variant="caption" color="textSecondary">
                  + add more info
                </Typography>
              </Button>
            </td>
          </tr>
        </tfoot>
      </table>
    </div>
  );
}
