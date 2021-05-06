import { RecordingFormats } from './RecordingFormats.enum';

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
}
