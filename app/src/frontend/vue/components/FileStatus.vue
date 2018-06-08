<template>
	<div id='file-status-div' :style='rootDivStyle'>
		<table id='file-status-table'>
			<thead>
				<tr class="file-status-thead-tr"> 
					<th class='file-status-cell-checkbox' v-on:click.stop='toggleCheckBoxes'>
						<input type="checkbox" :checked='checkedAll' />
					</th>
					<th class='file-status-cell-filename' style='overflow: hidden'>
						<span>FILENAME</span>
						<sort-arrows sortkey='filename'></sort-arrows>
					</th>
					<th class='file-status-cell-filesize'>
						<span>SIZE</span>
						<sort-arrows sortkey='size'></sort-arrows>
					</th>
					<th class='file-status-cell-status'>
						<span>STATUS</span>
						<sort-arrows sortkey='status'></sort-arrows>
					</th>
				</tr>
			</thead>
		</table>
		<div id='file-status-table-body-div' v-bind:style='tBodyDivStyle'>
			<table id='file-status-table-body'>
				<tbody>
					<tr v-for='file in files'>
						<td class='file-status-cell-checkbox' v-on:click.stop='toggleFileChecked(file)'>
							<input type="checkbox" :checked='file.checked' :disabled='file.finished'/>
						</td>
						<td class='file-status-cell-filename' v-html='matchedStr(file.name)'></td>
						<td class='file-status-cell-filesize' v-html='matchedStr(file.size)'></td>
						<td class='file-status-cell-status'>
							<div class="file-status-cell-status-finished" v-if="file.finished">
								<i class="material-icons file-status-cell-status-finished-icon">check_circle</i>
							</div>
							<div class='file-status-cell-status-errored' v-else-if="file.errored">
								<i class="material-icons file-status-cell-status-errored-icon">error</i>
							</div>
              <div v-else-if="file.cancelled && !file.finished" class='' style='width:80px; height:20px;'>
                <div class=''>Cancelled!</div>
              </div>
							<!--<div v-else-if="file.started && file.status == 0">Starting...</div>-->
							<div v-else-if="!file.finished && (file.started || file.waiting)" class='' style='width:80px; height:20px;'>
								<div class='' v-show='!file.started'>Waiting ...</div>
								<div class='file-status-cell-status-progress-text' v-show='file.started'>{{ file.timeRemaining }}</div>
								<div class='file-status-cell-status-progress-bar' v-show='file.started' v-bind:style="progressStyle(file)"></div>
							</div>
							<!--<div v-else-if="file.waiting">
								Waiting...
							</div>-->
						</td>
					</tr>
				</tbody>
			</table>
		</div>
		<div class="file-status-file-count" v-show='showSelectionTotals == 1'>
			<span v-if="numSelectedFiles > 0">
				{{ numSelectedFiles }} of {{ files.length }} files selected ({{ sizeSelectedFiles }})
			</span>
		</div>
		<div class="file-status-no-files-found" v-show="noFilesMatched">
			No matching files found for the search term.
		</div>
	</div>
</template>

<script>
import SortArrows from './SortArrows.vue';
import globToRegExp from 'glob-to-regexp';

let i = '0';
let prevTool = {};
let prevPath = 'upload';

