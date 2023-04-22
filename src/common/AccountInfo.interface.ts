export type AccountInfo = {
  nodeId: string;
  dbAddress: { root: string; path: string };
  deviceName: string;
  recordingsDb?: { root: string; path: string };
  recordingsAddrRoot: string;
};
