(global as any).WebSocket = require('isomorphic-ws');
import { Main } from './electron/Main';
import { StartRecordingChannel } from './electron/channels/StartRecordingChannel';
import { DeleteRecordingChannel } from './electron/channels/DeleteRecordingChannel';

new Main().init([new StartRecordingChannel(), new DeleteRecordingChannel()]);
