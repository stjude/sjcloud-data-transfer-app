/**
 * @module queue
 * @description Customized queue functionality to multiplex upload/download/info
 * tasks at a concurrency level specified by the user.
 */

import { priorityQueue, AsyncPriorityQueue, ErrorCallback } from 'async';

import {
  RemoteLocalFilePair,
  // uploadFile
} from './dx';

export enum QueueTaskType {
  Upload,
  Download,
  Info,
}

export interface QueueTask extends RemoteLocalFilePair {
  taskType: QueueTaskType;
}

export class FileTransferQueue {
  private static instance: FileTransferQueue;
  public _queue: AsyncPriorityQueue<QueueTask>;

  private constructor() {
    this._queue = priorityQueue((t: QueueTask, cb: ErrorCallback<Error>) => {
      switch (t.taskType) {
        case QueueTaskType.Upload: {
          FileTransferQueue.handleUploadTask(t, cb);
          break;
        }
        case QueueTaskType.Download: {
          FileTransferQueue.handleDownloadTask(t, cb);
          break;
        }
        case QueueTaskType.Info: {
          FileTransferQueue.handleInfoTask(t, cb);
          break;
        }
      }
    }, 2);
  }

  /**
   * Static method to get the singleton instance.
   */
  static getInstance(): FileTransferQueue {
    if (!FileTransferQueue.instance) {
      FileTransferQueue.instance = new FileTransferQueue();
    }

    return FileTransferQueue.instance;
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
   * @param r {RemoteLocalFilePair} Local/remote file mapping.
   **/
  addUploadTask(r: RemoteLocalFilePair) {
    this.addTask({
      taskType: QueueTaskType.Upload,
      ...r,
    });
  }

  /**
   * Add a download task to the queue.
   *
   * @param r {RemoteLocalFilePair} Local/remote file mapping.
   **/
  addDownloadTask(r: RemoteLocalFilePair) {
    this.addTask({
      taskType: QueueTaskType.Download,
      ...r,
    });
  }

  /**
   * Add an info task to the queue.
   *
   * @param r {RemoteLocalFilePair} Local/remote file mapping.
   **/
  addInfoTask(r: RemoteLocalFilePair) {
    this.addTask({
      taskType: QueueTaskType.Info,
      ...r,
    });
  }

  /**
   * Upload a local file to DNAnexus.
   * @param t {RemoteLocalFilePair} Remote/local file mapping.
   * @param cb {ErrorCallback<Error>} Callback indicating if an error occurred.
   * @TODO
   */
  static handleUploadTask(t: RemoteLocalFilePair, cb: ErrorCallback<Error>) {
    // uploadFile()
    cb();
  }

  /**
   * Download a remote file from DNAnexus.
   * @param t {RemoteLocalFilePair} Remote/local file mapping.
   * @param cb {ErrorCallback<Error>} Callback indicating if an error occurred.
   * @TODO
   */
  static handleDownloadTask(t: RemoteLocalFilePair, cb: ErrorCallback<Error>) {
    cb();
  }

  /**
   * Retrieve info about a remote asset in DNAnexus.
   * @param t {RemoteLocalFilePair} Remote/local file mapping.
   * @param cb {ErrorCallback<Error>} Callback indicating if an error occurred.
   * @TODO
   */
  static handleInfoTask(t: RemoteLocalFilePair, cb: ErrorCallback<Error>) {
    cb();
  }

  /**
   * Remove certain types of tasks from the queue.
   *
   * @param type Type of tasks to remove
   */
  removeAllTaskOfType(t: QueueTaskType) {
    // Currently, the types for async do not include the most up to
    // date declarations. Thus the need to cast to `any` here.
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
