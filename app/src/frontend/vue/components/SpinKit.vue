<template>
	<div class="col-xs-12">
		<div class="loading-text"
         v-bind:style='textStyle'>
         {{ topLabel }}
    </div>
		<div class="spinner-wrapper">
      <div class='spinner-pct-container'>
        <span class='spinner-pct-text'>
          {{ percentage }}%
        </span>
      </div>
			<q-spinner-oval :size='100' />
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
      default: 0
    },
    textStyle: {
      default: () => {
        return {
        'font-size': '32pt',
        'text-align': 'center',
        }
      }
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

.spinner-pct-container {
  position: absolute;
  width: 100%; 
  height: 100px; 
  text-align: center;
}

.spinner-pct-text {
  font-size: 30px;
  line-height: 100px;
  vertical-align: middle;
}
</style>