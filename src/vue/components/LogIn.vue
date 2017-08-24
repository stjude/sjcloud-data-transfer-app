<template>
	<div class="row">
		<div class="dev-box" v-show="environment == 'dev'">
			<b>State:</b> {{loginState}}
			<select @change="setLoginState($event.target.value)">
				<option>waiting</option>
				<option>completed</option>
				<option>failed</option>
				<option>waiting-2</option>
				<option>token</option>
			</select>
		</div>
		<div class='col-xs-12 main'>
			<div class="theater-heading">
				<h1>Log In</h1> 
				<hr>
			</div>
			<div v-show="loginState == 'waiting' " class='theater-body'>
				<div class="col-xs-6">
					<img src="http://via.placeholder.com/350x300">
				</div>
				<div class="col-xs-6">
					<div style="margin-top: 40px;">
						Next, you'll need to log in to DNAnexus so that we can access your input and output files.
					</div>
					<div @click="external()" class="btn btn-large btn-stjude" style="margin-bottom: 10px">Log In</div>
					<div>
						<a class="stjude-link" @click="internal()">I'm a St. Jude employee</a>
					</div>
				</div>
			</div>
			<div v-show="loginState == 'validating'" class='theater-body'>
				<div class="col-xs-12">
					<div id="status-text">Validating...</div>
					<div class="sk-circle">
						<div class="sk-circle1 sk-child"></div>
						<div class="sk-circle2 sk-child"></div>
						<div class="sk-circle3 sk-child"></div>
						<div class="sk-circle4 sk-child"></div>
						<div class="sk-circle5 sk-child"></div>
						<div class="sk-circle6 sk-child"></div>
						<div class="sk-circle7 sk-child"></div>
						<div class="sk-circle8 sk-child"></div>
						<div class="sk-circle9 sk-child"></div>
						<div class="sk-circle10 sk-child"></div>
						<div class="sk-circle11 sk-child"></div>
						<div class="sk-circle12 sk-child"></div>
					</div>	
				</div>
			</div>
			<div v-show="loginState == 'completed'" class='theater-body'>
				<div class="col-xs-12">
					<step-outcome successMessage='Authenticated!' outcome='done'></step-outcome>
				</div>
			</div>
			<div v-show="loginState == 'failed'" class='theater-body'>
				<div class="col-xs-12">
					<step-outcome failureMessage='Failed!' outcome='error'></step-outcome>
					<div style="margin-top: 20px">
						<div @click="external(false)" class="btn btn-large btn-stjude-warning" style="margin-top:20px">Retry</div>
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

