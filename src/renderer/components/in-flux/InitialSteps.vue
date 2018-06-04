<template>
	<div class='q-stepper-wrapper'>
		<q-stepper v-if='stepper==1' ref='stepper'>
			<q-step title="Install" name='install' key='initSteps' active-icon='file download'>
				Nothing to do.
			</q-step>

			<q-step title="Login" name='login' key='initSteps' active-icon='vpn key'>
				<log-in></log-in>
			</q-step>
			<q-step title="Upload" name='upload' key='initSteps' active-icon='timelapse'>
				You are ready to upload.
			</q-step>
		</q-stepper>

		<log-in v-if="currPath=='login' && !stepper"></log-in>

		<div v-if='!stepper' class='col-xs-12 footer'>
			<div class='progress'>
				<div class='progress-bar progress-bar-div'></div>
				<div class='progress-node progress-node-active'>1</div>
				<div :class='step2IconCls' style='margin-left: 142px'>2</div>
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
import { QStepper, QStep, QTransition } from 'quasar';
import LogIn from './LogIn.vue';

export default {
  components: {
    QStepper,
    QStep,
    LogIn,
    QTransition,
  },
  computed: {
    environment() {
      return this.$store.getters.environment;
    },
    currPath() {
      if (this.$store.getters.currPath == 'login' && this.stepper) {
        this.$refs.stepper.goToStep('login');
      }
      return this.$store.getters.currPath;
    },
    step2IconCls() {
      return this.$store.getters.currPath == 'install'
        ? 'progress-node progress-node-nonactive'
        : 'progress-node progress-node-active';
    },
    stepper() {
      return window.location.search.includes('stepper=1'); //&& this.$refs.stepper
    },
  },
  updated() {
    if (this.$store.getters.currPath == 'login' && this.stepper) {
      this.$refs.stepper.goToStep('login');
    }
  },
};
</script>

<style>
.row {
  margin: 0px;
}

.main {
  margin-bottom: 50px;
}

.stjude-link {
  cursor: pointer;
  color: #931638;
  font-weight: bold;
  font-size: 14px;
  /* text-decoration: underline; */
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

.progress-bar-div {
  width: 100%;
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

.footer .progress-node-active {
  color: #ffffff;
  background-color: #158cba;
}

.footer .progress-node-nonactive {
  color: #158cba;
  background-color: #ffffff;
}

.footer .progress-text span {
  position: absolute;
  color: #158cba;
  font-size: 16pt;
}

.theater-body-img {
  margin-top: 35px;
}

.theater-body-text {
  margin-top: 40px;
}

.q-stepper {
  box-shadow: none;
}

.q-stepper-header {
  position: absolute;
  bottom: 20px;
  width: 50%;
  margin-left: 25%;
  text-align: center;
}
</style>
