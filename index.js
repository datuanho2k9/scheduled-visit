const { BrowserWindow, app, ipcMain, Tray, Menu } = require('electron')
const fs = require('fs')
const uuid = require('uuid')
const path = require('path')

const dataPath = path.join(__dirname, 'data.json')
let openedWin = false;
console.log(dataPath)
function newWin() {
    openedWin = true;
    const win = new BrowserWindow({
        width: 800,
        height: 600,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false,
        }
    })
    win.loadFile('index.html')
    ipcMain.on('newData', (event, arg) => {
        // Expected data is in the format of {name: '', time: '', date: ''} which is sent in string
        // Convert to JSON object
        // Send the new data to the main process
        let currentData = JSON.parse(fs.readFileSync(dataPath, 'utf8'))
        var newData = JSON.parse(arg)
        currentData[uuid.v4()] = newData;
        // Join path for dataPath and write that path with strinified currentData with "\t" argument



        fs.writeFileSync(dataPath, JSON.stringify(currentData, null, "\t"));
    })
    ipcMain.on('deleteData', (event, arg) => {
        // Delete the data from dataPath
        // Send the deleted id to the main process
        let currentData = JSON.parse(fs.readFileSync(dataPath, 'utf8'))
        delete currentData[arg];
        fs.writeFileSync(dataPath, JSON.stringify(currentData));
    })
    ipcMain.on('getData', (event, arg) => {
        // Send the data got from the dataPath to the render process
        let currentData = JSON.parse(fs.readFileSync(dataPath, 'utf8'))
        event.sender.send('getData', JSON.stringify(currentData));
    })
    win.on('close', () => {
        openedWin = false;
    })
}
function getCurrentTime() {
    return new Date().toLocaleTimeString('en-US', { hour12: false }).slice(0, 5)
}

// Loop through all the data in the dataPath file with the time property if it is equal to the getCurrentTime() then open property link with the default browser
function main() {
    let currentData = JSON.parse(fs.readFileSync(dataPath, 'utf8'))
    for (var key in currentData) {
        if (currentData[key].time == getCurrentTime()) {
            require('electron').shell.openExternal(currentData[key].link)
        }
    }
}
// Make a timer with setInterval

// Create a system tray has an action to call newWin()
function createTray() {
    const trayIcon = path.join(__dirname, 'Assets', 'tray.png')
    const tray = new Tray(trayIcon)
    const contextMenu = Menu.buildFromTemplate([
        {
            label: 'Open',
            click: () => {
                if (openedWin == false) {
                    newWin()
                }
            }
        },
        {
            label: 'Quit',
            click: () => {
                app.quit()
            }
        }
    ])
    tray.setToolTip('Project')
    tray.setContextMenu(contextMenu)
}

app.whenReady().then(() => {
    main()
    createTray()
    setInterval(() => {
        main()
    }, 31000)

})


app.on('window-all-closed', () => {
    console.log("Background mode")
})