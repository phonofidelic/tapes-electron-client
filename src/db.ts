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
  title: string;
  size: number;
  created: Date;

  constructor(location: string, title: string, size: number) {
    // this.id = randomBytes(12).toString('hex');
    this.id = Date.now().toString();
    this.created = new Date();
    this.location = location;
    this.title = title;
    this.size = size;
  }
}

export const db = new AppDatabase();
