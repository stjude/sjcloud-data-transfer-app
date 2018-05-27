/**
 * @module queue
 * @description Customized queue functionality to multiplex tasks across the
 * concurrency level specified by the user and rank them based on priority.
 *
 * @author Clay McLeod
 */

import * as _async from 'async';
import * as dx from './dx';

export enum QueueTaskType {
  Upload,
  Download,
  Info,
}

/**
 * Interface representing a file that live on a remote server
 * and is linked to a local file. This can be used for representing
 * a file that needs to be uploaded to a remote server or downloaded
 * to a local file.
 **/

export interface RemoteFile {
  local_file: string;
  remote_file: string;
}

export interface QueueTask extends RemoteFile {
  taskType: QueueTaskType;
}

// The static queue option which is created upon
// module loading.
export let main_queue = _async.priorityQueue(
  (t: QueueTask, e: _async.ErrorCallback<Error>) => {
    switch (t.taskType) {
      case QueueTaskType.Upload: {
        handleUploadTask(t);
        break;
      }
      case QueueTaskType.Download: {
        handleDownloadTask(t);
        break;
      }
      case QueueTaskType.Info: {
        handleInfoTask(t);
        break;
      }
    }
  },
  2
);

/**
 * Adds a QueueTask to the queue for execution.
 *
 * @param t {QueueTask} The task to add to the main_queue.
 */
export function addTask(t: QueueTask) {
  main_queue.push(t, t.taskType);
}

/**
 * Add an upload task to the queue.
 *
 * @param r {RemoteFile} Local/remote file mapping.
 **/
export function addUploadTask(r: RemoteFile) {
  addTask({
    taskType: QueueTaskType.Upload,
    ...r,
  });
}

/**
 * Add a download task to the queue.
 *
 * @param r {RemoteFile} Local/remote file mapping.
 **/
export function addDownloadTask(r: RemoteFile) {
  addTask({
    taskType: QueueTaskType.Upload,
    ...r,
  });
}

/**
 * Add an info task to the queue.
 *
 * @param r {RemoteFile} Local/remote file mapping.
 **/
export function addInfoTask(r: RemoteFile) {
  addTask({
    taskType: QueueTaskType.Info,
    ...r,
  });
}

/**
 * Upload a local file to DNAnexus.
 * @param t {RemoteFile} Remote/local file mapping.
 */
export function handleUploadTask(t: RemoteFile) {
  // @TODO
}

/**
 * Download a remote file from DNAnexus.
 * @param t {RemoteFile} Remote/local file mapping.
 */
export function handleDownloadTask(t: RemoteFile) {
  // @TODO
}

/**
 * Retrieve info about a remote asset in DNAnexus.
 * @param t {RemoteFile} Remote/local file mapping.
 */
export function handleInfoTask(t: RemoteFile) {
  // @TODO
}

/**
 * Remove certain types of tasks from the queue.
 *
 * @param type Type of tasks to remove
 */
export function removeAllTaskOfType(t: QueueTaskType) {
  // @NOTE: Currently, the types for async do not include
  // the most updated declarations. Thus the need for any
  // here.
  (main_queue as any).remove((u: QueueTask) => {
    return u.taskType === t;
  });
}

/**
 * Update the concurrency of the queue.
 * @param concurrency {number} New concurrency level.
 */
export function setConcurrentOperations(concurrency: number) {
  main_queue.concurrency = concurrency;
}
