export interface Recording {
  location: string;
  filename: string;
  size: number;
  id?: string;
  remoteLocation?: string;
  bucketPath?: string;
  title?: string;
  duration?: number;
  created?: Date;
}
