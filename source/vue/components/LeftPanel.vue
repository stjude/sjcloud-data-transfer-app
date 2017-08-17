<template>
	<div class='col-xs-4 leftPanel' style='height:550px; border:3px solid #ececec; padding-left: 0px; padding-right: 0px;'>
		<table style='width:100%; margin-top: 20px'>
			<thead>
				<tr style='color:#a3a3a3;'>
					<th style='width:70%;font-size:10pt;'>TOOL</th>
					<th style='text-align:center;width:30%;font-size:10pt;'>SIZE</th>
				</tr>
			</thead>
			<tbody style="font-size: 15pt">
				<tr v-for='tool in tools'
					v-bind:style='tool.name==currTool.name ? styles.activeTr : styles.inactiveTr' 
					v-on:click='setCurrTool(tool.name)'>
					<td v-bind:style=''>{{ tool.name }}</td>
					<td v-bind:style='tool.name==currTool.name ? styles.activeTd : styles.inactiveTd'>{{ tool.size }} GB</td>
				</tr>
			</tbody>
		</table>
	</div>
</template>
<script>
const activeTool = {
	'color' :'#010304',
	'font-size': '16pt',
	'background-color':'rgba(19,129,179,0.3)',
}
const inactiveTool = {
	color:'#a3a3a3',
	'font-size': '16pt',
	'background-color':'transparent'
}

export default {
	data() {
		return {
			styles: {
				activeTr: {
					'color':'#010304',
					'background-color':'rgba(19,129,179,0.3)'
				},
				inactiveTr: {
					'color':'#a3a3a3',
					'background-color':'transparent'
				},
				activeTd: {
					'text-align':'center',
					'border-right':'4px solid #1381B3'
				},
				inactiveTd: {
					'text-align':'center',
					'border-right':''
				}
			}
		}
	},
	created() { 
		//console.log('leftPanel created')
	},
	computed: {
		currTool() {
			return this.$store.getters.currTool
		},
		tools() {
			return this.$store.getters.tools
		}
	},
	methods: {
		setCurrTool(toolName) {
			this.$store.commit('setCurrToolName',toolName)
		}
	}
}

</script>

<style scoped>
th {
	padding: 10px;
}
td {
	padding: 10px;
	cursor: pointer;
}
</style>
