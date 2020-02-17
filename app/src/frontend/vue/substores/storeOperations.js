/*
  To-Do: convert to a Vuex.module for use in store.js
*/
export default function(ref) {
  return {
    state: {
      operationUploadProcesses: {},
      operationDownloadProcesses: {},
      concurrentOperations: 3,
    },
    getters: {
      concurrentOperations(state, getters) {
        return state.concurrentOperations;
      },
      hasFilesInStaging(state, getters) {
        const checkedFiles = getters.checkedFiles;
        if (!checkedFiles.length) {
          return false;
        }

        for (let i = 0; i < checkedFiles.length; i++) {
          if (
            checkedFiles[i].status === 0 &&
            !checkedFiles[i].waiting &&
            !checkedFiles[i].started &&
            !checkedFiles[i].finished
          ) {
            return true;
          }
        }

        return false;
      },
      hasFilesInTransit(state, getters) {
        const checkedFiles = getters.checkedFiles;
        if (!checkedFiles.length) {
          return false;
        }

        for (let i = 0; i < checkedFiles.length; i++) {
          if (
            (checkedFiles[i].waiting || checkedFiles[i].started) &&
            !checkedFiles[i].finished
          ) {
            return true;
          }
        }

        return false;
      },
      transferComplete(state, getters) {
        const currFiles = getters.currFiles.filter(f => f.started);
        if (!currFiles.length) {
          return false;
        }

        for (let i = 0; i < currFiles.length; i++) {
          if (
            (currFiles[i].waiting ||
              currFiles[i].started ||
              currFiles[i].errored) && // either waiting, started, or errored
            !currFiles[i].finished // and not finished
          ) {
            return false;
          }
        }

        return true;
      },
    },
    mutations: {
      /** Operation Processes * */
      addOperationUploadProcess(state, info) {
        state.operationUploadProcesses[info.filename] = info.process;
      },
      removeOperationUploadProcess(state, info) {
        delete state.operationUploadProcesses[info.filename];
      },
      addOperationDownloadProcess(state, info) {
        console.log(info);
        state.operationDownloadProcesses[info.filename] = info.cancelToken;
      },
      removeOperationDownloadProcess(state, info) {
        delete state.operationDownloadProcesses[info.filename];
      },
      setConcurrentOperations(state, num) {
        if (!isNaN(num)) {
          state.concurrentOperations = num;
        }
      },
    },
    actions: {},
  };
}
