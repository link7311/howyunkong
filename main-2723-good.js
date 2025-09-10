//注意這個程式所有螢幕要 100%系統比例 不能200 不能125 比例會計算錯
//任何一台螢幕比例都要100%


const { app, BrowserWindow, screen } = require('electron');

function pickBottomRowTwo(displays) {
  // 1) 找出所有螢幕中「最靠下」的那一排（y 最大）
  const bottomY = Math.max(...displays.map(d => d.bounds.y));
  // 容忍上下有些微不齊（±32px）
  const row = displays.filter(d => Math.abs(d.bounds.y - bottomY) <= 32);

  // 若抓不到兩個，就取 y 最大的兩個做保險
  if (row.length < 2) {
    return [...displays].sort((a, b) => (a.bounds.y - b.bounds.y) || (a.bounds.x - b.bounds.x)).slice(-2);
  }
  // 2) 依 x 由左到右排序 → 變成 [螢幕3, 螢幕2]
  return row.sort((a, b) => a.bounds.x - b.bounds.x);
}

function create() {
  const displays = screen.getAllDisplays();
  const pair = pickBottomRowTwo(displays); // 這裡就是你要的 3 + 2

  // 外接矩形（把兩個螢幕包起來）
  const minX = Math.min(...pair.map(d => d.bounds.x));
  const minY = Math.min(...pair.map(d => d.bounds.y));
  const maxX = Math.max(...pair.map(d => d.bounds.x + d.bounds.width));
  const maxY = Math.max(...pair.map(d => d.bounds.y + d.bounds.height));

  const win = new BrowserWindow({
    x: minX,   //388
    y: minY,   //2160
    //width: maxX - minX,   // 理論上 1366+1366 = 2732
    width : 2732,
    //height: maxY - minY,  // 768
    height : 768,
    frame: false,
    resizable: false,
    backgroundColor: '#000000',
    skipTaskbar: true,
    autoHideMenuBar: true
  });

  // 置頂，通常可壓過工作列
  win.setAlwaysOnTop(true, 'screen-saver');

  //win.loadFile('nocan-2732.html');
  win.loadFile('index.html');
}

app.whenReady().then(create);
app.on('window-all-closed', () => app.quit());
