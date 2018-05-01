/**
 * Callback used when we are reporting the result of some
 * task that cannot error.
 *
 *    - result: any = result of the task.
 */
export type ResultCallback = (result: any) => void;

/**
 * Callback used when we are reporting only an error.
 *
 *    - error: any = null or an error if one occurred.
 */
export type ErrorCallback = (error: any) => void;

/**
 * Callback used to report progress of some task when it cannot fail.
 *
 *    - percent: number = Percentage of task finished (0-100).
 *    - status: string  = Accompanying status.
 */
export type ProgressCallback = (percent: number, status: string) => void;

/**
 * Generic callback function where the arguments are:
 *    - error: any   = Error object on failure, null on success.
 *    - results: any = null on failure, object on success.
 */

export type SuccessCallback = (error: any, result: any) => void;

/**
 * Callback that is the common interface used by NodeJS command
 * functions (exec, spawn, etc).
 *
 *    - error: any     = Error object on failure, null on success.
 *    - stdout: string = STDOUT of the process
 *    - stderr: string = STDERR of the process
 */

export type CommandCallback = (
  error: any,
  stdout: string,
  stderr: string
) => void;

/**
 * Type that we use to represent files in the Vuex store.
 *
 *  - name: Fully qualified name of the file.
 *  - raw_size: size in bytes as a number.
 *  - size:     raw_size in human readable form.
 *  - status:   progress of upload or download (0-100).
 *  - checked:  whether the file item is checked in the interface.
 *  - waiting:  whether the file is staged for upload/downloading.
 *  - started:  whether the file has started upload/downloading.
 *  - finished: whether the file has finished upload/downloading.
 *
 *
 *  - path:                    Fully qualified path of the file.
 *  - sizeCheckingLock:        Lock for checking the remote file size.
 *  - largestReportedProgress: Largest reported upload progress.
 */
export interface SJDTAFile {
  name: string;
  raw_size: number;
  size: string;
  status: number;
  checked: boolean;
  waiting: boolean;
  started: boolean;
  finished: boolean;

  // upload only
  path?: string;
  sizeCheckingLock?: boolean;
  largestReportedProgress?: number;
}

export interface SJDTAProject {
  project_name: string;
  dx_location: string;
  access_level: string;
}

export interface DownloadInfo {
  URL: string;
  SHA256SUM: string;
}
