<template>
	<div class='leftPanel'>
		<table> 
			<thead>
				<tr>
					<th style='width:70%'>TOOL</th>
					<th style='width:30%; text-align: right;'>SIZE</th>
				</tr>
			</thead>
			<tbody>
				<tr v-for='tool in tools'
					  v-bind:style='tool.name==currTool.name ? styles.activeTr : styles.inactiveTr' 
					  v-on:click='setCurrTool(tool.name)'>
					<td>{{ tool.name }}</td>
					<td v-bind:style='tool.name==currTool.name ? styles.activeTd : styles.inactiveTd' style="text-align: right">{{ tool.size }}</td>
				</tr>
			</tbody>
		</table>
	</div>
</template>
<script>
const activeTool = {
	'color' :'#010304',
	'font-size': '14pt',
	'background-color':'rgba(19,129,179,0.3)',
}
const inactiveTool = {
	color:'#a3a3a3',
	'font-size': '14pt',
	'background-color':'transparent'
}

export default {
	data() {
		return {
			styles: {
				activeTr: {
					'color':'#010304',
					'background-color':'rgba(145,202,251,0.3)'
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
		if (this.$store.getters.environment !== 'dev') {
			window.dx.getToolsInformation((results) => {
				if (results.length > 0) {
					this.$store.commit("setTools", results);
					this.$store.commit("setCurrToolName", results[0].name);
				}
			});
		}
	},
	updated() {},
	computed: {
		currTool() {
			return this.$store.getters.currTool
		},
		tools() {
			return this.$store.getters.tools
		},
		environment() {
			return this.$store.getters.environment
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
.leftPanel {
	height: 560px;
	border: 3px solid #ececec;
	padding: 0px;
}

.leftPanel table {
	width: 100%;
	table-layout: fixed;
	margin-top: 20px;
}

.leftPanel table thead {
	font-size: 10pt;
	color: #a3a3a3;
}

.leftPanel table tbody {
	font-size: 13pt;
}

.leftPanel table tbody tr {
	height: 70px;
}

th {
	padding: 10px;
}

td {
	padding: 10px;
	cursor: pointer;
}
</style>
