function removeData(id) {
    console.log(id)
    ipcRenderer.send('deleteData', id)
    getDataAndWriteDocument()
}