<template>
	<div class="row">
		<div class="dev-box" v-show="environment == 'dev'">
			<select @change="setLoginState($event.target.value)">
				<option>waiting</option>
				<option>completed</option>
				<option>failed</option>
				<option>validating</option>
			</select>
		</div>
		<div class='col-xs-12 main'>
			<div class="theater-heading">
				<h1>Log In</h1> 
				<hr>
			</div>
			<div v-show="loginState == 'waiting' " class='theater-body'>
				<div class="col-xs-6" style="margin-top: 35px">
					<img src="img/screen-login.png">
				</div>
				<div class="col-xs-6">
					<div style="margin-top: 40px;">
						Next, you'll need to log in to DNAnexus so that we can access your input and output files.
					</div>
					<div @click="external()" 
						class="btn btn-large btn-stjude" 
						style="margin-bottom: 10px; width:auto">
						LOG IN WITH DNANEXUS
					</div>
					<div style="margin-top: -10px;">
						<a class="stjude-link" @click="internal()">I'm a St. Jude employee</a>
					</div>
				</div>
			</div>
			<div v-show="loginState == 'validating'" class='theater-body'>
				<spin-kit :status='validating' :btmLabel='validating'></spin-kit>
			</div>
			<div v-show="loginState == 'completed'" class='theater-body'>
				<div class="col-xs-12">
					<step-outcome successMessage='Authenticated!' outcome='done' tooltipText='_empty_tip_'></step-outcome>
				</div>
			</div>
			<div v-show="loginState == 'failed'" class='theater-body'>
				<div class="col-xs-12">
					<step-outcome failureMessage='Failed!' outcome='error' tooltipText='_empty_tip_'></step-outcome>
					<div style="margin-top: 20px">
						<div @click="setLoginState('waiting')" class="btn btn-large btn-stjude" style="margin-top:20px">Retry</div>
					</div>
				</div>
			</div>
		</div>
		<div v-show="loginState != 'failed'" class='col-xs-12 footer'>
			<div class='progress'>
				<div class='progress-bar' style='width: 100%'></div>
				<div class='progress-node progress-node-active'>1</div>
				<div class='progress-node progress-node-active' style='margin-left: 142px'>2</div>
				<div class='progress-node progress-node-nonactive' style='margin-left: 277px'>3</div>
			</div>
			<div class='progress-text'>
				<span style="left: 294px">Install</span>
				<span style="left: 435px">Log In</span>
				<span style="left: 565px">Upload</span>
			</div>
		</div>
	</div>
</template>

<script>
import StepOutcome from './StepOutcome.vue'
import SpinKit from './SpinKit.vue'

export default {
	components: {
		StepOutcome,
		SpinKit
	},
	data: () => {
		return {
			validating: "Validating..."
		}
	},
	computed: {
		loginState() {
			return this.$store.getters.loginState;
		},
		environment() {
			return this.$store.getters.environment;
		},
		token: {
			get () {
			  return this.$store.getters.token;
			},
			set (value) {
			  this.$store.commit('setToken', value)
			}
		  }
	},
	methods: {
		setLoginState(state) {
			this.$store.commit('setLoginState', state);
		},
		setToken(token) {
			this.$store.commit('setToken', token);
		},
		internal() {
			window.oauth.getToken(true, (err, token) => {
				this.$store.commit('setToken', token);
				this.$store.commit('setLoginState', 'validating');

				if (err) {
					console.error("Error retrieving token:". token);
					this.$store.commit('setLoginState', 'failed');
					return;
				}
			
				window.dx.login(token, (err, result) => {
					if (err) {
						this.$store.commit('setLoginState', 'failed');
					} else {
						this.$store.commit('setLoginState', 'completed');
						setTimeout(() => {
							this.$router.push('upload');
						}, 2500);
					}
				});
			});
		},
		external(openURL=true) {
			window.oauth.getToken(false, (err, token) => {
				this.$store.commit('setToken', token);
				this.$store.commit('setLoginState', 'validating');
			
				const that = this;

				window.dx.login(token, function (err, result) {
					if (err) {
						that.$store.commit('setLoginState', 'failed');
					} else {
						that.$store.commit('setLoginState', 'completed');
						setTimeout(function (){
							that.$router.push('upload');
						}, 2500);
					}
				});
			});
		},
	}
}
</script>

<style scoped>
.row {
	margin: 0px;
}

.dev-box {
	position: absolute;
	left: 675px;
	top: 20px;
	z-index: 1;
}

.main {
	margin-bottom: 50px;
}

.stjude-link {
	color: #931638;
	font-weight: bold;
	font-size: 14px;
	/* text-decoration: underline; */
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
	margin: 35px 45px 0px 45px;
	text-align: center;
	font-style: 'Open Sans', 'Helvetica Neue';
	font-size: 24px;
	height: 310px;
}

.theater-body .btn {
	margin: 35px 0px 50px 0px;
	width: 145px;
	font-size: 24px;
}

.login-option {
	height: 310px;
}

.login-option .login-option-content {
	height: 310px;
	width: 300px;
	margin: 0px auto;
	border: 3px solid #dedede;
	border-radius: 15px;
}

.login-option .login-option-content .login-option-title {
	position: absolute;
	font-size: 18px;
	width: 80px;
	margin-top: -14px;
	margin-left: 16px;
	background: #FFFFFF;
	z-index: 1;
}

.login-option .login-option-content .login-option-body {
	margin-top: 30px;
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
</style>
