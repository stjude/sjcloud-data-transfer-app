<template>
	<div class="nav-bar" style='width:100%'>
		<router-link to='/upload'>
			<div class='nav-span' v-bind:style='uploadLinkStyle'>Upload</div>
		</router-link>
		<router-link to='/download'>
			<div class='nav-span' v-bind:style='downloadLinkStyle'>Download</div>
		</router-link>

		<div v-show="searchVisible" style='float:right;'>
			<input type='text' value='' 
				placeholder="SEARCH..."
				style='width: 300px; font-size: 16px;'
				@input='setSearchTerm($event)'>
		</div>
	</div>
</template>

<script>

const active={
	color:'#000', 
	'border-bottom':'2px solid #1381b3'
}

const inactive={
	color:'#aaa',
	'border-bottom': 'none'
}

export default {
	data() {
		return {}
	},
	computed: {
		uploadLinkStyle() {
			return this.$store.getters.currPath=='upload' ? active : inactive   
		},
		downloadLinkStyle() {
			return this.$store.getters.currPath=='download' ? active : inactive
		},
		searchVisible() {
			return this.$store.getters.currPath=='download' && (
				this.$store.getters.searchTerm ||
				(this.$store.getters.tools.length &&
				this.$store.getters.currFiles.length &&
				!this.$store.getters.noProjectsFound)
			)
		}
	},
	methods: {
		setSearchTerm(event) {
			this.$store.commit('setSearchTerm',event.target.value)
		},
	}
}
</script>

<style>
.nav-bar {
	display: inline-block;
	margin-top: 16px;
	padding-top: 0.5rem;
	vertical-align: top;
	font-size: 18pt;
} 

.nav-span {
	display: inline-block;
	padding: 5px;
	height: 33px;
	font-size: 18px;
	color:#000;
}
</style>
