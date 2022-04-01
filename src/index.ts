(global as any).WebSocket = require('isomorphic-ws');
import { Main } from './electron/Main';
import { NewRecordingChannel } from './electron/channels/NewRecordingChannel';
import { DeleteRecordingChannel } from './electron/channels/DeleteRecordingChannel';
import { UploadAudioFileChannel } from './electron/channels/UploadAudioFileChannel';
import { SetInputDeviceChannel } from './electron/channels/SetInputDevaiceChannel';
import { CacheRecordingChannel } from './electron/channels/CacheRecordingChannel';
import { LoadRecordingsChannel } from './electron/channels/LoadRecordingsChannel';
import { UpdateRecordingChannel } from './electron/channels/UpdateRecordingChannel'

new Main().init([
  new NewRecordingChannel(),
  new DeleteRecordingChannel(),
  new UploadAudioFileChannel(),
  new SetInputDeviceChannel(),
  new CacheRecordingChannel(),
  new LoadRecordingsChannel(),
  new UpdateRecordingChannel()
]);
