export interface IpcRequest {
  responseChannel?: string;
  params?: string[];
  data?: any; // TODO: formalize data structure?
}
