<template>
	<div class="row">
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
				<spin-kit :status='downloadStatus' :btmLabel='downloadStatus' :percentage='percentage'></spin-kit>
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
		<toolkit-modal v-show='toolkitModalVisibility'></toolkit-modal>
	</div>
</template>

<script>
import StepOutcome from "./StepOutcome.vue";
import SpinKit from "./SpinKit.vue";
import ToolkitModal from "./ToolkitModal.vue";

export default {
  components: {
    StepOutcome,
    ToolkitModal,
    SpinKit
  },
  data() {
    return {
      openModal: false,
      percentage: 0
    };
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
      return this.$store.getters.modalVisibility("toolkit");
    }
  },
  mounted() {
    this.$store.commit("setTourHint", true);
  },
  methods: {
    setInstallingDxToolkit(installing) {
      this.$store.commit("setInstallingDxToolkit", installing);
    },
    setDownloadStatus(status) {
      this.$store.commit("setDownloadStatus", status);
    },
    downloadDxToolkit() {
      this.$store.commit("setInstallingDxToolkit", "installing");

      window.dx.installDxToolkit(
        ([percent, text]) => {
          this.setDownloadStatus(text);
          this.percentage=100*percent;
        },
        (err, result) => {
          if (err) {
            this.setDownloadStatus(text);
            this.$store.commit("setInstallingDxToolkit", "failed");
          } else {
            this.$store.commit("setInstallingDxToolkit", "completed");
            setTimeout(()=>{
              this.$router.push("login");
            }, 2500);
          }
          return result;
        }
      );
    },
    showModal() {
      this.$store.commit("showModal", "toolkit");
    }
  }
};
</script>

<style scoped>
.info-icon-wrapper-div {
  display: inline-block;
  vertical-align: top;
  padding: 5px 0 0 0;
  overflow: hidden;
  margin: 0;
  height: 30px;
}


.info-icon {
  color: #018dc4;
  cursor: pointer;
}
</style>
