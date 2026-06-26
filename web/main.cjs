// main.js acts as the "backend" of the desktop app.
// It does three things: creates the window, loads your Vue app into it,
// and listens for file save/open requests from the Vue side.


const { app, BrowserWindow, ipcMain, dialog } = require('electron')
const fs = require('fs')
const path = require('path')
app.name = 'Golden Gates'

let mainWindow = null
let pendingFilePath = null  // file opened before the renderer is ready

// Windows/Linux pass the path of an associated file as a command-line argument
// when the app is launched (or re-launched) by double-clicking it. Pick out the
// .ggc path, ignoring the executable and any Chromium/Electron flags.
function getFilePathFromArgv(argv) {
  return (
    argv.find(arg => !arg.startsWith('-') && arg.toLowerCase().endsWith('.ggc')) ||
    null
  )
}

// Read a circuit file and hand its contents to the renderer, or queue it if the
// window isn't ready yet. Shared by macOS (open-file event) and Windows/Linux
// (command-line argument).
function openCircuitFile(filePath) {
  if (!filePath) return
  if (mainWindow && !mainWindow.isDestroyed()) {
    try {
      mainWindow.webContents.send('open-file', fs.readFileSync(filePath, 'utf8'))
    } catch (err) {
      console.error('Failed to read circuit file:', filePath, err)
    }
  } else {
    pendingFilePath = filePath  // window not ready yet, queue it
  }
}

// Keep a single running instance so a second double-click reuses this window
// instead of spawning a new process (Windows/Linux). macOS is single-instance
// by default and delivers files through the 'open-file' event instead.
const gotTheLock = app.requestSingleInstanceLock()
if (!gotTheLock) {
  app.quit()
} else {
  // Fired in the primary instance when a second instance is launched — e.g. the
  // user double-clicked a .ggc file while the app was already running. The new
  // process's argv carries the file path.
  app.on('second-instance', (_event, argv) => {
    openCircuitFile(getFilePathFromArgv(argv))
    if (mainWindow) {
      if (mainWindow.isMinimized()) mainWindow.restore()
      mainWindow.focus()
    }
  })

  // macOS: capture double-click open-file events
  app.on('open-file', (event, filePath) => {
    event.preventDefault()
    openCircuitFile(filePath)
  })

  app.whenReady().then(() => {
    // Windows/Linux cold start: the double-clicked file is on our command line.
    if (process.platform !== 'darwin' && !pendingFilePath) {
      pendingFilePath = getFilePathFromArgv(process.argv)
    }
    createWindow()
  })

  app.on('activate', () => {
    if (mainWindow === null) createWindow()
  })

  app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') app.quit()
  })
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 800,
    icon: path.join(__dirname, 'assets/icon.icns'),
    webPreferences: {
      preload: path.join(__dirname, 'preload.cjs')
    }
  })
  mainWindow.loadFile('dist/index.html')

  // Once renderer is ready, send any queued file
  mainWindow.webContents.on('did-finish-load', () => {
    if (pendingFilePath) {
      const filePath = pendingFilePath
      pendingFilePath = null
      openCircuitFile(filePath)
    }
  })

  // Clear the reference when the window is closed so open-file doesn't
  // try to use a destroyed webContents
  mainWindow.on('closed', () => {
    mainWindow = null
  })
}


// Save circuit to disk
ipcMain.handle('save-circuit', async (event, { content, defaultName }) => {
  const { filePath } = await dialog.showSaveDialog({
    defaultPath: defaultName,
    filters: [{ name: 'Golden Gates Circuit', extensions: ['ggc'] }]
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
