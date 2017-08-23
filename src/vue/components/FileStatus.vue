<template>
	<div id='fileStatusDiv' style='margin-top:18px;'>
		<table style='position:fixed; width:570px; border:1px solid #ccc;'>
			<thead>
				<tr style='color:#000; background-color:#ececec'>
					<th class='cellCheckBox'>
						<input type='checkbox' name='sjcda-file-all' id='sjcda-file-checkbox-all' value='all' v-on:click.stop='toggleCheckBoxes($event)'/>
					</th>
					<th class='cellFileName'>FILENAME</th>
					<th class='cellFileSize'>SIZE</th>
					<th class='cellStatus'>STATUS</th>
				</tr>
			</thead>
		</table>
		<table  style='width:570px; margin-top:34px'>
			<tbody>
				<tr v-for='file in files'>
					<td class='cellCheckBox'>
						<input type='checkbox' name='sjcda-files' v-bind:value='file.name' v-bind:checked='file.checked' v-on:click.stop='toggleFileChecked(file,$event)'/>
					</td>
					<td class='cellFileName' style='text-align:left;padding-left:10px'>{{ file.name }}</td>
					<td class='cellFileSize'>{{ file.size }}</td>
					<td class='cellStatus'>
						<div v-show="!file.finished" style='height:20px; width:80%; background-color:#fff; border: 1px solid #ececec; margin: 0 auto'>
							<div v-bind:style="progressStyle(file)"></div>
						</div>
						<div v-show="file.finished" style='max-height:20pt'>
							<i style="color: #4F8A10; font-size:20pt; line-height:20pt" class="material-icons">check_circle</i>
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
		},
		progressStyle(file) {
			return {height:'20px',width:file.status/100+'%'}
		},
		progressStyle(file) {
			return {
				height:'19px',
				'background-color':'rgb(27, 120, 55)', 
				width:file.status+'%'
			}
		}
	}
}
</script>

<style scoped>
#fileStatusDiv {
	height: 410px;
	overflow:scroll;
	border-bottom: 1px solid #ccc;
}

table {
	max-height:500px;
}

th {
	padding: 3px 0 3px 0px;
	font-weight:600;
	text-align:center;
}

td {
	padding: 7px 0 7px 0px;
	border: 1px solid #ccc;
	text-align:center;
}

.cellCheckBox {
	width: 25px;
}

.cellFileName {
	width: 250px;
}

.cellFileSize {
	width:150px;
}

.cellStatus {
	width: 80px;
}

input[type='checkbox'] {
    -webkit-appearance:none;
    width:18px;
    height:18px;
    background:white;
    border-radius:3px;
    border:1px solid #555;
    overflow:hidden;
    font-size:17px;
    line-height:17px;
    color:#555;
}

input[type='checkbox']:checked:before {
    content:"  \2714";
}

</style>
