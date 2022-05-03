/**
 * https://github.com/electron/electron/issues/9920#issuecomment-575839738
 */
// require('dotenv').config();
const { contextBridge, ipcRenderer } = require('electron');

const validChannels = [
  'recorder:start',
  'recorder:stop',
  'recorder:set-input',
  'storage:upload',
  'storage:cache_recording',
  'storage:get_recording_stats',
  'recordings:get_all',
  'recordings:update',
  'recordings:delete_one',
  'identity:export'
];

const validResponseChannels = validChannels.map(channel => `${channel}:response:.*`)

const api = {
  send: (channel, data) => {
    if (validChannels.includes(channel)) {
      ipcRenderer.send(channel, data);
    }
  },
  receive: (channel, func) => {
    if (
      validResponseChannels
        .map((responseChannel) => RegExp(responseChannel).test(channel))
        .includes(true)
    ) {
      // Deliberately strip event as it includes `sender`
      ipcRenderer.on(channel, (event, ...args) => func(...args));
    }
  },
};

contextBridge.exposeInMainWorld('api', api);
