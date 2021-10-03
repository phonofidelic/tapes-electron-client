/**
 * https://github.com/electron/electron/issues/9920#issuecomment-575839738
 */
const { contextBridge, ipcRenderer } = require('electron');

const validChannels = [
  'recorder:start',
  'recorder:stop',
  'recorder:set-input',
  'storage:delete_one',
  'storage:upload',
];

const validResponseChannels = [
  'recorder:start:response:.*',
  'recorder:stop:response:.*',
  'recorder:set-input:.*',
  'storage:delete_one:response:.*',
  'storage:upload:response:.*',
];

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
