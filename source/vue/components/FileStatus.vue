<template>
	<div>
		<table style='width:100%; margin-top: 15px'>
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
					<td style='text-align:center'>{{ file.status }}</td>
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
		}
	}
}
</script>

<style>
.rightPanel th {
	padding:10px;
	border: 2px solid #ececec;
}
.rightPanel td {
	padding: 10px;
	border: 1px solid #ccc;
}
</style>