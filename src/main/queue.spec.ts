import { FileTransferQueue, QueueTaskType } from './queue';
import { RemoteLocalFilePair } from './dx';

describe('Async queue library', () => {
  let file_queue = FileTransferQueue.getInstance();

  beforeEach(() => {
    spyOn(FileTransferQueue, 'handleUploadTask').and.callThrough();
    spyOn(FileTransferQueue, 'handleDownloadTask').and.callThrough();
    spyOn(FileTransferQueue, 'handleInfoTask').and.callThrough();
  });

  it('should create and export a singleton FileTransferQueue.', () => {
    expect(file_queue).not.toBeNull();
  });

  it('should initialize that queue with no objects', () => {
    expect(file_queue._queue.length()).toBe(0);
  });

  it('should handle an upload task without erroring.', done => {
    file_queue._queue.drain = function() {
      expect(FileTransferQueue.handleUploadTask).toHaveBeenCalledTimes(1);
      done();
    };

    const mapping: RemoteLocalFilePair = {
      localFilePath: '~/foo.txt',
      remoteFilePath: {
        fileId: 'file-notarealfile',
      },
    };

    file_queue.addUploadTask(mapping);
  });

  it('should handle a download task without erroring.', done => {
    file_queue._queue.drain = function() {
      expect(FileTransferQueue.handleDownloadTask).toHaveBeenCalledTimes(1);
      done();
    };

    const mapping: RemoteLocalFilePair = {
      localFilePath: '~/foo.txt',
      remoteFilePath: {
        fileId: 'file-notarealfile',
      },
    };

    file_queue.addDownloadTask(mapping);
  });

  it('should handle an info task without erroring.');
});
