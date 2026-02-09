const { app, BrowserWindow } = require('electron');
const path = require('path');

function createWindow() {
  const win = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
    },
    title: "SpecsBiz | Smart Business Manager"
  });

  // This loads the static exported files from Next.js
  const indexPath = path.join(__dirname, '../../out/index.html');
  win.loadFile(indexPath).catch(() => {
    // Fallback if the file isn't found (helpful during dev setup)
    console.log("Static files not found. Make sure to run 'npm run build' first.");
  });
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow();
});
