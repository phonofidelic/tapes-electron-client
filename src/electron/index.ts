(global as any).WebSocket = require('isomorphic-ws');
require('dotenv').config();
import { Main } from './Main';
import { NewRecordingChannel } from './channels/NewRecordingChannel';
import { DeleteRecordingChannel } from './channels/DeleteRecordingChannel';
import { UploadAudioFileChannel } from './channels/UploadAudioFileChannel';
import { SetInputDeviceChannel } from './channels/SetInputDeviceChannel';
import { CacheRecordingChannel } from './channels/CacheRecordingChannel';
import { GetRecordingStorageStatusChannel } from './channels/GetRecordingStorageStatusChannel';
import { DeployWebClientChannel } from './channels/DeployWebClinetChannel';

new Main().init([
  new NewRecordingChannel(),
  new DeleteRecordingChannel(),
  new UploadAudioFileChannel(),
  new SetInputDeviceChannel(),
  new CacheRecordingChannel(),
  new GetRecordingStorageStatusChannel(),
  new DeployWebClientChannel(),
]);
