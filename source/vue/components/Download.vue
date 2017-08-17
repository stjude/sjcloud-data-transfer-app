<template>
	<div class='row'>
		<div class='col-xs-4'>
			<left-panel></left-panel>
		</div>
		
		<div class='col-xs-8 rightPanel' style='height:100%;'>
			<nav-bar style="margin-top:18px;"></nav-bar>
			
			<file-status
				style='max-height:500px; overflow:scroll;'
				v-show='hasFiles'>
			</file-status>
			
			<div style='position:absolute; bottom:10px; right: 10px; text-align:right'>
				<button class='btn btn-primary' 
					v-bind:disabled='!checkedFiles.length'
					v-on:click='downloadFiles'>
					Download
				</button>
				<button class='btn btn-danger' v-on:click='deleteFiles'>Delete</button>
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
	data() {
		return {}
	},
	computed: {
		hasFiles() {
			return this.$store.getters.currFiles.length
		},
		checkedFiles() {
			return this.$store.getters.checkedFiles
		}
	},
	mounted() {
		//console.log('Download component mounted')
	},
	updated() {
		//console.log('Upload component updated')
	},
	methods: {
		downloadFiles() {
			this.$store.commit('downloadFiles')
		},
		deleteFiles() {

		}
	}
}
</script>

<style scoped>
.row {
	margin-left:0;
	margin-right:0;
}
</style>