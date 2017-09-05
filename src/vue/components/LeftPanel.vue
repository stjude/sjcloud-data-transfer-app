<template>
	<div class='left-panel'>
		<div v-if="!hasTools && noProjectsFound">
			No projects found! Please create one!
		</div>
		<div v-else-if="!hasTools && !noProjectsFound">
			<spin-kit btmLabel='Loading...' 
								:textStyle="styles.loadingTextStyle"
								style='position: absolute; margin-top:100px'></spin-kit>
		</div>
		<div v-else-if="hasTools">
			<div class="left-panel-table-container">
				<table id='sjcda-left-panel-table-header'> 
					<thead>
						<tr style='background-color:#fff'>
							<th style='width:70%'>{{showAllProjects ? "PROJECT" : "TOOL"}}</th>
							<th style='width:30%; text-align: right; padding-right:25px'>SIZE</th>
						</tr>
					</thead>
				</table>
				<table style='margin-top:40px'>
					<tbody>
						<tr v-for='tool in tools'
								v-bind:style='tool.name==currTool.name ? styles.activeTr : styles.inactiveTr' 
								v-on:click='setCurrTool(tool.name)'>
							<td style='width:70%'>{{ tool.name }} <span v-show="tool.isSJCPTool" class="badge">TOOL</span></td>
							<td v-bind:style='tool.name==currTool.name ? styles.activeTd : styles.inactiveTd'>
								{{tool.size && tool.size !== 0 && tool.size !== '' ? tool.size : 'Loading...'}}
							</td>
						</tr>
					</tbody>
				</table>
			</div>
		</div>
		<div class="checkbox first-checkbox" style=''>
			<label><input type="checkbox" :checked="showAllFiles" @click="updateShowAllFiles">Show all files</label>
		</div>
		<div class="checkbox second-checkbox" style='background-color:#fff'>
			<label><input type="checkbox" :checked="showAllProjects" @click="updateShowAllProjects">Show non St. Jude Cloud projects</label>
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
		showAllFiles() {
			return this.$store.getters.showAllFiles;
		},
		showAllProjects() {
			return this.$store.getters.showAllProjects;
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
		}
	},
	watch: {
		uriProject: function (val) {
			console.log("URI project changed!", val);
			this.$store.commit('setCurrToolName', val, true);
		}
	},
	methods: {
		updateShowAllFiles (e) {
			this.$store.commit('setShowAllFiles', e.target.checked);
		},
		updateShowAllProjects (e) {
			this.$store.commit('setShowAllProjects', e.target.checked);
		},
		setCurrTool(toolName) {
			this.$store.commit('setCurrToolName',toolName)
		}
	}
}
</script>

<style scoped>
.left-panel {
	height: 560px;
	border: 3px solid #ececec;
	padding: 0px;
}

.left-panel-table-container {
	height: 478px;
	max-height: 478px;
	margin-top: 20px;
	padding-bottom: 20px;
	overflow: hidden;
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

.first-checkbox {
	position: absolute;
	width: 290px;
	font-size: 12pt;
	top: 480px;
	padding-top: 10px;
	padding-left: 20px;
	background-color:#fff;
}

.second-checkbox {
	position: absolute;
	width: 290px;
	font-size: 12pt;
	top: 530px;
	padding-left: 20px;
	background-color:#fff;
}

td {
	padding: 10px;
	cursor: pointer;
}
</style>
