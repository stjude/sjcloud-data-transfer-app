<template>
	<div class='row'>
		<div class='col-xs-4 left-panel-container'>
			<left-panel></left-panel>
		</div>
		<div class='col-xs-8 right-panel-container'>
			<div v-show='!transferComplete'>
				<nav-bar></nav-bar>

				<div class="alert-container" v-show="noProjectsFound">
					<img src="http://via.placeholder.com/175x175">
					<h3>Could not find any projects!</h3>
				</div>
				<file-status class="middle" v-show='hasTools && hasFiles'></file-status>
				<dropzone class="middle" v-show='hasTools && !hasFiles'></dropzone>

				<div class="bottom-bar" v-show="hasTools && hasFiles">
					<div class="bottom-bar-left"></div>
					<div class="bottom-bar-right">
						<button class='btn btn-primary btn-stjude download-btn'
									  v-bind:disabled='!hasFilesInStaging'
										@click='uploadFiles'>
							Upload
						</button>
						<button class='btn btn-danger btn-stjude-warning delete-btn'
									  v-bind:disabled='!hasFilesInStaging'
										@click="removeCheckedFiles()"
										>
							Delete
						</button>
						<button class='btn btn-danger btn-stjude-warning cancel-btn'
						        v-bind:disabled='!hasFilesInTransit'>
							Cancel
						</button>
					</div>
				</div>
			</div>

			<div v-show='transferComplete && hasFiles' style='margin-top:100px; text-align:center'>
				<step-outcome successMessage='Upload complete!' outcome='done'></step-outcome>
				<div style="margin-top:30px">
					<button class='btn btn-stjude'>
						<i class='material-icons' style='vertical-align:bottom'>open_in_browser</i>
						READY TO RUN
					</button>
					<button class='btn btn-stjude' v-on:click='removeAllFiles'>
						<i class='material-icons' style='vertical-align:bottom'>cloud_upload</i>
						UPLOAD MORE DATA
					</button>
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
import Dropzone from './Dropzone.vue';
import StepOutcome from './StepOutcome.vue'

export default {
	components: {
		LeftPanel,
		NavBar,
		FileStatus,
		UploadTarget,
		Dropzone,
		StepOutcome
	},
	data() {
		return {}
	},
	computed: {
		noProjectsFound() {
			return this.$store.getters.noProjectsFound
		},
		hasFiles() {
			return this.$store.getters.currFiles.length
		},
		hasFilesInStaging() {
			return this.$store.getters.hasFilesInStaging
		},
		hasFilesInTransit() {
			return this.$store.getters.hasFilesInTransit
		},
		hasTools() {
			return this.$store.getters.tools.length
		},
		checkedFiles() {
			return this.$store.getters.checkedFiles
		},
		transferComplete() {
			return this.$store.getters.transferComplete
		}
	},
	methods: {
		uploadFiles() {
			const files = this.$store.getters.currTool.upload.filter((f) => f.checked);

			const dnanexusProjectId = this.$store.getters.currTool.dnanexus_location;
			const concurrency = this.$store.getters.concurrentOperations;
			console.log("Uploading", files.length, "files with a concurrency of", concurrency);

			files.forEach(function(file) {
				file.waiting = true;
				file.started = false;
				file.finished = false;
				file.checked = false;
			});

			mapLimit(files, concurrency, (file, callback) => {
				file.started = true;
				// console.log(file);
				// callback(null, file);
				window.dx.uploadFile(file.path,
															dnanexusProjectId,
															file.raw_size,
															(progress) => {
																file.status = progress
																console.log("Progress", progress, "for name", file.name)
															},
															(err, result) => {
																console.log("Done for name", file.name)
																file.status = 100;
																file.finished = true;
																// Just to make the green progress bar
																// Last a little longer.
																setTimeout( 
																	callback(err, result),
																	1000
																)
															}
														);
			});
		},
		removeCheckedFiles() {
			this.$store.commit('removeCheckedFiles');
		},
		removeAllFiles() {
			this.$store.commit('removeAllFiles')
		}
	}
}
</script>

<style scoped>

.left-panel-container {
	font-family: 'Open Sans';
}

.right-panel-container {
	height: 570px;
	font-family: 'Lato';
}

.alert-container {
	margin-top: 90px;
	text-align: center;
}

.bottom-bar-right button {
	margin: 2px;
}
</style>
