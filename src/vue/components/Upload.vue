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
			
			<upload-target style='margin-top:50px' v-show='!hasFiles'>
			</upload-target>

			<div style='position:absolute; bottom:10px; right: 10px; text-align:right'>
				<!--<button class='btn btn-primary' v-on:click=''>Upload</button>-->
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
		}
	},
	mounted() {
		//console.log('Upload component mounted')
	},
	updated() {
		console.log('Upload component updated')
	},
	methods: {
		deleteFiles() {

		}
	},
	route: {
		activate() { console.log('activate')
			this.$forceUpdate()
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