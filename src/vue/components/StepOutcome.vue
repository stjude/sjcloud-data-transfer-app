<template>
	<div>
		<div v-show='outcome=="done"'>
			<div style="margin-top: 20px">
				<i class='material-icons'
				style="font-size: 120pt;font-weight: 700; color: #4F8A10;">
					done
				</i>
			</div>
			<div class="status-text" v-bind:style='textStyle'>
				{{ successMessage }}
				<info-tooltip v-show='tooltipText.length && tooltipText!="_empty_tip_"'
								      :tooltipText="tooltipText"></info-tooltip>
			</div>
		</div>
		<div v-show='outcome=="error"'>
			<div style="margin-top: 20px">
				<i class='material-icons'
				style="font-size: 120pt; color: #b71c1c">
					error_outline
				</i>
			</div>
			<div class="status-text" v-bind:style='textStyle'>
				{{ failureMessage }}
				<info-tooltip v-show='tooltipText.length && tooltipText!="_empty_tip_"'
							        :tooltipText="tooltipText"></info-tooltip>
			</div>
		</div>
	</div>
</template>

<script>
import InfoTooltip from './InfoTooltip.vue';

export default {
	components: {
		InfoTooltip,
	},
	props: {
		'tooltipText': {
			default: ''
		},
		'outcome': {
			default: ''
		},
		'successMessage': {
			default: ''
		},
		'failureMessage': {
			default: ''
		},
		'textStyle': {
			default: () => {
				return {
					'font-size': '32pt',
				}
			}	
		}
	}
}
</script>
