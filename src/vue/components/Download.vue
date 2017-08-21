<template>
	<div class='row'>
		<div class='col-xs-4 left-panel-container'>
			<left-panel></left-panel>
		</div>
		
		<div class='col-xs-8 right-panel-container'>
			<nav-bar></nav-bar>
			<file-status v-show="hasFiles"></file-status>
			<div class="bottom-bar">

				<div class="bottom-bar-left">
					<input type="text" style="height: 45px; width: 350px;">
				</div>
				<div class="bottom-bar-right">
					<button class='btn btn-primary btn-stjude download-btn' 
						v-bind:disabled='!checkedFiles.length'
						v-on:click='downloadFiles'>
						Download
					</button>
					<button class='btn btn-danger btn-stjude-warning cancel-btn' v-on:click='deleteFiles'>Cancel</button>
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

.left-panel-container {
	padding: 0px;
}

.right-panel-container {
	height: 100%;
}

.bottom-bar {
	position: absolute;
	bottom: 20px;
	left: 10px;
	width: 570px;
	margin-left: 10px;
}

.bottom-bar-left {
	text-align: left;
	float: left;
}

.bottom-bar-right {
	text-align: right;
	float: right;
}
</style>
