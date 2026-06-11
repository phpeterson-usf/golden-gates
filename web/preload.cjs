// preload.js is the security bridge. It exposes only the specific 
// functions you want. The Vue app can't access all of Node.js, 
// just what you explicitly allow here.

const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('electronAPI', {
  saveCircuit: (content, defaultName) =>
    ipcRenderer.invoke('save-circuit', { content, defaultName }),
  openCircuit: () =>
    ipcRenderer.invoke('open-circuit')
})