(global as any).WebSocket = require('isomorphic-ws');
import { Main } from './electron/Main';
import { NewRecordingChannel } from './electron/channels/NewRecordingChannel';
import { DeleteRecordingChannel } from './electron/channels/DeleteRecordingChannel';
import { UploadAudioFileChannel } from './electron/channels/UploadAudioFileChannel';
import { SetInputDeviceChannel } from './electron/channels/SetInputDevaiceChannel';
import { CacheRecordingChannel } from './electron/channels/CacheRecordingChannel';

new Main().init([
  new NewRecordingChannel(),
  new DeleteRecordingChannel(),
  new UploadAudioFileChannel(),
  new SetInputDeviceChannel(),
  new CacheRecordingChannel(),
]);
