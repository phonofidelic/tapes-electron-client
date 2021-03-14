const { contextBridge, ipcRenderer } = require('electron');

const validChannels = [
  'recorder:start',
  'recorder:start:response',
  'recorder:stop',
  'recorder:stop:response',
  'storage:load',
  'storage:load:response',
  'storage:delete_one',
  'storage:delete_one:response',
];

/**
 * https://github.com/electron/electron/issues/9920#issuecomment-575839738
 */
contextBridge.exposeInMainWorld('api', {
  send: (channel, data) => {
    if (validChannels.includes(channel)) {
      ipcRenderer.send(channel, data);
    }
  },
  receive: (channel, func) => {
    if (validChannels.includes(channel)) {
      // Deliberately strip event as it includes `sender`
      ipcRenderer.on(channel, (event, ...args) => func(...args));
    }
  },
});

console.log('*** preload ***');
