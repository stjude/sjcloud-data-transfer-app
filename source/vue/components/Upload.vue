<template>
	<div class='row'>
		<div class='col-xs-4' style='height:550px; border:1px solid #ececec; margin:5px'>
			<table style='width:100%'>
				<thead>
					<tr style='color:#aaa'>
						<th style='width:70%'>TOOL</th>
						<th style='text-align:center;width:30%'>SIZE</th>
					</tr>
				</thead>
				<tbody>
					<tr v-for='tool in tools' 
						v-bind:style='tool.name==currTool ? styles.activeTr : styles.inactiveTr' 
						v-on:click='setCurrTool(tool.name)'>
						<td v-bind:style=''>{{ tool.name }}</td>
						<td v-bind:style='tool.name==currTool ? styles.activeTd : styles.inactiveTd'>{{ tool.size }} GB</td>
					</tr>
				</tbody>
			</table>
		</div>
		<div class='col-xs-7' style='height:100%;margin:5px'>
			<nav-bar></nav-bar>
		</div>
	</div>
</template>

<script>
import NavBar from './NavBar.vue';

const activeTool={color:'#000', 'background-color':'rgba(19,129,179,0.3)'}
const inactiveTool={color:'#aaa', 'background-color':'transparent'}

export default {
	data() {
		return {
			currTool: 'Rapid RNASeq',
			styles: {
				activeTr: {color:'#000', 'background-color':'rgba(19,129,179,0.3)'},
				inactiveTr: {color:'#aaa', 'background-color':'transparent'},
				activeTd: {'text-align':'center', 'border-right':'2px solid #1381B3'},
				inactiveTd: {'text-align':'center', 'border-right':'none'}
			},
			tools: [
				{name: 'Rapid RNASeq', size: '0'},
				{name: 'WARDEN', size: '0'},
				{name: 'ChiP-Seq', size: '0'}
			]
		}
	},
	components: {
		NavBar
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
			if (event.keyCode!=38 && event.keyCode!=40) return

			const names=[]
			const incr=event.keyCode==38 ? -1 : 1
			let i=-1
			this.tools.forEach((t,j)=>{
				names.push(t.name)
				if (t.name==this.currTool) i=j;
			});
			
			this.currTool = i==-1 || i+incr>=names.length ? names[0] 
				: this.currTool=names[i+incr]
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