let async = require("async");
let debug = true;

/**
 * Queue functionality
 */

let PRIORITY = {
  UPLOAD: 1,
  DOWNLOAD: 2,
  OTHER: 3,
};

/**
 * Handles processing for download tasks.
 * 
 * @param {object} task Task to run. Required keys should be evident
 *                      from the code below. 
 * @param {callback} callback Takes (err, result) as parameters.
 */
function downloadTask(task, callback) {
  if (debug) console.log("Starting download task:", task);

  task._rawFile.started = true;
  let process = window.dx.downloadFile(
    task.local_location,
    task.name,
    task.raw_size,
    task.remote_location,
    (progress) => {
      task._rawFile.status = progress;
    },
    (err, result) => {
      window.VueApp.$store.commit("removeOperationProcess", {
        filename: task.name,
      });

      if (err) {
        console.error(err);

        if (task._rawFile.cancelled) {
          window.utils.resetFileStatus(task._rawFile);
          task._rawFile.checked = false;
          return callback(null, result);
        } else {
          task._rawFile.errored = true;
          return callback(err, null);
        }
      } else {
        // Success
        task._rawFile.status = 100;
        setTimeout(() => {
          task._rawFile.checked = true;
          task._rawFile.finished = true;
          return callback(null, task._rawFile);
        }, 1000);
      }
    }
  );

  window.VueApp.$store.commit("addOperationProcess", {
    filename: task.name,
    process,
  });
};


/**
 * Handles processing for upload tasks.
 * 
 * @param {object} task Task to run. Required keys should be evident
 *                      from the code below. 
 * @param {callback} callback Takes (err, result) as parameters.
 */
function uploadTask(task, callback) {
  if (debug) console.log("Upload task:", task);

  task._rawFile.started = true;
  let process = window.dx.uploadFile(
    task._rawFile,
    task.remote_location,
    (progress) => {
      if (!task._rawFile.cancelled) {
        task._rawFile.status = progress;
      }
    },
    (err, result) => {
      window.VueApp.$store.commit("removeOperationProcess", {
        filename: task.local_location,
      });

      if (err) {
        if (task._rawFile.cancelled) {
          window.utils.resetFileStatus(task._rawFile);
          task._rawFile.checked = false;
          return callback(null, result);
        } else {
          task._rawFile.errored = true;
          return callback(err, null);
        }
      }

      task._rawFile.status = 100;
      setTimeout(() => {
        task._rawFile.checked = true;
        task._rawFile.finished = true;
        return callback(err, result);
      }, 1000);
    }
  );

  window.VueApp.$store.commit("addOperationProcess", {
    filename: task.local_location,
    process,
  });
}

/**
 * Handles processing for other tasks.
 * 
 * @param {object} task Task to run. Required keys should be evident
 *                      from the code below. 
 * @param {callback} callback Takes (err, result) as parameters.
 */
function otherTask(task, callback) {
  if (debug) console.log("Other task:", task);
  callback();
}

let workQueue = async.priorityQueue(
  (task, callback) => {
    if (task.type === "download") {
      downloadTask(task, callback);
    } else if (task.type === "upload") {
      uploadTask(task, callback);
    } else {
      otherTask(task, callback);
    }
  }, 2
);

workQueue.drain = function() {
  if (debug) console.log("The queue is now empty and awaiting more tasks.");
};

/**
 * Utility functions
 */

/**
 * Add a general task to the queue, prioritize it based on
 * what type of task it is.
 * 
 * @param {object} task The task to be added to the queue.
 */
function add(task) {
  if (debug) console.log("Adding task to queue:", task);
  if (task.type == "upload") {
    workQueue.push(task, PRIORITY.UPLOAD);
  } else if (task.type == "download") {
    workQueue.push(task, PRIORITY.DOWNLOAD);
  } else if (task.type == "other") {
    workQueue.push(task, PRIORITY.OTHER);
  } else {
    throw new Error("Invalid task type:", task.type);
  }
}


/**
 * Adds an upload task to the queue.
 * 
 * @param {Object} task Upload task to add to the queue.
 */
function addUploadTask(task) {
  task.type = "upload";
  add(task);
}


/**
 * Adds a download task to the queue.
 * 
 * @param {Object} task Download task to add to the queue.
 */
function addDownloadTask(task) {
  task.type = "download";
  add(task);
}

/**
 * Adds an other task to the queue.
 * 
 * @param {Object} task Other task to add to the queue.
 */
function addOtherTask(task) {
  task.type = "other";
  add(task);
}

/**
 * Only export the specific upload task functions.
 */
module.exports = {
  addUploadTask,
  addDownloadTask,
  addOtherTask,
};
