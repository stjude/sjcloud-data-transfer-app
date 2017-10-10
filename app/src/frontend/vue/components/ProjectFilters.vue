<template>
	<div id='left-panel-project-filters'>
		<div class="checkbox first-checkbox">
			<label><input type="checkbox" :checked="showAllFiles" @click="updateShowAllFiles">Show all files</label>
		</div>
		<div class="checkbox second-checkbox">
			<label><input type="checkbox" :checked="showAllProjects" @click="updateShowAllProjects">Show non St. Jude Cloud projects</label>
		</div>
		<div class='num-input'>
			<input type="number" 
					id='num-concurr-ops-input'
					:value="concurrentOperations" 
					@change="setConcurrentOperations"/>
			<label for='num-concurr-ops-input'>
				Number of concurrent transfers
			</label>
		</div>
	</div>
</template>

<script>
export default {
	computed: {
		showAllFiles() {
			return this.$store.getters.showAllFiles;
		},
		showAllProjects() {
			return this.$store.getters.showAllProjects;
		},
		concurrentOperations() {
			return this.$store.getters.concurrentOperations;
		}
	},
	methods: {
		updateShowAllFiles (e) {
			this.$store.commit('setShowAllFiles', e.target.checked);
		},
		updateShowAllProjects (e) {
			this.$store.commit('setShowAllProjects', e.target.checked);
		},
		setConcurrentOperations(e) {
			this.$store.commit('setConcurrentOperations', e.target.value);
		}
	}
}
</script>

<style scoped>
#left-panel-project-filters {
	/*position: absolute;
	top: 480px;*/
	background-color: #FFFFFF;
}

.first-checkbox {
	width: 290px;
	font-size: 12pt;
	padding-top: 10px;
	padding-left: 20px;
	background-color:#fff;
}

.second-checkbox {
	width: 290px;
	margin-top: 0;
	font-size: 12pt;
	padding-left: 20px;
	background-color:#fff;
}

.num-input {
	width: 290px;
	padding-left: 20px;
	background-color:#fff;
}

.num-input label { 
	font-size: 12pt;
	font-weight: 400;
}

.num-input input {
	width: 40px; 
	text-align: right;
}
</style>
