export interface AccountInfo {
  nodeId: string;
  dbAddress: string;
  deviceName: string;
  recordingsDb?: { root: string; path: string };
}
