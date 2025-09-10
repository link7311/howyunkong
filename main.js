// main.js
const { app, BrowserWindow, screen, globalShortcut } = require('electron');

const DESIRED_WIDTH  = 1440;
const DESIRED_HEIGHT = 1920;

app.commandLine.appendSwitch('high-dpi-support', '1');
app.commandLine.appendSwitch('force-device-scale-factor', '1');
app.commandLine.appendSwitch('disable-features', 'CalculateNativeWinOcclusion');
webPreferences: { zoomFactor: 1.0, backgroundThrottling: false }


// === 單例鎖，避免開多個實例 ===
if (!app.requestSingleInstanceLock()) {
  app.quit();
  process.exit(0);
}

let mainWindow = null; // 保存視窗引用

// 如果用戶再啟動一次，聚焦到原本的視窗
app.on('second-instance', () => {
  console.log('[INFO] 已有一個實例正在執行，忽略新的啟動請求。');
  if (mainWindow) {
    if (mainWindow.isMinimized()) mainWindow.restore();
    mainWindow.focus();
  }
});

function tallDisplays() {
  return screen.getAllDisplays().filter(d => d.bounds.height >= 1920);
}

function pickStartDisplay() {
  const tall = tallDisplays().sort((a, b) => a.bounds.x - b.bounds.x);
  return tall[0] || null;
}

function pickNextRightOf(start) {
  if (!start) return null;
  const tall = tallDisplays().sort((a, b) => a.bounds.x - b.bounds.x);
  const idx = tall.findIndex(d => d.id === start.id);
  return tall[idx + 1] || null;
}

function create() {
  const d1 = pickStartDisplay();
  if (!d1) {
    const fb = screen.getAllDisplays().sort((a,b)=>b.bounds.width-a.bounds.width)[0];
    return openSpanning(fb, null, null);
  }
  const d2 = pickNextRightOf(d1);
  const d3 = pickNextRightOf(d2);
  openSpanning(d1, d2, d3);
}

function openSpanning(d1, d2, d3) {
  const displays = [d1, d2, d3].filter(Boolean);
  const minY = Math.min(...displays.map(d => d.bounds.y));

  const totalWidth  = DESIRED_WIDTH * displays.length;
  const totalHeight = DESIRED_HEIGHT;

  const win = new BrowserWindow({
    x: d1.bounds.x,
    y: minY,
    width: 400,
    height: 300,
    show: false,
    frame: false,
    resizable: false,
    useContentSize: true,
    backgroundColor: '#000000',
    skipTaskbar: true,
    autoHideMenuBar: true,
    movable: false,
    fullscreenable: false,
    enableLargerThanScreen: true,
    webPreferences: { zoomFactor: 1.0 }
  });

  mainWindow = win; // 保存視窗引用

  win.webContents.setVisualZoomLevelLimits(1, 1);
  win.on('will-resize', e => e.preventDefault());

  win.setAlwaysOnTop(true, 'screen-saver');
  win.setVisibleOnAllWorkspaces(true, { visibleOnFullScreen: true });
  if (typeof win.moveTop === 'function') win.moveTop();

  win.loadFile('tiger_V1_1.html');

  win.webContents.once('did-finish-load', () => {
    win.setBounds({
      x: d1.bounds.x,
      y: minY,
      width: totalWidth,
      height: totalHeight
    });
    win.setContentSize(totalWidth, totalHeight);
    win.show();
  });
}

app.whenReady().then(() => {
  globalShortcut.register('F4', () => {
    app.quit();
  });

  globalShortcut.register('F5', () => {
    app.relaunch();
    app.exit(0);
  });

  create();

  screen.on('display-metrics-changed', () => {
    app.relaunch();
    app.exit(0);
  });
});

app.on('will-quit', () => {
  globalShortcut.unregisterAll();
});

app.on('window-all-closed', () => app.quit());
