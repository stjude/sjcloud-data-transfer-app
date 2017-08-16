<template>
	<div>
		<table style='width:100%; margin-top: 15px'>
			<thead>
				<tr style='color:#000; background-color:#ececec'>
					<th style='width:10%'>
						<input type='checkbox' name='sjcda-file-all' value='all' v-on:click.stop='toggleCheckBoxes($event)'/>
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
import store from '../store.js'

let i="0"

export default {
	data() {
		return {}
	},
	computed: {
		tools() {
			const map={}
			store.data.tools.forEach(t=>map[t.name]=t)
			return map
		},
		files() {
			return this.tools[this.currTool][this.dataKey]
		}
	},
	props: [
		'currTool',
		'dataKey'
	],
	mounted() {
		
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