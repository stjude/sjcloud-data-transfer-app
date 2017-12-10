<template>
	<div class="row">
		<div class='col-xs-12 main'>
			<div class="theater-heading">
				<h1>Log In</h1> 
				<hr>
			</div>
			<div v-show="loginState == 'waiting' " class='theater-body'>
				<div class="col-xs-6 theater-body-img">
					<img src="img/screen-login.png">
				</div>
				<div class="col-xs-6">
					<div class="theater-body-text">
						Next, you'll need to log in to DNAnexus so that we can access your input and output files.
					</div>
					<div id="dnanexus-login-btn"
            @click="external()" 
						class="btn btn-large btn-stjude">
						LOG IN WITH DNANEXUS
					</div>
					<div id="stjude-login-div">
						<a class="stjude-link" @click="internal()">I'm a St. Jude employee</a>
					</div>
				</div>
			</div>
			<div v-show="loginState == 'validating'" class='theater-body'>
				<spin-kit :status='validating' :btmLabel='validating'></spin-kit>
			</div>
			<div v-show="loginState == 'completed'" class='theater-body'>
				<div class="col-xs-12">
					<step-outcome successMessage='Authenticated!' outcome='done'></step-outcome>
				</div>
			</div>
			<div v-show="loginState == 'failed'" class='theater-body'>
				<div class="col-xs-12">
					<step-outcome failureMessage='Failed!' outcome='error'></step-outcome>
					<div id="retry-btn">
						<div @click="setLoginState('waiting')" class="btn btn-large btn-stjude" style="margin-top:20px">Retry</div>
					</div>
				</div>
			</div>
		</div>
	</div>
</template>

<script>
import StepOutcome from "./StepOutcome.vue";
import SpinKit from "./SpinKit.vue";

export default {
  components: {
    StepOutcome,
    SpinKit
  },
  data: () => {
    return {
      validating: "Validating..."
    };
  },
  computed: {
    loginState() {
      return this.$store.getters.loginState;
    },
    environment() {
      return this.$store.getters.environment;
    },
    token: {
      get() {
        return this.$store.getters.token;
      },
      set(value) {
        this.$store.commit("setToken", value);
      }
    }
  },
  mounted() {
    this.$store.commit('setInfoTipText',"");
  },
  methods: {
    setLoginState(state) {
      this.$store.commit("setLoginState", state);
    },
    setToken(token) {
      this.$store.commit("setToken", token);
    },
    internal() {
      window.oauth.getToken(true, (err, token) => {
        this.$store.commit("setToken", token);
        this.$store.commit("setLoginState", "validating");

        if (err) {
          console.error("Error retrieving token:".token);
          this.$store.commit("setLoginState", "failed");
          return;
        }

        const that = this;

        window.dx.login(token, (err, result) => {
          if (err) {
            // TODO(clay): alert login error.
            console.error(err);
            that.$store.commit("setLoginState", "failed");
          } else {
            that.$store.commit("setLoginState", "completed");
            setTimeout(() => {
              that.$store.dispatch("updateToolsFromRemote", true);
              setTimeout(() => {
                that.$router.push("upload");
              }, 2500);
            }, 1000);
          }
        });
      });
    },
    external(openURL = true) {
      window.oauth.getToken(false, (err, token) => {
        this.$store.commit("setToken", token);
        this.$store.commit("setLoginState", "validating");

        const that = this;

        window.dx.login(token, function(err, result) {
          if (err) {
            that.$store.commit("setLoginState", "failed");
          } else {
            that.$store.commit("setLoginState", "completed");
            setTimeout(() => {
              that.$store.dispatch("updateToolsFromRemote", true);
              setTimeout(() => {
                that.$router.push("upload");
              }, 2500);
            }, 1000);
          }
        });
      });
    }
  }
};
</script>

<style scoped>
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
  background: #ffffff;
  z-index: 1;
}

.login-option .login-option-content .login-option-body {
  margin-top: 30px;
}

#dnanexus-login-btn {
  margin-bottom: 10px;
  width: auto;
}

#stjude-login-div {
  margin-top: -10px;
}

#retry-btn {
  margin-top: 20px;
}
</style>
