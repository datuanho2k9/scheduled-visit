const { BrowserWindow, app, ipcMain, Tray, Menu } = require('electron')
const fs = require('fs')
const uuid = require('uuid')

let openedWin = false;
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
        let currentData = JSON.parse(fs.readFileSync('data.json', 'utf8'))
        var newData = JSON.parse(arg)
        currentData[uuid.v4()] = newData;
        fs.writeFileSync('data.json', JSON.stringify(currentData, null, "\t"));
    })
    ipcMain.on('deleteData', (event, arg) => {
        // Delete the data from data.json
        // Send the deleted id to the main process
        let currentData = JSON.parse(fs.readFileSync('data.json', 'utf8'))
        delete currentData[arg];
        fs.writeFileSync('data.json', JSON.stringify(currentData));
    })
    ipcMain.on('getData', (event, arg) => {
        // Send the data got from the data.json to the render process
        let currentData = JSON.parse(fs.readFileSync('data.json', 'utf8'))
        event.sender.send('getData', JSON.stringify(currentData));
    })
    win.on('close', () => {
        openedWin = false;
    })
}
function getCurrentTime() {
    return new Date().toLocaleTimeString('en-US', { hour12: false }).slice(0, 5)
}

// Loop through all the data in the data.json file with the time property if it is equal to the getCurrentTime() then open property link with the default browser
function main() {
    let currentData = JSON.parse(fs.readFileSync('data.json', 'utf8'))
    for (var key in currentData) {
        if (currentData[key].time == getCurrentTime()) {
            require('electron').shell.openExternal(currentData[key].link)
        }
    }
}
// Make a timer with setInterval
setInterval(() => {
    main()
}, 60000)

// Create a system tray has an action to call newWin()
function createTray() {
    const tray = new Tray('Assets/tray.png')
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
    createTray()
})


app.on('window-all-closed', () => {
    console.log("Background mode")
})