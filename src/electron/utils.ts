import path from 'path';
import { promises as fs, existsSync } from 'fs';
import { RecordingFormats } from '../common/RecordingFormats.enum';

export const setStorageDir = async (folderName: string): Promise<string> => {
  const storagePath =
    process.env.NODE_ENV === 'production'
      ? path.resolve(process.resourcesPath, folderName)
      : path.resolve(folderName);

  if (!existsSync(storagePath)) {
    await fs.mkdir(storagePath);
  }
  return storagePath;
};

/**
 * https://stackoverflow.com/a/56569217/4677401
 */
// export const isValidRecordingFormat = (
//   format: string
// ): format is keyof typeof RecordingFormats => {
//   console.log('### FORMAT:', format, Object.values(RecordingFormats));
//   return format in RecordingFormats;
// };

/**
 * https://stackoverflow.com/a/47755096/4677401
 */
export const validRecordingFormat = (format: string): RecordingFormats => {
  if (!(<any>Object).values(RecordingFormats).includes(format)) {
    throw new Error('Recording format not supported');
  }

  return format as RecordingFormats;
};
