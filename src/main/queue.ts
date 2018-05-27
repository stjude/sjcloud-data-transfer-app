/**
 * @module queue
 * @description Customized queue functionality to multiplex tasks across the
 * concurrency level specified by the user and rank them based on priority.
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
  localFile: string;
  remoteFile: string;
}

export interface QueueTask extends RemoteFile {
  taskType: QueueTaskType;
}

export class FileQueue {
  private static instance: FileQueue;
  public _queue: _async.AsyncPriorityQueue<QueueTask>;

  private constructor() {
    this._queue = _async.priorityQueue(
      (t: QueueTask, cb: _async.ErrorCallback<Error>) => {
        switch (t.taskType) {
          case QueueTaskType.Upload: {
            FileQueue.handleUploadTask(t, cb);
            break;
          }
          case QueueTaskType.Download: {
            FileQueue.handleDownloadTask(t, cb);
            break;
          }
          case QueueTaskType.Info: {
            FileQueue.handleInfoTask(t, cb);
            break;
          }
        }
      },
      2
    );
  }

  /**
   * Static method to get the singleton instance.
   */
  static getInstance(): FileQueue {
    if (!FileQueue.instance) {
      FileQueue.instance = new FileQueue();
    }

    return FileQueue.instance;
  }

  /**
   * Adds a QueueTask to the queue for execution.
   *
   * @param t {QueueTask} The task to add to the main_queue.
   */
  addTask(t: QueueTask) {
    this._queue.push(t, t.taskType);
  }

  /**
   * Add an upload task to the queue.
   *
   * @param r {RemoteFile} Local/remote file mapping.
   **/
  addUploadTask(r: RemoteFile) {
    this.addTask({
      taskType: QueueTaskType.Upload,
      ...r,
    });
  }

  /**
   * Add a download task to the queue.
   *
   * @param r {RemoteFile} Local/remote file mapping.
   **/
  addDownloadTask(r: RemoteFile) {
    this.addTask({
      taskType: QueueTaskType.Download,
      ...r,
    });
  }

  /**
   * Add an info task to the queue.
   *
   * @param r {RemoteFile} Local/remote file mapping.
   **/
  addInfoTask(r: RemoteFile) {
    this.addTask({
      taskType: QueueTaskType.Info,
      ...r,
    });
  }

  /**
   * Upload a local file to DNAnexus.
   * @param t {RemoteFile} Remote/local file mapping.
   * @TODO
   */
  static handleUploadTask(t: RemoteFile, cb: _async.ErrorCallback<Error>) {
    cb();
  }

  /**
   * Download a remote file from DNAnexus.
   * @param t {RemoteFile} Remote/local file mapping.
   * @TODO
   */
  static handleDownloadTask(t: RemoteFile, cb: _async.ErrorCallback<Error>) {
    cb();
  }

  /**
   * Retrieve info about a remote asset in DNAnexus.
   * @param t {RemoteFile} Remote/local file mapping.
   * @TODO
   */
  static handleInfoTask(t: RemoteFile, cb: _async.ErrorCallback<Error>) {
    cb();
  }

  /**
   * Remove certain types of tasks from the queue.
   *
   * @param type Type of tasks to remove
   */
  removeAllTaskOfType(t: QueueTaskType) {
    // @NOTE: Currently, the types for async do not include the most up to
    //        date declarations. Thus the need to cast to `any` here.
    (this._queue as any).remove((u: QueueTask) => {
      return u.taskType === t;
    });
  }

  /**
   * Update the concurrency of the queue.
   * @param concurrency {number} New concurrency level.
   */
  setConcurrentOperations(concurrency: number) {
    this._queue.concurrency = concurrency;
  }
}