export default {
  components: {
    SortArrows,
  },
  props: {
    showSelectionTotals: {
      default: 0,
    },
  },
  data() {
    return {
      checkedAll: false,
      rootDivStyle: {
        'border-bottom': 'none',
      },
    };
  },
  computed: {
    files() {
      this.$store.getters.currFiles.forEach(file => {
        if (!file.started && !file.waiting) {
          file.timeRemaining = 'Waiting...';
        } else if (file.waiting && !file.started) {
          file.timeRemaining = 'Waiting...';
        } else if (!file.finished && file.started && file.status == 0) {
          file.timeRemaining = 'Started';
        }
      });
      return this.$store.getters.currFiles;
    },
    noFilesMatched() {
      return (
        !this.$store.getters.noProjectsFound &&
        this.$store.getters.searchTerm &&
        !this.$store.getters.currFiles.length
      );
    },
    numSelectedFiles() {
      return this.$store.getters.checkedFiles.length;
    },
    sizeSelectedFiles() {
      return this.$root.backend.utils.readableFileSize(
        this.$store.getters.checkedFiles.reduce((a, b) => a + b.raw_size, 0),
      );
    },
    tBodyDivStyle() {
      return this.showSelectionTotals == 1
        ? { 'max-height': '352px' }
        : { 'max-height': '380px' };
    },
  },
  methods: {
    matchedStr(str = '') {
      return str;
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
      file.checked = !file.checked;
    },
    toggleCheckBoxes() {
      this.checkedAll = !this.checkedAll;
      this.files.forEach(f => {
        if (!f.finished) {
          f.checked = this.checkedAll;
        }
      });
    },
    progressStyle(file) {
      if (file.started) {
        if (!file.finished && !('startTime' in file)) {
          file.startTime = +new Date();
          file.timeRemaining = 'Started';
        } else {
          const dt = +new Date() - file.startTime;
          const rate = file.status == 0 || dt == 0 ? 0.01 : file.status / dt;
          const msRemaining = (100 - file.status) / rate;
          file.timeRemaining = new Date(msRemaining)
            .toISOString()
            .substr(11, 8);
        }
      } else if (!file.finished) {
        file.timeRemaining = 'Waiting...';
      }

      return {
        width: file.status + '%',
      };
    },
  },
};
</script>

<style scoped>
#file-status-div {
  margin-top: 18px;
  height: 412px;
  overflow: hidden;
  font-family: 'Lato';
  color: #222222;
  /* border-bottom: 1px solid #ccc; */
  position: fixed;
  width: 571px;
  z-index: 1;
}

#file-status-div:hover {
  overflow: auto;
}

#file-status-div .material-icons {
  vertical-align: top;
}

#file-status-table {
  position: fixed;
  width: 571px;
  border: 1px solid #eeeeee;
  z-index: 1;
}

.file-status-thead-tr {
  color: #000;
  background-color: #eeeeee;
}

#file-status-table-body-div {
  overflow: auto;
  margin: 28px 0 0 0;
  padding: 0;
  overflow-y: auto;
}

#file-status-table-body {
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

.file-status-cell-checkbox {
  width: 25px;
}

.file-status-cell-filename {
  width: 340px;
  overflow: auto;
  text-align: left;
  padding-left: 10px;
}

.file-status-cell-filesize {
  width: 60px;
  overflow: hidden;
}

.file-status-cell-status {
  width: 80px;
  overflow: hidden;
}

#file-status-table {
  position: fixed;
  width: 571px;
  border: 1px solid #eeeeee;
  z-index: 1;
}

.file-status-cell-status-progress-started {
  position: relative;
  height: 20px;
  width: 80%;
  background-color: #fff;
  border: 1px solid #ececec;
  margin: 0 auto;
}

.file-status-cell-status-progress-bar {
  position: relative;
  height: 5px;
  background-color: #4f8a10;
  width: 0%;
  top: -1px;
  left: -1px;
  border: 1px solid #000000;
  margin-left: 5px;
  margin-right: 5px;
}

.file-status-cell-status-progress-text {
  position: relative;
  text-align: center;
  font-size: 12px;
}

.file-status-thead-tr {
  color: #000;
  background-color: #eeeeee;
}

.file-status-cell-status-finished {
  height: 20px;
  overflow: hidden;
}

.file-status-cell-status-finished {
  color: #4f8a10;
  font-size: 20px;
  line-height: 20px;
}

.file-status-cell-status-finished-icon {
  color: #4f8a10;
  font-size: 20px;
  line-height: 20px;
}

.file-status-cell-status-errored {
  height: 20px;
  overflow: hidden;
}

.file-status-cell-status-errored-icon {
  color: #dd0000;
  font-size: 20px;
  line-height: 20px;
}

.file-status-file-count-div {
  margin-top: 5px;
  padding-left: 40px;
}

.file-status-no-files-found {
  width: 100%;
  text-align: center;
  padding: 20px;
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
