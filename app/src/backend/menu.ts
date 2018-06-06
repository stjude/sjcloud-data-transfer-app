/**
 * @module menu
 * @description Menu configuration for the Electron application.
 */

import { app } from 'electron';

import { logging } from './logging';

logging.info('   [*] Setting application menu...');

export const menuConfig = [
  {
    label: 'SJCPUploader',
    submenu: [
      {
        label: 'About SJCPUploader',
        selector: 'orderFrontStandardAboutPanel:',
      },
      { type: 'separator' },
      {
        label: 'Quit',
        accelerator: 'Command+Q',
        click: () => {
          app.quit();
        },
      },
    ],
  },
  {
    label: 'Edit',
    submenu: [
      {
        role: 'undo',
      },
      {
        role: 'redo',
      },
      {
        type: 'separator',
      },
      {
        role: 'cut',
      },
      {
        role: 'copy',
      },
      {
        role: 'paste',
      },
      {
        role: 'selectall',
      },
    ],
  },
];
