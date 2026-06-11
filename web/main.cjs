// main.js acts as the "backend" of the desktop app. 
// It does three things: creates the window, loads your Vue app into it, 
// and listens for file save/open requests from the Vue side.


const { app, BrowserWindow, ipcMain, dialog } = require('electron')
const fs = require('fs')
const path = require('path')
app.name = 'Golden Gates'

function createWindow() {
  const win = new BrowserWindow({
    width: 1280,
    height: 800,
    icon: path.join(__dirname, 'assets/icon.icns'),
    webPreferences: {
      preload: path.join(__dirname, 'preload.cjs')
    }
  })
  win.loadFile('dist/index.html')
}

// Save circuit to disk
ipcMain.handle('save-circuit', async (event, { content, defaultName }) => {
  const { filePath } = await dialog.showSaveDialog({
    defaultPath: defaultName,
    filters: [{ name: 'Circuit', extensions: ['json'] }]
  })
  if (filePath) {
    fs.writeFileSync(filePath, content)
    return filePath
  }
  return null
})

// Open circuit from disk
ipcMain.handle('open-circuit', async () => {
  const { filePaths } = await dialog.showOpenDialog({
    filters: [{ name: 'Circuit', extensions: ['json'] }],
    properties: ['openFile']
  })
  if (filePaths.length > 0) {
    return fs.readFileSync(filePaths[0], 'utf8')
  }
  return null
})

app.whenReady().then(createWindow)

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})