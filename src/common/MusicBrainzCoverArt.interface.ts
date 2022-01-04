export interface MusicBrainzCoverArt {
  approved: boolean;
  back: boolean;
  comment: string;
  edit: number;
  front: boolean;
  id: number;
  image: string;
  thumbnails: {
    '1200'?: string;
    '250'?: string;
    large?: string;
    small?: string;
  };
  types: string[];
}
