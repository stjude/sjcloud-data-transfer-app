<template>
	<div class='leftPanel'>
		<div v-show="!hasTools && noProjectsFound">
			No projects found! Please create one!
		</div>
		<div v-show="!hasTools && !noProjectsFound">
			<div class="col-xs-12">
				<div class="sk-circle">
					<div class="sk-circle1 sk-child"></div>
					<div class="sk-circle2 sk-child"></div>
					<div class="sk-circle3 sk-child"></div>
					<div class="sk-circle4 sk-child"></div>
					<div class="sk-circle5 sk-child"></div>
					<div class="sk-circle6 sk-child"></div>
					<div class="sk-circle7 sk-child"></div>
					<div class="sk-circle8 sk-child"></div>
					<div class="sk-circle9 sk-child"></div>
					<div class="sk-circle10 sk-child"></div>
					<div class="sk-circle11 sk-child"></div>
					<div class="sk-circle12 sk-child"></div>
				</div>	
				<div class="loading-text">Loading...</div>
			</div>
		</div>
		<table v-show="hasTools"> 
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
					<td v-bind:style='tool.name==currTool.name ? styles.activeTd : styles.inactiveTd'>{{tool.size }}</td>
				</tr>
			</tbody>
		</table>
		<div>
			<div class="checkbox first-checkbox">
				<label><input type="checkbox" :checked="showAllFiles" @click="updateShowAllFiles">Show all files</label></div>
			</div>
			<div class="checkbox second-checkbox">
				<label><input type="checkbox" :checked="showAllProjects" @click="updateShowAllProjects">Show non St. Jude Cloud projects</label></div>
			</div>
		</div>
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
					'text-align':'right',
					'border-right':'4px solid #1381B3'
				},
				inactiveTd: {
					'text-align':'right',
					'border-right':''
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

	.loading-text {
		font-size: 18px;
		text-align: center;
	}
	
	.first-checkbox {
		position: absolute;
		top: 485px;
		left: 25px;
	}

	.second-checkbox {
		position: absolute;
		top: 505px;
		left: 25px;
	}

	/**
	  * Graciously taken from SpinKit and adapted for our needs
	  *
	  * http://tobiasahlin.com/spinkit/
	  *
	  **/

	.sk-circle {
		margin: 0px auto;
		margin-top: 170px;
		margin-bottom: 35px;
		width: 120px;
		height: 120px;
		position: relative;
	}
	.sk-circle .sk-child {
		width: 100%;
		height: 100%;
		position: absolute;
		left: 0;
		top: 0;
	}
	.sk-circle .sk-child:before {
		content: '';
		display: block;
		margin: 0 auto;
		width: 15%;
		height: 15%;
		background-color: #333;
		border-radius: 100%;
		-webkit-animation: sk-circleBounceDelay 1.2s infinite ease-in-out both;
		animation: sk-circleBounceDelay 1.2s infinite ease-in-out both;
	}
	.sk-circle .sk-circle2 {
		-webkit-transform: rotate(30deg);
		-ms-transform: rotate(30deg);
		transform: rotate(30deg);
	}
	.sk-circle .sk-circle3 {
		-webkit-transform: rotate(60deg);
		-ms-transform: rotate(60deg);
		transform: rotate(60deg);
	}
	.sk-circle .sk-circle4 {
		-webkit-transform: rotate(90deg);
		-ms-transform: rotate(90deg);
		transform: rotate(90deg);
	}
	.sk-circle .sk-circle5 {
		-webkit-transform: rotate(120deg);
		-ms-transform: rotate(120deg);
		transform: rotate(120deg);
	}
	.sk-circle .sk-circle6 {
		-webkit-transform: rotate(150deg);
		-ms-transform: rotate(150deg);
		transform: rotate(150deg);
	}
	.sk-circle .sk-circle7 {
		-webkit-transform: rotate(180deg);
		-ms-transform: rotate(180deg);
		transform: rotate(180deg);
	}
	.sk-circle .sk-circle8 {
		-webkit-transform: rotate(210deg);
		-ms-transform: rotate(210deg);
		transform: rotate(210deg);
	}
	.sk-circle .sk-circle9 {
		-webkit-transform: rotate(240deg);
		-ms-transform: rotate(240deg);
		transform: rotate(240deg);
	}
	.sk-circle .sk-circle10 {
		-webkit-transform: rotate(270deg);
		-ms-transform: rotate(270deg);
		transform: rotate(270deg);
	}
	.sk-circle .sk-circle11 {
		-webkit-transform: rotate(300deg);
		-ms-transform: rotate(300deg);
		transform: rotate(300deg);
	}
	.sk-circle .sk-circle12 {
		-webkit-transform: rotate(330deg);
		-ms-transform: rotate(330deg);
		transform: rotate(330deg);
	}
	.sk-circle .sk-circle2:before {
		-webkit-animation-delay: -1.1s;
		animation-delay: -1.1s;
	}
	.sk-circle .sk-circle3:before {
		-webkit-animation-delay: -1s;
		animation-delay: -1s;
	}
	.sk-circle .sk-circle4:before {
		-webkit-animation-delay: -0.9s;
		animation-delay: -0.9s;
	}
	.sk-circle .sk-circle5:before {
		-webkit-animation-delay: -0.8s;
		animation-delay: -0.8s;
	}
	.sk-circle .sk-circle6:before {
		-webkit-animation-delay: -0.7s;
		animation-delay: -0.7s;
	}
	.sk-circle .sk-circle7:before {
		-webkit-animation-delay: -0.6s;
		animation-delay: -0.6s;
	}
	.sk-circle .sk-circle8:before {
		-webkit-animation-delay: -0.5s;
		animation-delay: -0.5s;
	}
	.sk-circle .sk-circle9:before {
		-webkit-animation-delay: -0.4s;
		animation-delay: -0.4s;
	}
	.sk-circle .sk-circle10:before {
		-webkit-animation-delay: -0.3s;
		animation-delay: -0.3s;
	}
	.sk-circle .sk-circle11:before {
		-webkit-animation-delay: -0.2s;
		animation-delay: -0.2s;
	}
	.sk-circle .sk-circle12:before {
		-webkit-animation-delay: -0.1s;
		animation-delay: -0.1s;
	}
	@-webkit-keyframes sk-circleBounceDelay {
		0%,
		80%,
		100% {
		-webkit-transform: scale(0);
		transform: scale(0);
		}
		40% {
		-webkit-transform: scale(1);
		transform: scale(1);
		}
	}
	@keyframes sk-circleBounceDelay {
		0%,
		80%,
		100% {
		-webkit-transform: scale(0);
		transform: scale(0);
		}
		40% {
		-webkit-transform: scale(1);
		transform: scale(1);
		}
	}
</style>
