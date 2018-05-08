/*
  To-Do: convert to a Vuex.module for use in store.js
*/

/**
  Helper functions
*/

function getUploadMap(tools) {
  const uploadMap = {};
  tools.forEach(tool => {
    uploadMap[tool.dx_location] = tool.upload;
  });
  return uploadMap;
}

function getToolItem(elem, uploadMap) {
  const item = {
    name: elem.project_name,
    dx_location: elem.dx_location,
    access_level: elem.access_level,
    size: '',
    upload: [],
    download: [],
    loadedAvailableDownloads: false,
    isSJCPTool: false,
    SJCPToolURL: '',
    isSJCPDataRequest: false,
  };

  /** TODO: see todo above * */
  if (item.dx_location in uploadMap) {
    item.upload = uploadMap[item.dx_location];
  }

  return item;
}

function resetCurrToolName(tools, previousTool, commit) {
  let forceReset = true;
  if (window.uriProject) {
    for (const tool of tools) {
      if (tool.dx_location === window.uriProject) {
        forceReset = false;
        commit('setCurrToolName', window.uriProject);
        window.uriProject = null;
        break;
      }
    }

    if (forceReset) {
      // TODO: error, project was not found.
    }
  }

  for (const tool of tools) {
    if (tool.dx_location === previousTool) {
      forceReset = false;
      break;
    }
  }

  if (forceReset) {
    commit('setCurrToolName', tools[0].dx_location);
  }
}

/**
  exported function
  Arguments:
  - ref: the main store's reference to run-time added methods and properties
*/

export default function(ref) {
  function handleDownloadableFiles(tool) {
    return (err, files) => {
      const downloadableFiles = [];

      files.forEach(elem => {
        if (isNaN(elem.describe.size)) {
          console.error('Handle this NaN case:', elem);
        }

        const dl_file = {
          name: elem.describe.name,
          status: 0,
          checked: false,
          waiting: false,
          started: false,
          finished: false,
          cancelled: false,
          size: ref.backend.utils.readableFileSize(elem.describe.size),
          raw_size: elem.describe.size,
          dx_location: `${elem.project}:${elem.id}`,
        };

        downloadableFiles.push(dl_file);
      });

      tool.loadedAvailableDownloads = true;
      tool.download = downloadableFiles;
    };
  }

  return {
    state: {
      uriProject: '',
      currToolName: '', // value is project/tool dx_location
      tools: [], // see app/testdata/fakeTools.json for expected schema
      noProjectsFound: false,
      showAllProjects: false,
    },
    getters: {
      noProjectsFound(state) {
        return state.noProjectsFound;
      },

      showAllProjects(state) {
        return state.showAllProjects;
      },

      /** Upload/Download * */
      currTool(state) {
        return state.tools.filter(t => t.dx_location === state.currToolName)[0];
      },
      toolByName(state) {
        return name => {
          if (!name) return null;

          const toolsWithName = state.tools.filter(t => t.name === name);
          if (!toolsWithName || !toolsWithName.length) {
            return null;
          }

          return toolsWithName[0];
        };
      },
      tool(state) {
        return name => state.tools.filter(t => t.name === name)[0];
      },
      tools(state) {
        return state.tools;
      },
      uriProject(state, getters) {
        return state.uriProject;
      },
    },
    mutations: {
      setURIProject(state, value) {
        state.uriProject = value;
      },

      /** Upload/Download * */
      setNoProjectsFound(state, value) {
        state.noProjectsFound = value;
      },
      setShowAllFiles(state, value) {
        state.showAllFiles = value;
      },
      setShowAllProjects(state, value) {
        state.showAllProjects = value;
      },
      setTools(state, tools) {
        state.tools.splice(0, state.tools.length, ...tools);
      },
      setCurrToolName(state, toolName, removeURI = false) {
        state.searchTerm = '';
        state.currToolName = toolName;
        const tools = state.tools.filter(t => t.dx_location === toolName);

        if (!tools || !tools.length) {
          if (!state.tools || !state.tools.length) {
            console.log("Appears the tools haven't loaded yet.");
            return;
          }
          console.error('Could not find tool:', toolName);
          return;
        }

        const tool = tools[0];
        if (!tool.download.length) {
          ref.backend.dx.listDownloadableFiles(
            state.token,
            tool.dx_location,
            state.showAllFiles,
            // this is not called in browser testing mode
            handleDownloadableFiles(tool)
          );
        }

        if (removeURI) {
          state.uriProject = '';
        }
      },
    },
    actions: {
      updateCurrentToolFromURI({commit, state, getters}) {
        const projectToPick = getters.uriProject;
        if (!projectToPick) return false;

        const tool = getters.toolByName(projectToPick);
        if (!tool) {
          // TODO: add red alert here to say project could not be picked.
          console.error(`Could not pick project (does not exist): ${tool}`);
          return false;
        }

        commit('setCurrToolName', projectToPick);
        ref.backend.utils.setURIProject(undefined);
        return true;
      },
      updateToolsFromRemote({commit, state, getters, dispatch}, force = false) {
        const previousTool = state.currToolName;

        commit('setNoProjectsFound', false);
        if (force) state.tools = [];

        if (!state.tools.length) {
          const uploadMap = getUploadMap(state.tools);

          ref.backend.dx.listProjects(
            state.token,
            state.showAllProjects,
            (err, results) => {
              if (results.length > 0) {
                commit('setNoProjectsFound', false);
                const tools = results.map(elem => getToolItem(elem, uploadMap));
                commit('setTools', tools);
                resetCurrToolName(tools, previousTool, commit);
                tools.forEach(elem => {
                  ref.backend.queue.addToolInfoTask({
                    _rawTool: elem,
                  });
                });

                if (ref.VueApp && ref.VueApp.readyCallback) {
                  ref.VueApp.readyCallback();
                  delete ref.VueApp.readyCallback;
                }
              } else {
                commit('setNoProjectsFound', true);
              }
            }
          );
        }
      },
    },
  };
}
