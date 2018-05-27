import * as queue from './queue';

describe('Async queue library', () => {
  it('should create and export a default queue.', () => {
    expect(queue.main_queue).not.toBeNull();
  });

  it('should initialize that queue with no objects', () => {
    expect(queue.main_queue.length()).toBe(0);
  });

  it('should handle an upload task without erroring.');
  it('should handle a download task without erroring.');
  it('should handle an info task without erroring.');
});
