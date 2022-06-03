import { Recording } from '../common/Recording.interface';
import { RecordingFormats } from '../common/RecordingFormats.enum';
import { AcoustidResult } from '../common/AcoustidResult.interface';
import { MusicBrainzCoverArt } from '../common/MusicBrainzCoverArt.interface';
import { ICommonTagsResult } from 'music-metadata';

export class RecordingModel implements Recording {
  location: string;
  remoteLocation?: string;
  bucketPath?: string;
  title: string;
  filename: string;
  size: number;
  duration: number;
  created: Date;
  format: RecordingFormats;
  channels: number;
  common?: ICommonTagsResult;
  acoustidResults?: AcoustidResult[];
  musicBrainzCoverArt?: MusicBrainzCoverArt;

  constructor(
    location: string,
    filename: string,
    title: string,
    size: number,
    format: RecordingFormats,
    channels: number,
    duration: number,
    remoteLocation?: string,
    bucketPath?: string,
    common?: ICommonTagsResult,
    acoustidResults?: AcoustidResult[],
    musicBrainzCoverArt?: MusicBrainzCoverArt
  ) {
    this.filename = filename;
    this.created = new Date();
    this.location = location;
    this.remoteLocation = remoteLocation || '';
    this.bucketPath = bucketPath || '';
    this.title = title;
    this.size = size;
    this.duration = duration;
    this.format = format;
    this.channels = channels;
    this.common = common;
    this.acoustidResults = acoustidResults;
    this.musicBrainzCoverArt = musicBrainzCoverArt;
  }
}
