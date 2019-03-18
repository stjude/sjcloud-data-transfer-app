<template>
	<div class="col-xs-12">
		<div class="loading-text"
         v-bind:style='textStyle'>
         {{ topLabel }}
    </div>
		<div v-if='percentText' class="spinner-wrapper">
      <div class='spinner-pct-container'>
        <span class='spinner-pct-text'>
          {{ percentText }}
        </span>
      </div>
			<q-spinner-oval :size='110' style='color: #1874dc'/>
		</div>
    <div v-else class='spinner-wrapper-no-text'>
      <q-spinner-oval :size='55' style='color: #1874dc'/>
    </div>
		<div class="loading-text"
         v-bind:style='textStyle'>
         {{ btmLabel }}
    </div>
	</div>
</template>

<script>
import { QSpinnerOval, QProgress} from 'quasar';

export default {
  components: {
    QSpinnerOval,
    QProgress
  },
	props: {
    topLabel: {
      default:''
    },
    btmLabel: {
      default:''
    },
    percentage: {
      default: ""
    },
    textStyle: {
      default: () => {
        return {
        'font-size': '32pt',
        'text-align': 'center',
        }
      }
    }
	},
  computed: {
    percentText() {
      return this.percentage || this.percentage===0 ? this.percentage+"%" : ""
    },
    spinnerSize() {
      return this.percentage || this.percentage===0 ? 110 : 55
    }
  }
}
</script>

<style scoped>
.spinner-wrapper {
  margin: 0px auto;
  margin-top: 40px;
  margin-bottom: 10px;
  width: 120px;
  height: 120px;
  position: relative;
}

.spinner-wrapper-no-text {
  margin: 0px auto;
  margin-top: 40px;
  margin-bottom: 10px;
  width: 100%;
  text-align: center;
}

.spinner-pct-container {
  position: absolute;
  width: 100%; 
  height: 110px; 
  text-align: center;
}

.spinner-pct-text {
  font-size: 30px;
  line-height: 110px;
  vertical-align: middle;
  color: #1874dc;
}
</style>