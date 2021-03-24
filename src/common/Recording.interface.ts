export interface Recording {
  id: string;
  location: string;
  remoteLocation?: string;
  bucketPath?: string;
  title: string;
  filename: string;
  size: number;
  duration?: number;
  created: Date;
}
