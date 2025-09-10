// main.js
const { app, BrowserWindow, screen } = require('electron');

// 想覆蓋哪兩個螢幕：'RIGHT_TWO' | 'LEFT_TWO' | 'OUTER_TWO'
const MODE = 'OUTER_TWO'; // 1+2 用 RIGHT_TWO；3+2 用 OUTER_TWO

function pickDisplays(displays) {
  const sorted = [...displays].sort((a, b) => a.bounds.x - b.bounds.x);
  if (sorted.length < 2) return sorted;

  switch (MODE) {
    case 'LEFT_TWO':   // 取最左兩個（例如 3+1）
      return sorted.slice(0, 2);
    case 'OUTER_TWO':  // 取最外側兩個（例如 3+2，跳過中間）
      return [sorted[0], sorted[sorted.length - 1]]; // ← 這裡是 ]]
    case 'RIGHT_TWO':  // 預設：取最右兩個（例如 1+2）
    default:
      return sorted.slice(-2);
  }
}

function create() {
  const displays = screen.getAllDisplays();
  const target = pickDisplays(displays);

  // 以 bounds 計算外接矩形
  const minX = Math.min(...target.map(d => d.bounds.x));
  const minY = Math.min(...target.map(d => d.bounds.y));
  const maxX = Math.max(...target.map(d => d.bounds.x + d.bounds.width));
  const maxY = Math.max(...target.map(d => d.bounds.y + d.bounds.height));

  const win = new BrowserWindow({
    x: minX,
    y: minY,
    width: maxX - minX,
    height: maxY - minY,
    frame: false,
    resizable: false,
    backgroundColor: '#000000',
    skipTaskbar: true,
    autoHideMenuBar: true
  });

  win.setAlwaysOnTop(true, 'screen-saver');
  win.loadFile('index.html');
}

app.whenReady().then(create);
app.on('window-all-closed', () => app.quit());
