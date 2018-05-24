<template>
	<div class='row'>
		<div class='col-xs-4 left-panel-container'>
			<left-panel></left-panel>
		</div>
		
		<div id='download-panel' class='col-xs-8 right-panel-container'>
			<nav-bar></nav-bar>
			<div class="alert-container" v-show="noProjectsFound">
				<img src="http://via.placeholder.com/175x175">
				<h3>Could not find any projects!</h3>
			</div>

			<file-status v-if="filesVisible" showSelectionTotals='1'></file-status>

			<div class="alert-container" v-else-if="hasTools && noFilesVisible">
				<step-outcome failureMessage='No files to download!'
							  textStyle='font-size: 24pt; text-align: center;'
							  outcome='error'></step-outcome>	
			</div>

			<div class="alert-container" v-else-if="hasTools && filesLoading">
				<spin-kit></spin-kit>
			</div>

			<div class="bottom-bar">
				<div class="bottom-bar-left">
					<input id="downloadTextInput" type="text"
						   v-model="downloadLocation"
						   v-on:click.prevent="selectDownloadLocation"
						   readonly />
				</div>
				<div class="bottom-bar-right">
					<button class='btn btn-primary btn-stjude download-btn' 
						    v-bind:disabled='!hasFilesInStaging'
						    v-on:click='downloadFiles'>
						Download
					</button>
					<button class='btn btn-danger btn-stjude-warning cancel-btn'
						    v-bind:disabled='!hasFilesInTransit'
						    v-on:click='cancelFiles'>Cancel</button>
				</div>
			</div>
		</div>
	</div>
</template>

<script>
import LeftPanel from './LeftPanel.vue';
import NavBar from './NavBar.vue';
import FileStatus from './FileStatus.vue';
import UploadTarget from './UploadTarget.vue';
import SpinKit from './SpinKit.vue';
import StepOutcome from './StepOutcome.vue';

export default {
  components: {
    LeftPanel,
    NavBar,
    FileStatus,
    UploadTarget,
    SpinKit,
    StepOutcome,
  },
  computed: {
    noProjectsFound() {
      return this.$store.getters.noProjectsFound;
    },
    hasFilesInStaging() {
      return this.$store.getters.hasFilesInStaging;
    },
    hasFilesInTransit() {
      return this.$store.getters.hasFilesInTransit;
    },
    hasTools() {
      return this.$store.getters.tools.length;
    },
    checkedFiles() {
      return this.$store.getters.checkedFiles;
    },
    downloadLocation() {
      return this.$store.getters.downloadLocation;
    },
    filesVisible() {
      return (
        !this.$store.getters.noProjectsFound &&
        (this.$store.getters.searchTerm ||
          (this.$store.getters.tools.length &&
            this.$store.getters.currFiles.length))
      );
    },
    filesLoading() {
      return (
        !this.$store.getters.noProjectsFound &&
        (!this.$store.getters.currTool ||
          !this.$store.getters.currTool.loadedAvailableDownloads)
      );
    },
    noFilesVisible() {
      return (
        !this.$store.getters.noProjectsFound &&
        (!this.$store.getters.searchTerm &&
          (!this.$store.getters.tools.length ||
            (!this.$store.getters.currFiles.length &&
              this.$store.getters.currTool &&
              this.$store.getters.currTool.loadedAvailableDownloads)))
      );
    },
  },
  mounted() {
    this.$store.commit(
      'setInfoTipText',
      "If you'd like to see all files, please toggle the 'Show all files' option in the settings."
    );
    const concurrency = this.$store.getters.concurrentOperations;
    this.$root.backend.queue.setConcurrentOperations(concurrency);
  },
  methods: {
    selectDownloadLocation() {
      const defaultLocation = this.$store.getters.downloadLocation;
      this.$root.backend.utils.openDirectoryDialog(files => {
        if (files && files.length > 0) {
          this.$store.commit('setDownloadLocation', files[0]);
        }
      }, defaultLocation);
    },
    downloadFiles() {
      // Using setTimeout(..., 0) for async functionality.
      setTimeout(() => {
        const files = this.$store.getters.currTool.download.filter(
          f =>
            f.checked &&
            f.status <= 0 &&
            !f.waiting &&
            !f.started &&
            !f.finished
        );
        const downloadLocation = this.$store.getters.downloadLocation;
        const concurrency = this.$store.getters.concurrentOperations;
        console.log('Adding', files.length, 'files to the task queue.');

        // Reset the status of all files.
        files.forEach(file => {
          this.$root.backend.utils.resetFileStatus(file);
          file.waiting = true;

          let task = {
            _rawFile: file,
            name: file.name,
            raw_size: file.raw_size,
            local_location: downloadLocation,
            remote_location: file.dx_location,
          };

          this.$root.backend.queue.addDownloadTask(task);
        });
      }, 0);
    },
    cancelFiles() {
      this.$store.commit('cancelCheckedFiles');
    },
  },
};
</script>

<style>
.left-panel-container {
  font-family: 'Open Sans';
}

.right-panel-container {
  font-family: 'Lato';
  background-color: #fff;
}

#downloadTextInput {
  height: 45px;
  width: 350px;
  padding-left: 10px;
  font-size: 12pt;
}

.alert-container {
  margin-top: 110px;
  text-align: center;
}
</style>
