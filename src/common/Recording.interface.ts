import { RecordingFormats } from './RecordingFormats.enum';

export interface Recording {
  _id?: string;
  location: string;
  filename: string;
  size: number;
  format: RecordingFormats;
  channels: number;
  id?: string;
  remoteLocation?: string;
  bucketPath?: string;
  title?: string;
  duration?: number;
  created?: Date;
}
