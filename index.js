const { app, BrowserWindow, ipcMain, Tray, nativeImage, Menu, globalShortcut, Notification } = require('electron')

var win = null
var tray = null
var about = null
var repo = require("./package.json").repository.url
const path = require("path")
var resized = false
var ipc = true
var enableddevmode = false
var fs = require('fs');
var json = null
var devtools = false
var reloading = false
var devshort = false



const createWindow = () => {
    win = new BrowserWindow({
        width: 800,
        height: 55,
        maximizable: false,
        frame: false,
        fullscreenable: false,
        resizable: false,
        title: "MusicClap",
        webPreferences: {
            preload: path.join(__dirname, '/src/preload.js'),
            nodeIntegration: false,
            enableRemoteModule: false,
            contextIsolation: true,
            sandbox: true,
            // nativeWindowOpen: true,
        },
        icon: path.join(__dirname, '/src/data/MusicClap.png')
    })

    about = new BrowserWindow({
        title: "MusicClap - About",
        width: 400,
        height: 230,
        maximizable: false,
        frame: false,
        fullscreenable: false,
        resizable: false,
        webPreferences: {
            preload: path.join(__dirname, '/src/preload.js'),
            nodeIntegration: false,
            enableRemoteModule: false,
            contextIsolation: true,
            sandbox: true,
            // nativeWindowOpen: true,
        },
        icon: path.join(__dirname, '/src/data/MusicClap.png')
    })
    settings = new BrowserWindow({
        title: "MusicClap - Settings",
        width: 800,
        height: 600,
        maximizable: false,
        frame: false,
        fullscreenable: false,
        resizable: false,
        webPreferences: {
            preload: path.join(__dirname, '/src/preload.js'),
            nodeIntegration: false,
            enableRemoteModule: false,
            contextIsolation: true,
            sandbox: true,
            // nativeWindowOpen: true,
        },
        icon: path.join(__dirname, '/src/data/MusicClap.png')
    })
    settings.hide()
    settings.loadFile(path.join(__dirname, '/src/settings.html'))
    win.loadFile(path.join(__dirname, '/src/index.html'))
    about.hide()
    about.loadURL(path.join(__dirname, '/src/about.html'))
    tray = new Tray(nativeImage.createEmpty());

    const handleRedirect = (e, url) => {
        if (url !== e.sender.getURL()) {
            e.preventDefault()
            shell.openExternal(url)
            print("yes")
        }
    }
    about.webContents.on('will-navigate', handleRedirect)
    refreshTray()
    tray.setImage(path.join(__dirname, "/src/data/MusicClap.png"))
    
}

function closeWindow() {
    if (ipc) {
        if (json.littlesettings.notficlose == true) {
            json.littlesettings.notficlose = false
            new Notification({ title: "Wait!", body: "MusicClap is still running in the background.", icon: path.join(__dirname, "/src/data/MusicClap.png"), image: path.join(__dirname, "/src/data/MusicClap.png"), appName: "MusicClap" })
        }
        updateSettings()
        win.hide()

    }

}

function openSettings() {
    if (ipc) {
        settings.show()
    }
}

