/*
	To-Do: convert to a Vuex.module for use in store.js
*/

export default {
  state: {
    uriProject: "",
    currToolName: "", // value is project/tool dx_location
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

    /** Upload/Download **/
    currTool(state) {
      return state.tools.filter((t) => t.dx_location === state.currToolName)[0];
    },
    toolByName(state) {
      return (name) => {
        if (!name) return null;

        let toolsWithName = state.tools.filter((t) => t.name === name);
        if (!toolsWithName || !toolsWithName.length) {
          return null;
        }

        return toolsWithName[0];
      };
    },
    tool(state) {
      return (name) => state.tools.filter((t) => t.name === name)[0];
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

    /** Upload/Download **/
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
      state.searchTerm = "";
      state.currToolName = toolName;
      let tools = state.tools.filter((t) => t.dx_location === toolName);

      if (!tools || !tools.length) {
        if (!state.tools || !state.tools.length) {
          console.log("Appears the tools haven't loaded yet.");
          return;
        } else {
          console.error("Could not find tool:", toolName);
          return;
        }
      }

      let tool = tools[0];
      if (!tool.download.length) {
        window.dx.listDownloadableFiles(
          tool.dx_location,
          state.showAllFiles,
          // this is not called in browser testing mode
          (err, files) => {
            let downloadableFiles = [];

            files.forEach((elem) => {
              if (isNaN(elem.describe.size)) {
                console.error("Handle this NaN case:", elem);
              }

              let dl_file = {
                name: elem.describe.name,
                status: 0,
                checked: false,
                waiting: false,
                started: false,
                finished: false,
                cancelled: false,
                size: window.utils.readableFileSize(elem.describe.size),
                raw_size: elem.describe.size,
                dx_location: elem.project + ":" + elem.id,
              };

              downloadableFiles.push(dl_file);
            });

            tool.loadedAvailableDownloads = true;
            tool.download = downloadableFiles;
          }
        );
      }

      if (removeURI) {
        state.uriProject = "";
      }
    },
  },
  actions: {
    updateCurrentToolFromURI({
      commit,
      state,
      getters,
    }) {
      let projectToPick = getters.uriProject;
      if (!projectToPick) return false;

      let tool = getters.toolByName(projectToPick);
      if (!tool) {
        // TODO: add red alert here to say project could not be picked.
        console.error(`Could not pick project (does not exist): ${tool}`);
        return false;
      }

      commit("setCurrToolName", projectToPick);
      window.utils.setURIProject(undefined);
      return true;
    },
    updateToolsFromRemote({
      commit,
      state,
      getters,
      dispatch,
    }, force = false) {
      let previousTool = state.currToolName;

      commit("setNoProjectsFound", false);

      /** TODO: this is not an elegant solution. **/
      let uploadMap = {};
      state.tools.forEach((tool) => {
        uploadMap[tool.dx_location] = tool.upload;
      });

      if (force) state.tools = [];

      if (!state.tools.length) {
        window.dx.listProjects(
          state.showAllProjects,
          (err, results) => {
            if (results.length > 0) {
              commit("setNoProjectsFound", false);

              let tools = [];
              results.forEach((elem) => {
                let item = {
                  name: elem.project_name,
                  dx_location: elem.dx_location,
                  access_level: elem.access_level,
                  size: "",
                  upload: [],
                  download: [],
                  loadedAvailableDownloads: false,
                  isSJCPTool: false,
                  SJCPToolURL: "",
                  isSJCPDataRequest: false,
                };

                /** TODO: see todo above **/
                if (item.dx_location in uploadMap) {
                  item.upload = uploadMap[item.dx_location];
                }

                tools.push(item);
              });

              commit("setTools", tools);
              let resetCurrToolName = true;
              if (window.uriProject) {
                for (let i = 0; i < tools.length; i++) {
                  let tool = tools[i];
                  if (tool.dx_location === window.uriProject) {
                    resetCurrToolName = false;
                    commit("setCurrToolName", window.uriProject);
                    window.uriProject = null;
                    break;
                  };
                }

                if (resetCurrToolName) {
                  // TODO: error, project was not found.
                }
              }

              for (let i = 0; i < tools.length; i++) {
                let tool = tools[i];
                if (tool.dx_location === previousTool) {
                  resetCurrToolName = false;
                  break;
                };
              }

              if (resetCurrToolName) {
                commit("setCurrToolName", tools[0].dx_location);
              }

              tools.forEach((elem) => {
                window.queue.addToolInfoTask({
                  _rawTool: elem,
                });
              });
            } else {
              commit("setNoProjectsFound", true);
            }
          }
        );
      }
    },
  },
};
