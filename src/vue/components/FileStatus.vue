<template>
	<div id='fileStatusDiv' :style='rootDivStyle'>
		<table id='sjcda-file-table-header'>
			<thead>
				<tr style='color:#000; background-color:#ccc'>
					<th class='cellCheckBox' v-on:click.stop='toggleCheckBoxes'>
						<input type="checkbox" :checked='checkedAll' />
					</th>
					<th class='cellFileName'>FILENAME</th>
					<th class='cellFileSize'>SIZE</th>
					<th class='cellStatus'>STATUS</th>
				</tr>
			</thead>
		</table>
		<table style='width:570px; margin-top:28px' id='sjcda-file-table-body'>
			<tbody>
				<tr v-for='file in files'>
					<td class='cellCheckBox' v-on:click.stop='toggleFileChecked(file)'>
						<input type="checkbox" :checked='file.checked' />
					</td>
					<td class='cellFileName' style='text-align:left;padding-left:10px' v-html='matchedStr(file.name)'></td>
					<td class='cellFileSize' v-html='matchedStr(file.size)'></td>
					<td class='cellStatus' style='padding-top:0'>
						<div v-if="file.finished" style='height:25px;overflow:hidden'>
							<i style="color: #4F8A10; font-size:25px; line-height:25px" class="material-icons">check_circle</i>
						</div>
						<div v-else-if="file.started" style='position:relative; height:20px; width:80%; background-color:#fff; border: 1px solid #ececec; margin: 0 auto'>
							<div v-bind:style="progressStyle(file)"></div>
						</div>
						<div v-else-if="file.waiting">
							Waiting...
						</div>
					</td>
				</tr>
			</tbody>
		</table>
		<div v-show="noFilesMatched"
			style='width:100%; text-align:center; padding: 20px;'>
			No matching files found for the search term.
		</div>
	</div>
</template>

<script>
import Vue from 'vue';
let i="0"
let prevTool={}
let prevPath='upload'

export default {
	data() {
		return {
			checkedAll: false,
			rootDivStyle: {
				'border-bottom': 'none'
			}
		}
	},
	computed: {
		files() {
			return this.$store.getters.currFiles
		},
		noFilesMatched() {
			return !this.$store.getters.noProjectsFound &&
				this.$store.getters.searchTerm && 
				!this.$store.getters.currFiles.length
		}
	},
	methods: {
		matchedStr(str="") {
			if (!str) return str;
			const strlc=str.toLowerCase();
			const term=this.$store.getters.searchTerm;
			if (!term || !strlc.includes(term)) return str;
			const s=str.substr(strlc.search(term),term.length)
			return str.replace(s, "<span style='background-color:#ff0'>"+s+"</span>")
		},
		toggleFileChecked(file) {
			file.checked=!file.checked;
		},
		toggleCheckBoxes() {
			this.checkedAll=!this.checkedAll; 
			this.files.forEach(f=>f.checked=this.checkedAll);
		},
		progressStyle(file) {
			return {
				position:'relative',
				height:'20px',
				'background-color':'#4F8A10', 
				width:file.status+'%',
				top:'-1px',
				left:'-1px',
				'border-bottom':'1px solid #4F8A10'
			}
		}
	}
}
</script>

<style scoped>
#fileStatusDiv {
	margin-top:18px;
	height: 410px;
	overflow: scroll;
	font-family: 'Lato';
	color: #222222;
	/* border-bottom: 1px solid #ccc; */
}

table {
	max-height: 500px;
}

th {
	padding: 3px 0 3px 0px;
	font-weight: 300;
	text-align: center;
}

td {
	padding: 7px 0 7px 0px;
	border: 1px solid #ccc;
	text-align: center;
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

#sjcda-file-table-header {
	position:fixed; 
	width:571px; 
	border:1px solid #ccc; 
	z-index:1
}

/*.checkDiv, input[type='checkbox'] {
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
    cursor:pointer;
    margin-left:4px;
}*/

</style>
