export enum CompanionStatus {
  Online = 'online',
  Offline = 'offline',
  Unknown = 'unknown',
}

export interface Companion {
  dbAddress: { path: string; root: string };
  deviceName: string;
  recordingsAddrRoot: string;
  nodeId: string;
  status: CompanionStatus;
}
