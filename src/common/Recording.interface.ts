import { ICommonTagsResult } from 'music-metadata';
import { RecordingFormats } from './RecordingFormats.enum';
import { AcoustidResult } from './AcoustidResult.interface';
import { MusicBrainzCoverArt } from './MusicBrainzCoverArt.interface';
import { Status } from 'web3.storage'

export interface Recording {
  _id?: string;
  location: string;
  filename: string;
  size: number;
  format: RecordingFormats;
  channels: number;
  remoteLocation?: string;
  title?: string;
  duration?: number;
  created?: Date;
  common?: ICommonTagsResult;
  fingerprint?: string;
  acoustidResults?: AcoustidResult[];
  musicBrainzCoverArt?: MusicBrainzCoverArt;
  cid?: string;
}

export interface RecordingStorageStatus extends Status { }