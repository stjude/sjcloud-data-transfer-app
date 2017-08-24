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
									  v-bind:disabled='!hasFilesInStaging'>
							<!-- v-on:click='downloadFiles'> -->
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

			<div v-show='transferComplete' style='margin-top:100px; text-align:center'>
				<step-outcome successMessage='Upload complete!' outcome='done'></step-outcome>
				<div style="margin-top:30px">
					<button class='btn btn-primary'>
						<i class='material-icons' style='vertical-align:bottom'>open_in_browser</i>
						READY TO RUN
					</button>
					<button class='btn btn-primary' v-on:click='resetCheckedFiles'>
						<i class='material-icons' style='vertical-align:bottom'>cloud_upload</i>
						UPLOAD MORE DATA
					</button>
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
			this.$store.commit('trackProgress')
		},
		removeCheckedFiles() {
			this.$store.commit('removeCheckedFiles');
		},
		resetCheckedFiles() {
			console.log('resetCheckedFiles')
			//this.$store.commit('resetCheckedFiles')
		}
	}
}
</script>

<style scoped>
.right-panel-container {
	height: 570px;
}

.alert-container {
	margin-top: 90px;
	text-align: center;
}

.bottom-bar-right button {
	margin: 2px;
}
</style>
