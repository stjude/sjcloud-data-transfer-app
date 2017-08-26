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
				<table> 
					<thead>
						<tr>
							<th style='width:70%'>{{showAllProjects ? "PROJECT" : "TOOL"}}</th>
							<th style='width:30%; text-align: right;'>SIZE</th>
						</tr>
					</thead>
					<tbody>
						<tr v-for='tool in tools'
								v-bind:style='tool.name==currTool.name ? styles.activeTr : styles.inactiveTr' 
								v-on:click='setCurrTool(tool.name)'>
							<td>{{ tool.name }}</td>
							<td v-bind:style='tool.name==currTool.name ? styles.activeTd : styles.inactiveTd'>
								{{tool.size && tool.size !== 0 && tool.size !== '' ? tool.size : 'Loading...'}}
							</td>
						</tr>
					</tbody>
				</table>
			</div>
		</div>
		<div class="checkbox first-checkbox">
			<label><input type="checkbox" :checked="showAllFiles" @click="updateShowAllFiles">Show all files</label>
		</div>
		<div class="checkbox second-checkbox">
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
					'text-align':'right',
					'border-right':'4px solid #1381B3'
				},
				inactiveTd: {
					'text-align':'right',
					'border-right':''
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
	updated() {},
	computed: {
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
	height: 490px;
	max-height: 490px;
	overflow: scroll;
}

.left-panel table {
	width: 100%;
	table-layout: fixed;
	margin-top: 20px;
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
	font-size: 12pt;
	top: 490px;
	left: 20px;
}

.second-checkbox {
	position: absolute;
	font-size: 12pt;
	top: 530px;
	left: 20px;
}

td {
	padding: 10px;
	cursor: pointer;
}
</style>
