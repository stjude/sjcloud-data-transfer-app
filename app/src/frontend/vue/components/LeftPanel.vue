<template>
	<div class='left-panel'>
		<div v-if="!hasTools && noProjectsFound">
			No projects found! Please create one!
		</div>
		<div v-else-if="!hasTools && !noProjectsFound">
			<spin-kit btmLabel='Loading...' 
								:textStyle="styles.loadingTextStyle"
                class="spin-kit-loading">
      </spin-kit>
		</div>
		<div v-else-if="hasTools">
			<div class="left-panel-table-container">
				<table id="sjcda-left-panel-table-header"> 
					<thead>
						<tr class="sjcda-left-panel-table-thead-tr">
							<th class="sjcda-left-panel-table-thead-tr-th-key">{{ showAllProjects ? "PROJECT" : "TOOL"}}</th>
							<th class="sjcda-left-panel-table-thead-tr-th-value">SIZE</th>
						</tr>
					</thead>
				</table>
				<table style='margin-top:40px'>
					<tbody>
						<tr v-for='tool in tools'
								v-bind:style='tool.dx_location == currTool.dx_location ? styles.activeTr : styles.inactiveTr' 
								v-on:click='setCurrTool(tool.dx_location)'>
							<td class="sjcda-left-panel-table-thead-tr-th-key">{{ tool.name }} <span v-show="tool.isSJCPTool" class="badge">TOOL</span></td>
							<td v-bind:style='tool.dx_location == currTool.dx_location ? styles.activeTd : styles.inactiveTd'>
								{{tool.size && tool.size !== 0 && tool.size !== '' ? tool.size : 'Loading...'}}
							</td>
						</tr>
					</tbody>
				</table>
			</div>
		</div>
	</div>
</template>
<script>
import SpinKit from './SpinKit.vue'

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
	components: {
		SpinKit
	},
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
					width: '30%',
					'text-align':'right',
					'border-right':'4px solid #1381B3'
				},
				inactiveTd: {
					width: '30%',
					'text-align':'right',
					'border-right':'4px solid #fff'
				},
				loadingTextStyle: {
					'font-size': '16pt',
					'text-align': 'center',
				}
			}
		}
	},
	created() { 
		this.$store.dispatch('updateToolsFromRemote');
	},
	updated() {
		// this.$store.dispatch('updateCurrentToolFromURI');
	},
	computed: {
		uriProject() {
			return this.$store.getters.uriProject;
		},
		noProjectsFound() {
			return this.$store.getters.noProjectsFound;
		},
		currTool() {
			return this.$store.getters.currTool
		},
		tools() {
			return this.$store.getters.tools
		},
		hasTools() {
			return this.$store.getters.tools.length
		},
		environment() {
			return this.$store.getters.environment
		},
		showAllProjects() {
			return this.$store.getters.showAllProjects;
		}
	},
	watch: {
		uriProject: function (val) {
			console.log("URI project changed!", val);
			this.$store.commit('setCurrToolName', val, true);
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
.left-panel {
	height: 560px;
	border-right: 3px solid #ececec;
	padding: 0px;
	background-color: #fff;
	overflow: hidden;
}

.left-panel-table-container {
	height: 560px;
	max-height: 560px;
	margin-top: 20px;
	padding-bottom: 20px;
	overflow: hidden;
	background-color: #fff;
}

.left-panel-table-container:hover {
	overflow: auto;
}

.left-panel table {
	width: 100%;
	table-layout: fixed;
	margin-top: 20px;
}

#sjcda-left-panel-table-header {
	position: fixed; 
	width: 293px;
	margin-top: 0;
	z-index:1;
	/* border-bottom: 1px solid #ccc; */
}

.left-panel table thead {
	font-size: 10pt;
	color: #a3a3a3;
}

.left-panel table tbody {
	font-size: 13pt;
}

.left-panel table tbody tr {
	height: 70px;
}

th {
	padding: 10px;
}

td {
	padding: 10px;
	cursor: pointer;
}

.spin-kit-loading {
  position: absolute;
  margin-top: 100px;
}

.sjcda-left-panel-table-thead-tr {
  background-color: #FFFFFF;
}

.sjcda-left-panel-table-thead-tr-th-key {
  width: 70%;
}

.sjcda-left-panel-table-thead-tr-th-value {
  width: 30%;
  text-align: right;
  padding-right: 25px;
}
</style>

