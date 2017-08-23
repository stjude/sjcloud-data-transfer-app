<template>
	<div class='row'>
		<div class='col-xs-4 left-panel-container'>
			<left-panel></left-panel>
		</div>
		<div class='col-xs-8 rightPanel'>
			<nav-bar></nav-bar>
			
			<file-status class="middle" v-show='hasTools && hasFiles'></file-status>
			<!-- <upload-target class="middle" v-show='hasTools && !hasFiles'></upload-target> -->
			<dropzone class="middle" v-show='hasTools && !hasFiles'></dropzone>

			<div class="bottom-bar" v-show="hasTools && hasFiles">
				<div class="bottom-bar-left"></div>
				<div class="bottom-bar-right">
					<button class='btn btn-primary btn-stjude download-btn'
						    v-bind:disabled='!checkedFiles.length'>
						    <!-- v-on:click='downloadFiles'> -->
						Upload
					</button>
					<button class='btn btn-danger btn-stjude-warning cancel-btn'
						    v-bind:disabled='!checkedFiles.length'>
						    <!-- v-on:click='cancelFiles'> -->
							Cancel
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

export default {
	components: {
		LeftPanel,
		NavBar,
		FileStatus,
		UploadTarget,
		Dropzone
	},
	data() {
		return {}
	},
	computed: {
		hasFiles() {
			return this.$store.getters.currFiles.length
		},
		hasTools() {
			return this.$store.getters.tools.length
		},
		checkedFiles() {
			return this.$store.getters.checkedFiles
		},
	},
	mounted() {
		//console.log('Upload component mounted')
	},
	updated() {
		console.log('Upload component updated')
	},
	methods: {
		uploadFiles() {
			this.$store.commit('trackProgress')
		},
		deleteFiles() {

		}
	}
}
</script>

<style scoped>


</style>