function refreshTray() {
    const menu = Menu.buildFromTemplate([
        {
            label: "Developer",
            enabled: enableddevmode,
            submenu: [
                {
                    label: "Toggle DevTools",
                    click: (item, window, event) => {
                        if (devtools == false) {
                            win.webContents.openDevTools();
                            about.webContents.openDevTools();
                            settings.webContents.closeDevTools();
                            devtools = true
                        } else {
                            win.webContents.closeDevTools();
                            about.webContents.closeDevTools();
                            settings.webContents.closeDevTools();
                            devtools = false
                        }

                    }
                },
                {
                    label: "Toggle Resizable",
                    click: (item, window, event) => {
                        if (resized == false) {
                            resized = true
                            win.resizable = true
                            about.resizable = true
                            settings.resizable = true
                        } else {
                            resized = false
                            win.resizable = false
                            about.resizable = false
                            settings.resizable = false
                        }
                    }
                },
                {
                    type: "separator"
                },
                {
                    label: "Toggle IPC",
                    click: (item, window, event) => {
                        if (ipc == false) {
                            ipc = true

                        } else {
                            ipc = false

                        }
                    }
                },

                {
                    label: "Send Example Notifcaction",
                    click: (item, window, event) => {
                        new Notification({ title: "Hello", body: "Developer" }).show()
                    }
                },

                {
                    type: "separator"
                },
                {
                    label: "Toggle Reload Keybinds",
                    click: (item, window, event) => {                    
                        reloading = !reloading;

                        if (reloading == true) {
                            globalShortcut.unregister('CommandOrControl+R');
                            globalShortcut.unregister('F5');
                        } else {
                            globalShortcut.register("CommandOrControl+R", () => {
                                console.log("CommandOrControl+R is pressed: Shortcut Disabled");
                            });
                            globalShortcut.register("F5", () => {
                                console.log("F5 is pressed: Shortcut Disabled");
                            }); 
                        }
                    }
                },
                {
                    label: "Toggle Inspect Keybinds",
                    click: (item, window, event) => {                    
                        devshort = !devshort;

                        if (devshort == true) {
                            globalShortcut.unregister('CommandOrControl+I');
                        } else {
                            globalShortcut.register("CommandOrControl+Shift+I", () => {
                                console.log("Inspect Element is pressed: Shortcut Disabled");
                            });
                        }
                    }
                }

            ]
        },
        {
            label: "Open",
            accelerator: "CommandOrControl+Shift+A",
            click: (item, window, event) => {
                win.show()
            }
        },
        {
            type: "separator"
        },
        {
            label: "Open Settings",
            click: (item, window, event) => {
                settings.show()
            }
        },
        {
            type: "separator"
        },
        {
            label: `MusicClap v${app.getVersion()}`,
            enabled: false
        },
        {
            label: 'About MusicClap',
            click: (item, window, event) => {
                about.show()
            }
        },
        {
            type: "separator"
        },
        {
            role: "quit"
        }, // "role": system prepared action menu
    ]);
    tray.setContextMenu(menu);
}

function closeWindowB() {
    if (ipc) {
        
        about.hide()
        console.log(win.isVisible())
    }
}

function closeWindowC() {
    if (ipc) {
        settings.hide()
    }
}


function openGitHub() {
    if (ipc) {
        require('electron').shell.openExternal(repo);
    }

}

function updateSettings() {
    var everything = JSON.stringify(json)
    fs.writeFileSync("./settings.json", everything)
}

function enableDevMode(e, how) {
    if (ipc) {
        enableddevmode = how
        refreshTray()
    }
    
}

app.on('browser-window-focus', function () {
    if (reloading == false) {
        globalShortcut.register("CommandOrControl+R", () => {
            
        });
        globalShortcut.register("F5", () => {
            
        });    
    }
    if (devshort == false) {
        globalShortcut.register("CommandOrControl+Shift+I", () => {
           
        });
    }
    
});

app.on('browser-window-blur', function () {
    globalShortcut.unregister('CommandOrControl+R');
    globalShortcut.unregister('F5');
    globalShortcut.unregister('CommandOrControl+Shift+I');
});

app.whenReady().then(() => {
    fs.readFile('./settings.json', 'utf8', function (err, data) {
        if (err) throw err; // we'll not consider error handling for now
        json = JSON.parse(data);
        enableddevmode = json.config.devMode
        refreshTray()
    });
    
    ipcMain.on("close", closeWindow)
    ipcMain.on("closeB", closeWindowB)
    ipcMain.on("closeC", closeWindowC)
    ipcMain.on("openSettings", openSettings)
    ipcMain.on("openGitHubPage", openGitHub)
    ipcMain.on("devMode", enableDevMode)
    createWindow()

    globalShortcut.register('CommandOrControl+Shift+A', () => {
        
        win.show()
    })
})

app.addListener('before-quit', () => {
    json.config.devMode = enableddevmode

    updateSettings()
})