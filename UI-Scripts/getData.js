// Onload getDataandWriteDocument
window.onload = getDataAndWriteDocument;

function getDataAndWriteDocument() {
    ipcRenderer.send('getData');
    ipcRenderer.on('getData', (event, arg) => {

        let data = JSON.parse(arg);
        document.getElementById('data').innerHTML = "";
        for (const id in data) {
            console.log(id)
            document.getElementById('data').innerHTML += `
            <tr>
                <td>
                    <img src="./Assets/remove.png" height="50" onclick="removeData('${id}')"/>
                </td>
                <td>
                    ${data[id]["desc"]}
                </td>
                <td>
                    ${data[id]["link"]}
                </td>
                <td>
                    ${data[id]["time"]}
                </td>
            </tr>`;
        }
    });
}

