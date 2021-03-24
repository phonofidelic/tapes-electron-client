// import { randomBytes } from 'crypto';
import Dexie from 'dexie';
import { Recording } from './common/Recording.interface';

export class AppDatabase extends Dexie {
  recordings: Dexie.Table<Recording, string>;

  constructor() {
    super('TapesDatabase');

    this.version(1).stores({
      recordings: '++id, location, title, size, created',
    });

    this.recordings.mapToClass(RecordingModel);
  }
}

export class RecordingModel implements Recording {
  id: string;
  location: string;
  remoteLocation?: string;
  bucketPath?: string;
  title: string;
  filename: string;
  size: number;
  duration: number;
  created: Date;

  constructor(
    location: string,
    filename: string,
    title: string,
    size: number,
    duration: number,
    remoteLocation?: string,
    bucketPath?: string
  ) {
    // this.id = randomBytes(12).toString('hex');
    this.id = Date.now().toString();
    this.filename = filename;
    this.created = new Date();
    this.location = location;
    this.remoteLocation = remoteLocation || '';
    this.bucketPath = bucketPath || '';
    this.title = title;
    this.size = size;
    this.duration = duration;
  }
}

export const db = new AppDatabase();
