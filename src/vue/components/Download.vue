<template>
	<div class='row'>
		<div class='col-xs-4 left-panel-container'>
			<left-panel></left-panel>
		</div>
		
		<div class='col-xs-8 right-panel-container'>
			<nav-bar></nav-bar>
			<div class="alert-container" v-show="noProjectsFound">
				<img src="http://via.placeholder.com/175x175">
				<h3>Could not find any projects!</h3>
			</div>

			<file-status v-if="filesVisible"></file-status>
			<div class="alert-container" v-else-if="noFilesVisible">
				<img src="http://via.placeholder.com/175x175">
				<h3>No files to download!</h3>
			</div>
			<div class="alert-container" v-else-if="filesLoading">
				<spin-kit></spin-kit>
				<!-- <img src="http://via.placeholder.com/175x175">
				<h3>Loading...</h3> -->
			</div>

			<div class="bottom-bar">
				<div class="bottom-bar-left">
					<input id="downloadTextInput" type="text"
						   v-model="downloadLocation"
						   v-on:click.prevent="selectDownloadLocation"
						   readonly>
				</div>
				<div class="bottom-bar-right">
					<button class='btn btn-primary btn-stjude download-btn' 
						    v-bind:disabled='!checkedFiles.length'
						    v-on:click='downloadFiles'>
						Download
					</button>
					<button class='btn btn-danger btn-stjude-warning cancel-btn'
						    v-bind:disabled='!checkedFiles.length'
						    v-on:click='cancelFiles'>Cancel</button>
				</div>
			</div>
		</div>
	</div>
</template>

<script>
import mapLimit from 'async/mapLimit';
import LeftPanel from './LeftPanel.vue'
import NavBar from './NavBar.vue';
import FileStatus from './FileStatus.vue';
import UploadTarget from './UploadTarget.vue';
import SpinKit from './SpinKit.vue';

export default {
	components: {
		LeftPanel,
		NavBar,
		FileStatus,
		UploadTarget,
		SpinKit,
	},
	computed: {
		noProjectsFound() {
			return this.$store.getters.noProjectsFound
		},
		checkedFiles() {
			return this.$store.getters.checkedFiles
		},
		downloadLocation() {
			return this.$store.getters.downloadLocation
		},
		filesVisible() {
			return !this.$store.getters.noProjectsFound &&
			(
				this.$store.getters.searchTerm || 
				(this.$store.getters.tools.length &&
					(this.$store.getters.currFiles.length)
				)
			)
		},
		filesLoading() {
			return !this.$store.getters.noProjectsFound && !this.$store.getters.currTool.loadedAvailableDownloads;
		}, 
		noFilesVisible() {
			return !this.$store.getters.noProjectsFound &&
			(
				!this.$store.getters.searchTerm &&
				(!this.$store.getters.tools.length ||
					(!this.$store.getters.currFiles.length && this.$store.getters.currTool.loadedAvailableDownloads)
				)
			)
		}
	},
	methods: {
		selectDownloadLocation() {
			const defaultLocation = this.$store.getters.downloadLocation
			window.utils.openDirectoryDialog(
				(files) => {
					if (files && files.length > 0) {
						this.$store.commit('setDownloadLocation', files[0]);
					}
				}, 
				defaultLocation
			);
		},
		downloadFiles() {
			const files = this.$store.getters.currTool.download.filter((f) => f.checked);
			const downloadLocation = this.$store.getters.downloadLocation;
			const concurrency = this.$store.getters.concurrentOperations;
			console.log("Downloading", files.length, "files with a concurrency of", concurrency);

			files.forEach(function(file) {
				file.started = true;
				file.finished = false;
			});

			mapLimit(files, concurrency, (file, callback) => {
					window.dx.downloadFile(
						downloadLocation,
					  file.name,
					  file.raw_size,
					  file.dx_location,
					  function(progress) {
						  file.status = progress;
					  },
					  function(err, result) {
							file.status = 100;
							setTimeout(() => {
						    file.started = false;
							  file.finished = true;
								callback(null, file);
							}, 1000);
					  }
					);
			});
		},
		cancelFiles() {}
	}
}
</script>

<style>

.left-panel-container {
	font-family: 'Open Sans';
}

.right-panel-container {
	font-family: 'Lato';
}

#downloadTextInput {
	height: 45px;
	width: 350px;
	padding-left: 10px;
	font-size: 12pt;
}

.alert-container {
	margin-top: 90px;
	text-align: center;
}
</style>
