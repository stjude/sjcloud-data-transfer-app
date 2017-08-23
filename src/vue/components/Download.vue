<template>
	<div class='row'>
		<div class='col-xs-4 left-panel-container'>
			<left-panel></left-panel>
		</div>
		
		<div class='col-xs-8 right-panel-container'>
			<nav-bar></nav-bar>
			<file-status v-show="hasTools && hasFiles"></file-status>
			<div class="no-files-container" v-show="hasTools && !hasFiles">
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
			window.utils.openFileDialog(
				(files) => {
					if (files.length > 0) {
						this.$store.commit('setDownloadLocation', files[0]);
					}
				}, 
				defaultLocation
			);
		},
		downloadFiles() {
			this.$store.getters.currTool.download.forEach((elem) => {
				if (elem.checked) {
					window.dx.downloadFile(this.$store.getters.downloadLocation,
										   elem.name,
										   elem.raw_size,
										   elem.dx_location,
										   function(progress) {
											   elem.status = progress;
										   },
										   function(err, result) {
											   elem.finished = true;
										   });
				}
			});
		},
		cancelFiles() {}
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

#downloadTextInput {
	height: 45px;
	width: 350px;
	padding-left: 10px;
	font-size: 12pt;
}

.no-files-container {
	margin-top: 90px;
	text-align: center;
}
</style>
