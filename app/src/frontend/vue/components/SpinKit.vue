<template>
	<div class="col-xs-12">
		<div class="loading-text"
         v-bind:style='textStyle'>
         {{ topLabel }}
    </div>
		<div class="spinner-wrapper">
			<q-spinner-oval :size='100' />
		</div>
		<div class="loading-text"
         v-bind:style='textStyle'>
         {{ btmLabel }}
    </div>
    <q-progress v-show='percentage>0' :percentage="percentage" style='width: 500px; margin: auto' />
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
  margin-bottom: 30px;
  width: 120px;
  height: 120px;
  position: relative;
}
</style>