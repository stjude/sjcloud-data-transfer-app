<template>
	<div id='fileStatusDiv' :style='rootDivStyle'>
		<table id='sjcda-file-table-header'>
			<thead>
				<tr style='color:#000; background-color:#eeeeee'>
					<th class='cellCheckBox' v-on:click.stop='toggleCheckBoxes'>
						<input type="checkbox" :checked='checkedAll' />
					</th>
					<th class='cellFileName' style='text-align:left; padding-left:10px; overflow:hidden'>
						<span>FILENAME</span>
						<sort-arrows sortkey='filename'></sort-arrows>
					</th>
					<th class='cellFileSize' style='overflow:hidden'>
						<span>SIZE</span>
						<sort-arrows sortkey='size'></sort-arrows>
					</th>
					<th class='cellStatus' style='overflow:hidden'>
						<span>STATUS</span>
						<sort-arrows sortkey='status'></sort-arrows>
					</th>
				</tr>
			</thead>
		</table>
		<div id='sjcda-file-table-body-div' v-bind:style='tBodyDivStyle'>
			<table id='sjcda-file-table-body'>
				<tbody>
					<tr v-for='file in files'>
						<td class='cellCheckBox' v-on:click.stop='toggleFileChecked(file)'>
							<input type="checkbox" :checked='file.checked' :disabled='file.finished'/>
						</td>
						<td class='cellFileName' style='text-align:left;padding-left:10px' v-html='matchedStr(file.name)'></td>
						<td class='cellFileSize' v-html='matchedStr(file.size)'></td>
						<td class='cellStatus'>
							<div v-if="file.finished" style='height:20px;overflow:hidden'>
								<i style="color: #4F8A10; font-size:20px; line-height:20px" class="material-icons">check_circle</i>
							</div>
							<div v-else-if="file.errored" style='height:20px;overflow:hidden'>
								<i style="color: #DD0000; font-size:20px; line-height:20px" class="material-icons">error</i>
							</div>
							<div v-else-if="file.started && file.status == 0">Starting...</div>
							<div v-else-if="file.started" class='sjcda-progress-outline'>
								<div class='sjcda-progress-filled' 
									v-bind:style="progressStyle(file)"></div>
							</div>
							<div v-else-if="file.waiting">
								Waiting...
							</div>
						</td>
					</tr>
				</tbody>
			</table>
		</div>
		<div style='margin-top:5px; padding-left:40px' v-show='showSelectionTotals==1'>
			<span>
				Total Selected: {{ numSelectedFiles }} of {{ files.length }} Files ({{ sizeSelectedFiles }})
			</span>
		</div>
		<div v-show="noFilesMatched"
			style='width:100%; text-align:center; padding: 20px;'>
			No matching files found for the search term.
		</div>
	</div>
</template>

<script>
import Vue from 'vue';
import SortArrows from './SortArrows.vue';
import globToRegExp from 'glob-to-regexp';

let i="0"
let prevTool={}
let prevPath='upload'

export default {
	components: {
		SortArrows
	},
	props: {
		showSelectionTotals: {
			default: 0
		}
	},
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
		},
		numSelectedFiles() {
			return this.$store.getters.checkedFiles.length
		},
		sizeSelectedFiles() {
			return window.utils.readableFileSize(this.$store.getters.checkedFiles
					.reduce((a,b)=>a + b.raw_size, 0))
		},
		tBodyDivStyle() {
			return this.showSelectionTotals==1 ? {'max-height':'352px'} : {'max-height':'380px'}
		}
	},
	methods: {
		matchedStr(str="") {
			return str
			/* 
			// harder to highlight matching substr against glob pattern 
			if (!str) return str;
			const term=this.$store.getters.searchTerm;
			const rgx=globToRegExp(term,{flags:'gim'});
			if (!rgx.test(str)) return str; 
			const s=str.substr(str.search(rgx),term.length);
			return str.replace(rgx, "<span style='background-color:#ff0'>"+s+"</span>")
			*/
		},
		toggleFileChecked(file) {
			file.checked=!file.checked;
		},
		toggleCheckBoxes() {
			this.checkedAll=!this.checkedAll; 
			this.files.forEach((f) => {
       if (!f.finished) {
         f.checked = this.checkedAll;
       } 
      });
		},
		progressStyle(file) {
			return {
				width:file.status+'%'
			}
		}
	}
}
</script>

<style scoped>
#fileStatusDiv {
	margin-top:18px;
	height: 412px;
	overflow: hidden;
	font-family: 'Lato';
	color: #222222;
	/* border-bottom: 1px solid #ccc; */
}

#fileStatusDiv:hover {
	overflow: auto;
}

#sjcda-file-table-body-div {
	overflow: auto;
	margin:28px 0 0 0; 
	padding:0; 
	overflow-y:auto;
}

#sjcda-file-table-body {
	width: 570px;
}

table {
	max-height: 500px;
	table-layout: fixed;
}

th {
	padding: 3px 0 3px 0px;
	font-weight: 300;
	text-align: center;
	height: 20px;
	overflow: hidden;
}

td {
	padding: 7px 0 7px 0px;
	border: 1px solid #eeeeee;
	text-align: center;
	align-items: center;
	height: 20px;
	overflow: hidden;
}

.cellCheckBox {
	width: 25px;
}

.cellFileName {
	width: 340px;
	overflow: auto;
}

.cellFileSize {
	width:60px;
}

.cellStatus {
	width: 80px;
	overflow: hidden;
}

#sjcda-file-table-header {
	position:fixed; 
	width:571px; 
	border:1px solid #eeeeee; 
	z-index:1
}

.sjcda-progress-outline {
	position:relative; 
	height:20px; 
	width:80%; 
	background-color:#fff; 
	border: 1px solid #ececec; 
	margin: 0 auto;
}

.sjcda-progress-filled {
	position: relative;
	height: 20px;
	background-color: #4F8A10;
	width: 0%;
	top: -1px;
	left: -1px;
	border-bottom:1px solid #4F8A10
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
