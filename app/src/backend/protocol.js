/**
 * @fileOverview Handles the custom sjcloud:// URI protocol. The only systems this is supported on are Windows and Mac.
 */

const os = require("os");
const electron = require("electron");
const app = electron.app;

const {logging} = require("./logging");
app.setAsDefaultProtocolClient("sjcloud");

/**
 * @param {string} uri uri passed into the program.
 * @return {String} Command to be run in the remote javascript runtime.
 */
function handleURI(uri) {
  if (uri && uri.search("sjcloud://") != -1) {
    logging.info("Handling custom URI:", uri);
    projectName = uri.replace("sjcloud://", "");

    // remove ending slash.
    if (projectName.slice(-1) === "/") {
      projectName = projectName.substring(0, projectName.length - 1);
    }

    projectName = decodeURIComponent(projectName);
    cmd = `window.uriProject = '${projectName}';`;
  } else {
    cmd = "";
  }

  return cmd;
}

/**
 *
 * Windows protocol handler
 *
 * URLs are passed to the program as arguments on Windows machines.
 * The first argument passed to the program is always the name of the program.
 * The URL which called the app is then passed as the next arguments.
 * URLs with spaces are passed as multiple arguments, so they must be concatenated.
 *
 * @return {String} Command to be run in the remote javascript runtime.
 **/
module.exports.handleURIWindows = () => {
  args = process.argv.slice(1);
  return handleURI(args[0]);
};

/**
 * Mac protocol handler
 *
 * On Mac, the uri which called the app is passed as a string through the
 * app.on("open-uri") event.
 *
 * @param {Event} event the event object passed to the event handler.
 * @param {String} uri the uri passed to the event handler.
 * @return {String} Command to be run in the remote javascript runtime.
 */
module.exports.handleURIMac = (event, uri) => {
  if (event) {
    event.preventDefault();
  }

  return handleURI(uri);
};
