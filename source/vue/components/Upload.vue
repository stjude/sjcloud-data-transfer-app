<template>
	<div class='row'>
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
						v-bind:style='tool.name==currTool ? styles.activeTr : styles.inactiveTr' 
						v-on:click='setCurrTool(tool.name)'
						style="font-family: 'Open Sans'; height: 60px;">
						<td v-bind:style=''>{{ tool.name }}</td>
						<td v-bind:style='tool.name==currTool ? styles.activeTd : styles.inactiveTd'>{{ tool.size }} GB</td>
					</tr>
				</tbody>
			</table>
		</div>
		<div class='col-xs-8 rightPanel' style='height:100%;'>
			<nav-bar style="margin-top:18px;"></nav-bar>
			
			<upload-target v-show='!hasFiles' style='margin-top:50px'></upload-target>

			<file-status 
				v-bind:currTool='currTool' 
				v-bind:dataKey='dataKey'
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
import store from '../store.js'

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
	components: {
		NavBar,
		FileStatus,
		UploadTarget
	},
	data() {
		return {
			currTool: 'Rapid RNASeq',
			toolsByName: {},
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
	computed: {
		dataKey() {
			return this.$route.path.slice(1)
		},
		submitBtnLabel() {
			return this.$route.path.substr(1,1).toUpperCase() + this.$route.path.slice(2)
		},
		tools() {
			const lst=[]
			store.data.tools.forEach((t,i)=>{
				lst.push({
					name: t.name,
					size: t[this.$route.path.slice(1)].reduce((a,b)=>{
						return {
							size: a.size+b.size
						}
					},{size:0}).size
				})
				this.toolsByName[t.name]=t
			})
			return lst
		},
		hasFiles() {
			const tools=this.tools;
			const tool=this.toolsByName[this.currTool]
			const path=this.$route.path.slice(1)
			return !tool ? false
				: !tool[path] ? false
				: !Array.isArray(tool[path]) ? false
				: tool[path].length
		}
	},
	created() {
		window.addEventListener('keydown', this.toggleToolRow)
	},
	mounted() {
		console.log('Upload Mounted')
	},
	methods: {
		setCurrTool(name) {
			this.currTool=name
		},
		toggleToolRow(event) {
			if (event.keyCode==38 || event.keyCode==40) {
				const names=[]
				const incr=event.keyCode==38 ? -1 : 1
				let i=-1
				this.tools.forEach((t,j)=>{
					names.push(t.name)
					if (t.name==this.currTool) i=j;
				});
				
				this.currTool = i<0 || i+incr<0 || i+incr>=names.length ? names[0] 
					: this.currTool=names[i+incr]
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
	},
	events:{
		rerender() {
			this.$forceUpdate()
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