<template>
	<div class="rightPanel" style=''>
		<table style='width:100%;'>
			<thead>
				<tr style='color:#000; background-color:#ececec'>
					<th style='width:10%'>
						<input type='checkbox' name='sjcda-file-all' id='sjcda-file-checkbox-all' value='all' v-on:click.stop='toggleCheckBoxes($event)'/>
					</th>
					<th style='text-align:center;width:50%'>Filename</th>
					<th style='text-align:center;width:25%'>Size</th>
					<th style='text-align:center;width:15%'>Status</th>
				</tr>
			</thead>
			<tbody>
				<tr v-for='file in files'>
					<td>
						<input type='checkbox' name='sjcda-files' v-bind:value='file.name' v-bind:checked='file.checked' v-on:click.stop='toggleFileChecked(file,$event)'/>
					</td>
					<td>{{ file.name }}</td>
					<td style='text-align:center'>{{ file.size }} GB</td>
					<td style='text-align:center'>
						<div 
							style='height:20px; width:100%; background-color:#fff; border: 1px solid #ececec'>
							<div class='bg-success' v-bind:style="{height:'20px',width:file.status+'%'}"></div>
						</div>
					</td>
				</tr>
			</tbody>
		</table>
	</div>
</template>

<script>
let i="0"
let prevTool={}
let prevPath='upload'

export default {
	data() {
		return {}
	},
	computed: {
		files() {
			return this.$store.getters.currFiles
		}
	},
	mounted() {
		
	},
	updated() {
		if (this.$store.currTool==prevTool && this.$store.currPath==prevPath) return
		prevTool=this.$store.currTool
		prevPath=this.$store.currPath
		document.querySelector('#sjcda-file-checkbox-all').checked=false
	},
	methods: {
		toggleFileChecked(file,event) {
			file.checked=event.target.checked;
		},
		toggleCheckBoxes(event) {
			const checked=event.target.checked; 
			this.files.forEach(f=>f.checked=checked);
			this.$forceUpdate()
		},
		progressStyle(file) {
			return {height:'20px',width:file.status/100+'%'}
		}
	}
}
</script>

<style>
.rightPanel {
	height: 400px;
	overflow: scroll;
	margin-top: 15px;
	//border-bottom: 1px solid #ececec;
	max-height: 500px;
}

.rightPanel th {
	padding:10px;
	border: 2px solid #ececec;
}
.rightPanel td {
	padding: 10px;
	border: 1px solid #ccc;
}
</style>
