<template>
	<div id='fileStatusDiv' style='margin-top:18px;'>
		<table style='position:fixed; width:571px; border:1px solid #ccc;'>
			<thead>
				<tr style='color:#000; background-color:#ccc'>
					<th class='cellCheckBox'>
						<div class='checkDiv' v-on:click.stop='toggleCheckBoxes'>
							<i v-show='checkedAll' style="color: #555;font-size:17px" class="material-icons">done</i>
						</div>
					</th>
					<th class='cellFileName'>FILENAME</th>
					<th class='cellFileSize'>SIZE</th>
					<th class='cellStatus'>STATUS</th>
				</tr>
			</thead>
		</table>
		<table style='width:570px; margin-top:28px'>
			<tbody>
				<tr v-for='file in files'>
					<td class='cellCheckBox'>
						<div class='checkDiv' v-on:click.stop='toggleFileChecked(file)'>
							<i v-show='file.checked' style="color: #555;font-size:17px" class="material-icons">done</i>
						</div>
					</td>
					<td class='cellFileName' style='text-align:left;padding-left:10px'>{{ file.name }}</td>
					<td class='cellFileSize'>{{ file.size }}</td>
					<td class='cellStatus' style='padding-top:0'>
						<div v-show="file.started && !file.finished" style='height:20px; width:80%; background-color:#fff; border: 1px solid #ececec; margin: 0 auto'>
							<div v-bind:style="progressStyle(file)"></div>
						</div>
						<div v-show="file.finished" style='height:25px;overflow:hidden'>
							<i style="color: #4F8A10; font-size:25px; line-height:25px" class="material-icons">check_circle</i>
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
		return {
			checkedAll: false
		}
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
		this.checkedAll=false
	},
	methods: {
		toggleFileChecked(file) {
			file.checked=!file.checked;
		},
		toggleCheckBoxes() {
			this.checkedAll=!this.checkedAll; 
			this.files.forEach(f=>f.checked=this.checkedAll);
		},
		progressStyle(file) {
			return {height:'20px',width:file.status/100+'%'}
		},
		progressStyle(file) {
			return {
				height:'19px',
				'background-color':'#4F8A10', 
				width:file.status+'%'
			}
		}
	}
}
</script>

<style scoped>
#fileStatusDiv {
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
	font-weight: 600;
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

.checkDiv, input[type='checkbox'] {
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
}

</style>
