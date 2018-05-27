import {FileQueue, QueueTaskType} from './queue';

describe('Async queue library', () => {
  let file_queue = FileQueue.getInstance();

  beforeEach(() => {
    spyOn(FileQueue, 'handleUploadTask').and.callThrough();
    spyOn(FileQueue, 'handleDownloadTask').and.callThrough();
    spyOn(FileQueue, 'handleInfoTask').and.callThrough();
  });

  it('should create and export a singleton FileQueue.', () => {
    expect(file_queue).not.toBeNull();
  });

  it('should initialize that queue with no objects', () => {
    expect(file_queue._queue.length()).toBe(0);
  });

  it('should handle an upload task without erroring.', done => {
    file_queue.addUploadTask({
      localFile: '/foo',
      remoteFile: '/bar',
    });

    file_queue._queue.drain = function() {
      expect(FileQueue.handleUploadTask).toHaveBeenCalledTimes(1);
      done();
    };
  });

  it('should handle a download task without erroring.', done => {
    file_queue.addDownloadTask({
      localFile: '/foo',
      remoteFile: '/bar',
    });

    file_queue._queue.drain = function() {
      expect(FileQueue.handleDownloadTask).toHaveBeenCalledTimes(1);
      done();
    };
  });

  it('should handle an info task without erroring.');
});
