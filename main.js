// main.js
const { app, BrowserWindow, screen, globalShortcut } = require('electron');

const DESIRED_WIDTH  = 1440;
const DESIRED_HEIGHT = 1920;

// DPI/縮放設定
app.commandLine.appendSwitch('high-dpi-support', '1');
app.commandLine.appendSwitch('force-device-scale-factor', '1');

// ⚠️ 重要：停用原生遮擋偵測，避免跨多螢幕的大視窗被誤判成離屏而不重繪
app.commandLine.appendSwitch('disable-features', 'CalculateNativeWinOcclusion');

// 若想驗證是否為 GPU 管線問題，可暫時開啟下行（效能會降）：
// app.disableHardwareAcceleration();

// === 單例鎖：確保只啟動一個實例 ===
if (!app.requestSingleInstanceLock()) {
  app.quit();
  process.exit(0);
}

let mainWindow = null;
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

// 找「最左邊的直立螢幕」當作螢幕 1
function pickStartDisplay() {
  const tall = tallDisplays().sort((a, b) => a.bounds.x - b.bounds.x);
  return tall[0] || null;
}

// 往右找下一個直立螢幕
function pickNextRightOf(start) {
  if (!start) return null;
  const tall = tallDisplays().sort((a, b) => a.bounds.x - b.bounds.x);
  const idx = tall.findIndex(d => d.id === start.id);
  return tall[idx + 1] || null;
}

function create() {
  const d1 = pickStartDisplay();   // 螢幕 1（最左）
  if (!d1) {
    // 沒有直立螢幕時，退而求其次用最寬的螢幕
    const fb = screen.getAllDisplays().sort((a,b)=>b.bounds.width-a.bounds.width)[0];
    return openSpanning(fb, null, null);
  }
  const d2 = pickNextRightOf(d1);  // 螢幕 2
  const d3 = pickNextRightOf(d2);  // 螢幕 3
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
    height: 300,              // 先小，載入後再調整
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
    webPreferences: {
      zoomFactor: 1.0,
      backgroundThrottling: false // 背景不節流（跨螢幕時避免被暫停）
    }
  });

  mainWindow = win;

  // 禁止縮放與調整
  win.webContents.setVisualZoomLevelLimits(1, 1);
  win.on('will-resize', e => e.preventDefault());

  // 保持最上層（如需弱一點可改成 'normal' 或 setAlwaysOnTop(false)）
  win.setAlwaysOnTop(true, 'screen-saver');
  win.setVisibleOnAllWorkspaces(true, { visibleOnFullScreen: true });
  if (typeof win.moveTop === 'function') win.moveTop();

  // 你的內容頁
  win.loadFile('tiger_V1_1.html');

  // 內容載入完成後，拉到 1→2→3 的總寬
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
  // F4 一鍵關閉整個程式
  globalShortcut.register('F4', () => app.quit());

  // F5 一鍵重啟程式
  globalShortcut.register('F5', () => {
    app.relaunch();
    app.exit(0);
  });

  create();

  // 顯示器配置變化時自動重啟
  screen.on('display-metrics-changed', () => {
    app.relaunch();
    app.exit(0);
  });
});

app.on('will-quit', () => {
  globalShortcut.unregisterAll();
});

app.on('window-all-closed', () => app.quit());
