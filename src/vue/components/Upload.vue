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
						        v-bind:disabled='!hasFilesInTransit'
										@click="cancelCheckedFiles()">
							Cancel
						</button>
					</div>
				</div>
			</div>

			<div v-show='transferComplete && hasFiles' style='margin-top:100px; text-align:center'>
				<step-outcome successMessage='Upload complete!' outcome='done'></step-outcome>
				<div style="margin-top:30px">
					<button class='btn btn-stjude'
							style='margin-right:24px; font-size:22px;'
					        v-show="currTool && currTool.isSJCPTool"
					        v-on:click="openExternal(currTool.SJCPToolURL)">
						<i class='material-icons' 
							style='vertical-align:bottom; font-size:28px'>
							open_in_browser
						</i>
						READY TO RUN
					</button>
					<button class='btn btn-stjude' 
						style='font-size:22px;'
						v-on:click='removeAllFiles'>
						<i class='material-icons' 
							style='vertical-align:bottom; font-size:28px'>
							cloud_upload
						</i>
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
		currTool() {
			return this.$store.getters.currTool
		},
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
		openExternal(url) {
			window.utils.openExternal(url);
		},
		uploadFiles() {
			const files = this.$store.getters.currTool.upload.filter((f) => f.checked);
			const dnanexusProjectId = this.$store.getters.currTool.dx_location;
			const concurrency = this.$store.getters.concurrentOperations;
			console.log("Uploading", files.length, "files with a concurrency of", concurrency);

			files.forEach(function(file) {
				file.waiting = true;
				file.checked = false;
				file.started = false;
				file.cancelled = false;
				file.errored = false;
				file.finished = false;
			});

			mapLimit(files, concurrency, (file, callback) => {
				file.started = true;
				let process = window.dx.uploadFile(file, dnanexusProjectId,
					(progress) => {
						if (!file.cancelled) {
							file.status = progress
						}
					},
					(err, result) => {
						file.status = 100;

						if (err) {
							if (file.cancelled) {
								file.status = 0;
								file.started = false;
								file.waiting = false;
								file.finished = false;
								file.errored = false;
								file.checked = false;
								return callback(null, result);
							} else {
								file.errored = true;
								file.finished = true;
								return callback(err, null);
							}
						}

						setTimeout(() => {
							file.finished = true;
							file.checked = true;
							return callback(err, result);
						}, 1000);
					}
				);

				this.$store.commit('addOperationProcess', {
					filename: file.name,
					process
				});
			});
		},
		removeCheckedFiles() {
			this.$store.commit('removeCheckedFiles');
		},
		removeAllFiles() {
			this.$store.commit('removeAllFiles');
		},
		cancelCheckedFiles() {
			this.$store.commit('cancelCheckedFiles');
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
