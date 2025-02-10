import { app, BrowserWindow } from 'electron';
import path from 'path';

function createWindow() {
  const win = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      webSecurity: false, // Only during development
      devTools: process.env.NODE_ENV === 'development'
    }
  });

  // In development, load from the Vite dev server
  if (process.env.NODE_ENV === 'development') {
    win.loadURL('http://localhost:5173');
    win.webContents.openDevTools();
  } else {
    // In production, load from the built files
    const indexPath = path.join(__dirname, '../dist/index.html');
    // Use file protocol
    win.loadFile(indexPath);
  }

  // Enable hot reload in development
  if (process.env.NODE_ENV === 'development') {
    win.webContents.on('did-fail-load', () => {
      win.loadURL('http://localhost:5173');
    });
  }
}

app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
}); 