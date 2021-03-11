import { Main } from './electron/Main';
import { StartRecordingChannel } from './electron/channels/StartRecordingChannel';
import { LoadRecordingsChannel } from './electron/channels/LoadRecordingsChannel';
import { DeleteRecordingChannel } from './electron/channels/DeleteRecordingChannel';

new Main().init([
  new StartRecordingChannel(),
  new LoadRecordingsChannel(),
  new DeleteRecordingChannel(),
]);
