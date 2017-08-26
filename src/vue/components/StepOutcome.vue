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
			</div>
		</div>
		<div  v-show='outcome=="error"'>
			<div style="margin-top: 20px">
				<i class='material-icons'
				style="font-size: 120pt; color: #b71c1c">
					error_outline
				</i>
			</div>
			<div class="status-text" v-bind:style='textStyle'>
				{{ failureMessage }}
			</div>
		</div>
	</div>
</template>

<script>
export default {
	props: {
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
