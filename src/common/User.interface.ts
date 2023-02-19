import Store from 'orbit-db-store';

export interface User {
  docStores: {
    [key: string]: Store;
  };
  nodeId: string;
  dbAddress: {
    root: string;
    path: string;
  };
  deviceName: string;
}
