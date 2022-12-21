export enum CompanionStatus {
  Online = 'online',
  Offline = 'offline',
  Unknown = 'unknown',
}

export interface Companion {
  dbAddress: { path: string; root: string };
  deviceName: string;
  docStores: {
    [key: string]: { path: string; root: string };
  };
  nodeId: string;
  status: CompanionStatus;
}
