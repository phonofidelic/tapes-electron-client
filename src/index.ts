(global as any).WebSocket = require('isomorphic-ws');
require('dotenv').config()
import { Main } from './electron/Main';
import { NewRecordingChannel } from './electron/channels/NewRecordingChannel';
import { DeleteRecordingChannel } from './electron/channels/DeleteRecordingChannel';
import { UploadAudioFileChannel } from './electron/channels/UploadAudioFileChannel';
import { SetInputDeviceChannel } from './electron/channels/SetInputDeviceChannel';
import { CacheRecordingChannel } from './electron/channels/CacheRecordingChannel';
import { GetRecordingStorageStatusChannel } from './electron/channels/GetRecordingStorageStatusChannel';
import { DeployWebClientChannel } from './electron/channels/DeployWebClinetChannel'

new Main().init([
  new NewRecordingChannel(),
  new DeleteRecordingChannel(),
  new UploadAudioFileChannel(),
  new SetInputDeviceChannel(),
  new CacheRecordingChannel(),
  new GetRecordingStorageStatusChannel(),
  new DeployWebClientChannel(),
]);
