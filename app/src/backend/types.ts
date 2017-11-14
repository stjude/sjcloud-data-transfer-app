/**
 * Generic callback function where the arguments are:
 *    - error: any   = Error object on failure, null on success.
 *    - results: any = null on failure, object on success.
 */

export type SuccessCallback = (error: object, result: object) => void;

/**
 * Callback used when we are reporting the progress of some
 * task. This callback is generally accompanied by a 
 * SuccessCallback in the parameters to indicate that the
 * task has finished with a particular result.
 * 
 *    - progress: any = updated value of the task.
 */
export type UpdateCallback = (progress: any) => void;

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
  name: string,
  raw_size: number,
  size: string,
  status: number,
  checked: boolean,
  waiting: boolean,
  started: boolean,
  finished: boolean,

  // upload only
  path?: string,
  sizeCheckingLock?: boolean,
  largestReportedProgress?: number,
}

export interface SJDTAProject {
  project_name: string,
  dx_location: string,
  access_level: string,
}