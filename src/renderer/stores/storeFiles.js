import globToRegExp from 'glob-to-regexp';

/*
  To-Do: convert to a Vuex.module for use in store.js
   Arguments:
  - ref: the main store's reference to run-time added methods and properties
*/
export default function(ref) {
  return {
    state: {
      showAllFiles: false,
      searchTerm: '',
      currFileSortKey: '',
      currFileSortDirection: 0,
    },
    getters: {
      showAllFiles(state) {
        return state.showAllFiles;
      },
      currFiles(state, getters) {
        const tool = getters.currTool;
        const files =
          !tool || !Array.isArray(tool[state.currPath])
            ? []
            : tool[state.currPath];
        sortFiles(state, files);

        if (state.currPath !== 'download' || !state.searchTerm) {
          return files;
        }
        const rgx = globToRegExp(state.searchTerm, {
          flags: 'gim',
        });
        return files.filter(f => rgx.test(f.name) || rgx.test(`${f.size}`));
      },
      currFileSortKey(state) {
        return state.currFileSortKey;
      },
      checkedFiles(state, getters) {
        const tool = getters.currTool;
        return !tool || !Array.isArray(tool[state.currPath])
          ? []
          : tool[state.currPath].filter(f => f.checked);
      },
      searchTerm(state) {
        return state.searchTerm;
      },
    },
    mutations: {
      addFile(state, file, checked) {
        const tool = state.tools.filter(
          t => t.dx_location === state.currToolName,
        )[0];
        if (toolError(tool, state)) {
          return;
        }

        tool[state.currPath].push(file);
      },
      addFiles(state, files) {
        const tool = state.tools.filter(
          t => t.dx_location === state.currToolName,
        )[0];
        if (toolError(tool, state)) {
          return;
        }

        const currFiles = tool[state.currPath];
        files.forEach(f => {
          const thisFile = {
            name: f.name,
            size: f.size,
            status: 0,
            checked: false,
          };
          currFiles.push(thisFile);
        });
      },
      removeCheckedFiles(state) {
        const tool = state.tools.filter(
          t => t.dx_location === state.currToolName,
        )[0];
        if (toolError(tool, state)) {
          return;
        }

        tool[state.currPath] = tool[state.currPath].filter(t => !t.checked);
      },
      removeAllFiles(state) {
        const tool = state.tools.filter(
          t => t.dx_location === state.currToolName,
        )[0];
        if (toolError(tool, state)) {
          return;
        }

        tool[state.currPath] = [];
      },
      cancelCheckedFiles(state) {
        const tool = state.tools.filter(
          t => t.dx_location === state.currToolName,
        )[0];
        if (toolError(tool, state)) {
          return;
        }

        const files = tool[state.currPath].filter(
          t => t.checked && t.started && !t.finished,
        );
        files.forEach(elem => {
          elem.cancelled = true;
          let process = null;
          if (state.currPath === 'upload') {
            process = state.operationProcesses[elem.path];
          } else if (state.currPath === 'download') {
            process = state.operationProcesses[elem.dx_location];
          }

          if (process) {
            Promise.resolve(process).then(p => {
              if ('abort' in p && typeof p.abort === 'function') {
                p.abort();
              } else {
                ref.backend.utils.killProcess(p.pid);
              }
            });
          } else {
            console.error('Process does not exist!');
          }
        });
      },
      setFileSorting(state, obj) {
        state.currFileSortKey = obj.key;
        state.currFileSortDirection = obj.direction;
      },
      setSearchTerm(state, term) {
        state.searchTerm = term;
      },
    },
    actions: {
      refreshFiles({ commit, state }) {
        state.tools.forEach(tool => {
          tool.upload = [];
          tool.download = [];
          tool.loadedAvailableDownloads = false;
        });
        // reset curr tool name to refresh downloads.
        commit('setCurrToolName', state.currToolName);
      },
    },
  };
}

/*
  Helpers
*/

function sortFiles(state, files) {
  if (!state.currFileSortKey || state.currFileSortDirection === 0) return;
  const i = state.currFileSortDirection;
  const j = -i;

  if (state.currFileSortKey === 'filename') {
    files.sort((a, b) => (a.name < b.name ? i : j));
  } else if (state.currFileSortKey === 'size') {
    files.sort((a, b) => (a.raw_size < b.raw_size ? j : i));
  } else if (state.currFileSortKey === 'status') {
    files.sort((a, b) => {
      if (a.finished && b.finished) return 0;
      else if (a.finished) return i;
      else if (b.finished) return j;
      else if (a.started && b.started) {
        return a.status > b.status ? i : j;
      } else if (a.started) return i;
      else if (b.started) return j;
      return 0;
    });
  } else if (state.currFileSortKey === 'checked') {
    files.sort((a, b) => (a.checked === b.checked ? 0 : a.checked ? i : j));
  }
}

function toolError(tool, state) {
  if (!tool || !tool[state.currPath]) {
    console.error(
      `Invalid tool name '${state.currToolName}' and/or path='${
        state.currPath
      }'.`,
    );
    return true;
  }
}
