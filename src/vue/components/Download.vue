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
			<file-status v-show="hasTools && hasFiles && !noProjectsFound"></file-status>
			<div class="alert-container" v-show="hasTools && !hasFiles && !noProjectsFound">
				<img src="http://via.placeholder.com/175x175">
				<h3>No files to download!</h3>
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
import LeftPanel from './LeftPanel.vue'
import NavBar from './NavBar.vue';
import FileStatus from './FileStatus.vue';
import UploadTarget from './UploadTarget.vue';

export default {
	components: {
		LeftPanel,
		NavBar,
		FileStatus,
		UploadTarget
	},
	computed: {
		noProjectsFound() {
			return this.$store.getters.noProjectsFound
		},
		hasFiles() {
			return this.$store.getters.currFiles.length
		},
		hasTools() {
			return this.$store.getters.tools.length
		},
		checkedFiles() {
			return this.$store.getters.checkedFiles
		},
		downloadLocation() {
			return this.$store.getters.downloadLocation
		}
	},
	mounted() {
		//console.log('Download component mounted')
	},
	updated() {
		//console.log('Upload component updated')
	},
	methods: {
		selectDownloadLocation() {
			console.log("Selecting download location...");
			const defaultLocation = this.$store.getters.downloadLocation
			window.utils.openDirectoryDialog(
				(files) => {
					if (files.length > 0) {
						this.$store.commit('setDownloadLocation', files[0]);
					}
				}, 
				defaultLocation
			);
		},
		downloadFiles() {
			this.$store.getters.currTool.download.forEach((file) => {
				if (file.checked) {
					file.started = true;
					window.dx.downloadFile(
					   this.$store.getters.downloadLocation,
					   file.name,
					   file.raw_size,
					   file.dx_location,
					   function(progress) {
						   file.status = progress;
					   },
					   function(err, result) {
						   file.finished = true;
					   }
					);
				}
			});
		},
		cancelFiles() {}
	}
}
</script>

<style>

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
