import { RecordingFormats } from './RecordingFormats.enum';

export interface RecordingSettings {
  channels: number;
  format: RecordingFormats;
}
