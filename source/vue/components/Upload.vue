<template>
	<div class='row'>
		<div class='col-xs-4 leftPanel' style='height:550px; border:1px solid #ececec;'>
			<table style='width:100%'>
				<thead>
					<tr style='color:#aaa'>
						<th style='width:70%'>TOOL</th>
						<th style='text-align:center;width:30%'>SIZE</th>
					</tr>
				</thead>
				<tbody>
					<tr v-for='tool in tools' 
						v-bind:style='tool.name==currTool.name ? styles.activeTr : styles.inactiveTr' 
						v-on:click='setCurrTool(tool.name)'>
						<td v-bind:style=''>{{ tool.name }}</td>
						<td v-bind:style='tool.name==currTool.name ? styles.activeTd : styles.inactiveTd'>{{ tool.size }} GB</td>
					</tr>
				</tbody>
			</table>
		</div>
		<div class='col-xs-8 rightPanel' style='height:100%;'>
			<nav-bar></nav-bar>
			
			<upload-target 
				v-show='!hasFiles' 
				style='margin-top:50px'>
			</upload-target>

			<file-status
				v-show='hasFiles'>
			</file-status>
			
			<div style='position:absolute; bottom:10px; right: 10px; text-align:right'>
				<button class='btn btn-primary'>{{ submitBtnLabel }}</button>
				<button class='btn btn-danger' v-on:click='deleteFiles'>Delete</button>
			</div>
		</div>
	</div>
</template>

<script>
import NavBar from './NavBar.vue';
import FileStatus from './FileStatus.vue';
import UploadTarget from './UploadTarget.vue';

const activeTool={color:'#000', 'background-color':'rgba(19,129,179,0.3)'}
const inactiveTool={color:'#aaa', 'background-color':'transparent'}

export default {
	components: {
		NavBar,
		FileStatus,
		UploadTarget
	},
	data() {
		return {
			styles: {
				activeTr: {color:'#000', 'background-color':'rgba(19,129,179,0.3)'},
				inactiveTr: {color:'#aaa', 'background-color':'transparent'},
				activeTd: {'text-align':'center', 'border-right':'2px solid #1381B3'},
				inactiveTd: {'text-align':'center', 'border-right':''}
			}
		}
	},
	computed: {
		submitBtnLabel() {
			const path=this.$store.getters.currPath
			return path[0].toUpperCase() + path.slice(2)
		},
		currTool() {
			return this.$store.getters.currTool
		},
		tools() {
			return this.$store.getters.tools
		},
		hasFiles() {
			return this.$store.getters.currFiles.length
		}
	},
	created() {
		window.addEventListener('keydown', this.toggleToolRow)
	},
	mounted() {
		console.log('Upload component mounted')
	},
	updated() {
		console.log('Upload component updated')
	},
	methods: {
		setCurrTool(toolName) {
			this.$store.commit('setCurrToolName',toolName)
		},
		toggleToolRow(event) {
			if (event.keyCode==38 || event.keyCode==40) {
				const names=[]
				const incr=event.keyCode==38 ? -1 : 1
				let i=-1
				this.tools.forEach((t,j)=>{
					names.push(t.name)
					if (t.name==this.currTool.name) i=j;
				});
				
				const toolName=i<0 || i+incr<0 || i+incr>=names.length ? names[0] : names[i+incr]
				this.$store.commit('setCurrToolName',toolName)
			}
			else if (event.keyCode==37) {
				this.$router.push('/upload')
			}
			else if (event.keyCode==39) {
				this.$router.push('/download')
			}
		},
		deleteFiles() {

		}
	}
}
</script>

<style scoped>
.row {
	margin-left:0;
	margin-right:0;
}
 
th {
	padding: 10px;
}
td {
	padding: 10px;
	cursor: pointer;
}
</style>