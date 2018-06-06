/**
 * @module protocol
 * @description Handles the custom sjcloud:// URI protocol. The only systems
 *   this is supported on are Windows and Mac.
 */

import * as Electron from 'electron';

import * as env from './env';
import { logging } from './logging';

if (!env.isTesting()) {
  const app = require('electron').app;
  logging.info('   [*] Registering protocols...');
  app.setAsDefaultProtocolClient('sjcloud');
}

/**
 * @param uri uri passed into the program.
 * @returns Command to be run in the remote javascript runtime.
 */
export function handleURI(uri: string): string {
  if (uri && uri.search('sjcloud://') != -1) {
    logging.debug('  [*] Handling custom URI:', uri);
    let projectName = uri.replace('sjcloud://', '');

    // remove ending slash.
    if (projectName.slice(-1) === '/') {
      projectName = projectName.substring(0, projectName.length - 1);
    }

    projectName = decodeURIComponent(projectName);
    return `window.uriProject = '${projectName}';`;
  }

  return '';
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
 * @returns Command to be run in the remote javascript runtime.
 **/
export function handleURIWindows(): string {
  let args = process.argv.slice(1);
  let i: number;
  let project_name = '';

  // Concatenate project names with spaces
  for (i = 1; i < args.length; i++) {
    project_name = project_name + ' ' + args[i];
  }

  return handleURI(project_name);
}

/**
 * Mac protocol handler
 *
 * On Mac, the uri which called the app is passed as a string through the
 * app.on("open-uri") event.
 *
 * @param event the event object passed to the event handler.
 * @param uri the uri passed to the event handler.
 * @return Command to be run in the remote javascript runtime.
 */
export function handleURIMac(event: Electron.Event, uri: string): string {
  if (event) {
    event.preventDefault();
  }

  return handleURI(uri);
}
