<template>
	<div class="row">
		<div class="dev-box" v-show="environment == 'dev'">
			<select @change="setInstallingDxToolkit($event.target.value)">
				<option>waiting</option>
				<option>installing</option>
				<option>completed</option>
				<option>failed</option>
			</select>
		</div>
		<div class='col-xs-12 main'>
			<div class="theater-heading">
				<h1>Install</h1> 
				<hr>
			</div>
			<div v-show="installingDxToolkit == 'waiting' " class='theater-body'>
				<div class="col-xs-6 theater-body-img"> 
					<img src="img/screen-download.png">
				</div>
				<div class="col-xs-6">
					<div class="theater-body-text">
						The St. Jude Cloud desktop application requires the installation of third-party software. We'll take care of installing that for you. 
						<div class="info-icon-wrapper-div" @click="showModal()">
							<i class="material-icons info-icon">info</i>
						</div>
					</div>
					<div @click="downloadDxToolkit()" 
						class="btn btn-large btn-stjude"
						style="width:auto">
						INSTALL
					</div>
				</div>
			</div>
			<div v-show="installingDxToolkit == 'installing'" class='theater-body'>
				<spin-kit :status='downloadStatus' :btmLabel='downloadStatus'></spin-kit>
			</div>
			<div v-show="installingDxToolkit == 'completed'" class='theater-body'>
				<div class="col-xs-12">
					<step-outcome successMessage='Completed!' outcome='done'></step-outcome>
				</div>
			</div>
			<div v-show="installingDxToolkit == 'failed'" class='theater-body'>
				<div class="col-xs-12">
					<step-outcome failureMessage='Failed!' outcome='error'></step-outcome>
				</div>
			</div>
		</div>
		<div class='col-xs-12 footer'>
			<div class='progress'>
				<div class='progress-bar progress-bar-div'></div>
				<div class='progress-node progress-node-active'>1</div>
				<div class='progress-node progress-node-nonactive' style='margin-left: 142px'>2</div>
				<div class='progress-node progress-node-nonactive' style='margin-left: 277px'>3</div>
			</div>
			<div class='progress-text'>
				<span style="left: 294px">Install</span>
				<span style="left: 435px">Log In</span>
				<span style="left: 565px">Upload</span>
			</div>
		</div>

		<toolkit-modal v-show='toolkitModalVisibility'></toolkit-modal>
	</div>
</template>

<script>
import StepOutcome from './StepOutcome.vue'
import SpinKit from './SpinKit.vue'
import ToolkitModal from './ToolkitModal.vue'

export default {
	components: {
		StepOutcome,
		SpinKit,
		ToolkitModal
	},
	data() {
		return {
			openModal: false
		}
	},
	computed: {
		installingDxToolkit() {
			return this.$store.getters.installingDxToolkit;
		},
		environment() {
			return this.$store.getters.environment;
		},
		downloadStatus() {
			return this.$store.getters.downloadStatus;
		},
		toolkitModalVisibility() {
			return this.$store.getters.modalVisibility('toolkit')
		}
	},
	methods: {
		setInstallingDxToolkit(installing) {
			this.$store.commit('setInstallingDxToolkit', installing);
		},
		setDownloadStatus(status) {
			this.$store.commit('setDownloadStatus', status);
		},
		downloadDxToolkit() {
			this.$store.commit('setInstallingDxToolkit', "installing");
			var that = this;

			window.dx.install(function (percent, text) {
				that.setDownloadStatus(text);
			}, 
			function (text) {
				that.setDownloadStatus(text);
			},
			function (err, result) {
				if (err) {
					that.$store.commit('setInstallingDxToolkit', "failed");
				} else {
					that.$store.commit('setInstallingDxToolkit', "completed");
					setTimeout(function (){
						that.$router.push('login');
					}, 2500);
				}

				return result;
			});
		},
		showModal() {
			this.$store.commit('showModal','toolkit')
		}
	}
}
</script>

<style scoped>
.row {
	margin: 0px;
}

.dev-box {
	position: absolute;
	left: 750px;
	top: 20px;
	z-index: 1;
}

.main {
	margin-bottom: 50px;
}

.theater-heading {
	margin: 0px 45px 0px 45px;
}

.theater-heading > h1 {
	margin-top: 35px;
	font-style: 'Open Sans', 'Helvetica Neue';
	font-size: 36px;
	color: #000000;
}

.theater-heading > hr {
	margin: 10px 0px 10px 0px;
	float: center;
	border-top: 2px solid #dedede;
	width: 780px;
}

.theater-body {
	margin: 35px 40px 0px 45px;
	text-align: center;
	font-style: 'Open Sans', 'Helvetica Neue';
	font-size: 24px;
	height: 300px;
}

.theater-body .btn {
	margin: 35px 0px 50px 0px;
	width: 145px;
	font-size: 24px;
}

.footer {
	position: absolute;
	top: 545px;
	left: -10px;
}

.footer .progress {
	width: 300px;
	height: 4pt;
	float: center;
	margin: 0 auto;
	margin-bottom: 25px;
}

.footer .progress-bar {
	background-color: #158cba;
}

.footer .progress-node {
	position: absolute;
	margin-top: -20px;
	z-index: 1;
	height: 45px;
	width: 45px;
	border: 3px solid #1381b3;
	border-radius: 25px;
	line-height: 40px;
	font-size: 26px;
	text-align: center;
}

.footer .progress-node-active{
	color: #FFFFFF;
	background-color: #158cba;
}

.footer .progress-node-nonactive{
	color: #158cba;
	background-color: #FFFFFF;
}

.footer .progress-text span{
	position: absolute;
	color: #158cba;
	font-size: 16pt;
}

.info-icon-wrapper-div {
	display: inline-block;
	vertical-align:top;
	padding: 3px 0 0 0; 
	overflow: hidden;
    margin: 0;
    height: 30px;
}

.theater-body-img {
  margin-top: 35px;
}

.theater-body-text {
  margin-top: 15px;
}

.info-icon {
  color: #018dc4;
  cursor: pointer;
}

.progress-bar-div {
  width: 100%;
}
</style>
