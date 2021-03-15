/**
 * https://github.com/electron/electron/issues/9920#issuecomment-575839738
 */
const { contextBridge, ipcRenderer } = require('electron');

const validChannels = [
  'recorder:start',
  'recorder:stop',
  'storage:load',
  'storage:delete_one',
];

validResponseChannels = [
  'recorder:start:response:.*',
  'recorder:stop:response:.*',
  'storage:load:response:.*',
  'storage:delete_one:response:.*',
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
