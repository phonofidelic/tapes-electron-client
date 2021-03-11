import { RecordingFormats } from './RecordingFormats.enum';

export interface RecordingSettings {
  channels: number;
  type: string;
  extension: RecordingFormats;
  storageLocation: string;
}