export default {
	components: {
		StepOutcome
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
				console.log(token);
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
		external(openURL=true) {
			window.oauth.getToken(false, (err, token) => {
				this.$store.commit('setToken', token);
				console.log(token);
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

	/**
	 * Graciously taken from SpinKit and adapted for our needs
	 *
	 * http://tobiasahlin.com/spinkit/
	 *
	 **/

	.sk-circle {
	  margin: 0px auto;
	  margin-top: 50px;
	  margin-bottom: 100px;
	  width: 120px;
	  height: 120px;
	  position: relative;
	}
	.sk-circle .sk-child {
	  width: 100%;
	  height: 100%;
	  position: absolute;
	  left: 0;
	  top: 0;
	}
	.sk-circle .sk-child:before {
	  content: '';
	  display: block;
	  margin: 0 auto;
	  width: 15%;
	  height: 15%;
	  background-color: #333;
	  border-radius: 100%;
	  -webkit-animation: sk-circleBounceDelay 1.2s infinite ease-in-out both;
	  animation: sk-circleBounceDelay 1.2s infinite ease-in-out both;
	}
	.sk-circle .sk-circle2 {
	  -webkit-transform: rotate(30deg);
	  -ms-transform: rotate(30deg);
	  transform: rotate(30deg);
	}
	.sk-circle .sk-circle3 {
	  -webkit-transform: rotate(60deg);
	  -ms-transform: rotate(60deg);
	  transform: rotate(60deg);
	}
	.sk-circle .sk-circle4 {
	  -webkit-transform: rotate(90deg);
	  -ms-transform: rotate(90deg);
	  transform: rotate(90deg);
	}
	.sk-circle .sk-circle5 {
	  -webkit-transform: rotate(120deg);
	  -ms-transform: rotate(120deg);
	  transform: rotate(120deg);
	}
	.sk-circle .sk-circle6 {
	  -webkit-transform: rotate(150deg);
	  -ms-transform: rotate(150deg);
	  transform: rotate(150deg);
	}
	.sk-circle .sk-circle7 {
	  -webkit-transform: rotate(180deg);
	  -ms-transform: rotate(180deg);
	  transform: rotate(180deg);
	}
	.sk-circle .sk-circle8 {
	  -webkit-transform: rotate(210deg);
	  -ms-transform: rotate(210deg);
	  transform: rotate(210deg);
	}
	.sk-circle .sk-circle9 {
	  -webkit-transform: rotate(240deg);
	  -ms-transform: rotate(240deg);
	  transform: rotate(240deg);
	}
	.sk-circle .sk-circle10 {
	  -webkit-transform: rotate(270deg);
	  -ms-transform: rotate(270deg);
	  transform: rotate(270deg);
	}
	.sk-circle .sk-circle11 {
	  -webkit-transform: rotate(300deg);
	  -ms-transform: rotate(300deg);
	  transform: rotate(300deg);
	}
	.sk-circle .sk-circle12 {
	  -webkit-transform: rotate(330deg);
	  -ms-transform: rotate(330deg);
	  transform: rotate(330deg);
	}
	.sk-circle .sk-circle2:before {
	  -webkit-animation-delay: -1.1s;
	  animation-delay: -1.1s;
	}
	.sk-circle .sk-circle3:before {
	  -webkit-animation-delay: -1s;
	  animation-delay: -1s;
	}
	.sk-circle .sk-circle4:before {
	  -webkit-animation-delay: -0.9s;
	  animation-delay: -0.9s;
	}
	.sk-circle .sk-circle5:before {
	  -webkit-animation-delay: -0.8s;
	  animation-delay: -0.8s;
	}
	.sk-circle .sk-circle6:before {
	  -webkit-animation-delay: -0.7s;
	  animation-delay: -0.7s;
	}
	.sk-circle .sk-circle7:before {
	  -webkit-animation-delay: -0.6s;
	  animation-delay: -0.6s;
	}
	.sk-circle .sk-circle8:before {
	  -webkit-animation-delay: -0.5s;
	  animation-delay: -0.5s;
	}
	.sk-circle .sk-circle9:before {
	  -webkit-animation-delay: -0.4s;
	  animation-delay: -0.4s;
	}
	.sk-circle .sk-circle10:before {
	  -webkit-animation-delay: -0.3s;
	  animation-delay: -0.3s;
	}
	.sk-circle .sk-circle11:before {
	  -webkit-animation-delay: -0.2s;
	  animation-delay: -0.2s;
	}
	.sk-circle .sk-circle12:before {
	  -webkit-animation-delay: -0.1s;
	  animation-delay: -0.1s;
	}
	@-webkit-keyframes sk-circleBounceDelay {
	  0%,
	  80%,
	  100% {
	    -webkit-transform: scale(0);
	    transform: scale(0);
	  }
	  40% {
	    -webkit-transform: scale(1);
	    transform: scale(1);
	  }
	}
	@keyframes sk-circleBounceDelay {
	  0%,
	  80%,
	  100% {
	    -webkit-transform: scale(0);
	    transform: scale(0);
	  }
	  40% {
	    -webkit-transform: scale(1);
	    transform: scale(1);
	}
}
</style>
