const { ipcRenderer } = require('electron');

function uploadData() {
    var data = {
        "desc": document.getElementById("desc").value,
        "link": document.getElementById("link").value,
        "time": document.getElementById("time").value,
    }
    ipcRenderer.send('newData', JSON.stringify(data));

    getDataAndWriteDocument();
}