import { ICommonTagsResult } from 'music-metadata';
import { RecordingFormats } from './RecordingFormats.enum';
import { AcoustidResult } from './AcoustidResult.interface';

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
  fileData?: any;
  fingerprint?: string;
  acoustidResults?: AcoustidResult[];
}
