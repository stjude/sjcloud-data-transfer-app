/**
 * @fileOverview Handles the custom sjcloud:// URI protocol. The only systems this is supported on are Windows and Mac.
*/
const os = require("os");
const electron = require("electron");
const app = electron.app;

app.setAsDefaultProtocolClient("sjcloud");

/**
 *
 * Windows protocol handler
 *
 * URLs are passed to the program as arguments on Windows machines.
 * The first argument passed to the program is always the name of the program.
 * The URL which called the app is then passed as the next arguments.
 * URLs with spaces are passed as multiple arguments, so they must be concatenated.
 **/
const platform = os.platform();
let cmd = "";

if (platform == "win32") {
  args = process.argv.slice(1);
  if (args[0] && args[0].search("sjcloud://") != -1) { // app called by sjcloud:// URI
    project_name = args[0].replace("sjcloud://", "");
    for (i = 1; i < args.length; i++) { // Concatenate project names with spaces
      project_name = project_name + " " + args[i];
    }
    if (project_name.slice(-1) == "/") {
      project_name = project_name.substring(0, project_name.length - 1); // remove trailing '/'
    }
    project_name = decodeURIComponent(project_name);
    cmd = `window.VueApp.$store.commit('setURIProject', '${project_name}');`;
  } else {
    cmd = "window.VueApp.$store.commit('setURIProject', '');";
  }
  module.exports.setURIprojectCmd = cmd;
}
/**
 * Mac protocol handler
 *
 * On Mac, the url which called the app is passed as a string through the
 * app.on("open-url") event.
 **/
app.on("open-url", (event, url) => {
  event.preventDefault();
  if (url && url.search("sjcloud://") != -1) { // app called by sjcloud:// URI
    project_name = url.replace("sjcloud://", "");
    if (project_name.slice(-1) == "/") {
      project_name = project_name.substring(0, project_name.length - 1); // remove trailing '/'
    }
    project_name = decodeURIComponent(project_name);
    cmd = `window.VueApp.$store.commit('setURIProject', '${project_name}');`;
  } else {
    cmd = "window.VueApp.$store.commit('setURIProject', '');";
  }
  mainWindow.webContents.executeJavaScript(cmd);
});
