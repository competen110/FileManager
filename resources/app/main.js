const electron = require('electron');
const app = electron.app;
const BrowserWindow = electron.BrowserWindow;
const ipcMain = electron.ipcMain;
const shell = electron.shell;
const dialog = electron.dialog;

const path = require('path');
const url = require('url');

var nameWindow = null;   //新建项目标题窗口
var mainWindow = null;   //app主页
var moveWindow = null;   //移动文件选择项目的窗口
var encryptWindow = null;  //输入加密密码的窗口

function createWindow (options,filename) {
  // Create the browser window.
  var win = new BrowserWindow(options);

  win.loadURL(url.format({
    pathname: path.join(__dirname, filename),
    protocol: 'file:',
    slashes: true,
    show:false
  }));

  win.webContents.on("did-finish-load",function(){
      win.show();
  });
  // Open the DevTools.
  //win.webContents.openDevTools();
  // Emitted when the window is closed.
  win.on('closed', function () {
    win = null;
  });

  return win;

}

app.on('ready', function(){
  mainWindow = createWindow({width: 1000, height: 680},"index.html");
});
app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') {
    app.quit()
  }
});
app.on('activate', function () {
  if (mainWindow === null) {
    mainWindow = createWindow();
  }
});

//新建项目事件
ipcMain.on("new-project",function(event,arg){
    nameWindow = createWindow({width: 400, height: 200,maximizable:false},"new_project.html");
    nameWindow.focus();
    nameWindow.setAlwaysOnTop(true);
});
ipcMain.on("project-name",function(event,arg){
    console.log(arg);
    mainWindow.webContents.send("project-dom",arg);
    nameWindow.close();
});

//以默认的方式打开文件
ipcMain.on("open-file",function(event,arg){
  if(arg){
    shell.openItem(arg);
  }else{
    console.log("error");
  }
});


//文件夹选择框
ipcMain.on("add-file-open",function(event,arg){
  console.log(arg);

  dialog.showOpenDialog({
                          title:"请选择要导入的文件夹",
                         properties: [ 'openFile']
                      },function(res){
                          if(res){
                            console.log(res+"hhaa");
                            event.returnValue=res;
                            console.log();
                          }else{
                            event.returnValue = "equit";
                            console.log("quit");
                          }
                      });
});

//移动项目时选择项目时的窗口
ipcMain.on("move-project-open",function(event,arg){
    moveWindow = createWindow({width: 310, height: 395,maximizable:false},"move_project.html");
    moveWindow.focus();
    moveWindow.setAlwaysOnTop(true);
});
ipcMain.on("move-project-close",function(event,arg){
    console.log("move-project-close");
    mainWindow.webContents.send("move-project",arg);
    moveWindow.close();
});

//加密文件时输入密码的窗口
ipcMain.on("encrypt-project-open",function(event,arg){
    encryptWindow = createWindow({width: 400, height: 200,maximizable:false},"encrypt_project.html");
    encryptWindow.focus();
    encryptWindow.setAlwaysOnTop(true);
});
ipcMain.on("encrypt-project-close",function(event,arg){
    mainWindow.webContents.send("encrypt-project",arg);
    console.log(arg);
    encryptWindow.close();
});

