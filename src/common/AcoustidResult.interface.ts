export interface AcoustidResult {
  id: string;
  recordings: AcoustidRecording[];
  score: number;
}

export interface AcoustidRecording {
  artists: AcoustidArtist[];
  duration: number;
  id: string;
  releasegroups: AcoustidReleaseGroup[];
  title: string;
}

interface AcoustidArtist {
  id: string;
  name: string;
}

export interface AcoustidReleaseGroup {
  artists?: AcoustidArtist[];
  id: string;
  secondarytypes: string[];
  title: string;
  type: string;
}