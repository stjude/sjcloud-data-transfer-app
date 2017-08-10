const {BrowserWindow} = require('electron').remote;

$('#next-btn').on('click', function (e) {
	e.preventDefault();
	BrowserWindow.getFocusedWindow().refreshState()
});
