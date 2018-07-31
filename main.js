const {
    app,
    BrowserWindow,
    ipcMain
} = require('electron')

const url = require('url');
const path = require('path')
let mainWindow = null

function createWindow() {
    // Initialize the window to our specified dimensions
    mainWindow = new BrowserWindow({
        width: 1600,
        height: 900,
        backgroundColor: '#000',
        enableLargerThanScreen: true,
        show: true,
        icon: __dirname + './favicon.icns',
        fullscreenable: true,
        fullscreen: true,
        title: "Siren"
    })
    // app.setAboutPanelOptions({
    //     applicationName: "Siren",
    //     applicationVersion: "0.6.0"
    //   })

    //mainWindow.setMenu(null);

    // Specify entry point
    // const startUrl = process.env.ELECTRON_START_URL || url.format({
    //     pathname: path.join(__dirname, '/server/build/index.html'),
    //     protocol: 'file:',
    //     slashes: true
    // });

    //mainWindow.loadURL(startUrl);
    mainWindow.loadURL('http://localhost:3000/#/')

    // Show dev tools
    // Remove this line before distributing
    // mainWindow.webContents.openDevTools()


    // Remove window once app is closed
    mainWindow.on('closed', function () {
        if (process.platform !== 'darwin') {
            app.quit();
            mainWindow = null
        }

    })

    // mainWindow.webContents.executeJavaScript(`
    // var path = require('path');
    // module.paths.push(path.resolve('node_modules'));
    // module.paths.push(path.resolve('../node_modules'));
    // module.paths.push(path.resolve(__dirname, '..', '..', 'electron', 'node_modules'));
    // module.paths.push(path.resolve(__dirname, '..', '..', 'electron.asar', 'node_modules'));
    // module.paths.push(path.resolve(__dirname, '..', '..', 'app', 'node_modules'));
    // module.paths.push(path.resolve(__dirname, '..', '..', 'app.asar', 'node_modules'));
    // path = undefined;
    // `);
}

app.on('ready', function () {
    createWindow()
    mainWindow.setMenu(null);
})

app.on('activate', () => {
    if (mainWindow === null) {
        createWindow()
    }
})

app.on('window-all-closed', function () {
    if (process.platform !== 'darwin') {
        app.quit()
    }
})