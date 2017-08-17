<template>
	<div style='display:inline-block; padding-top: 0.5rem; vertical-align:top; font-size: 18pt;'>
		<router-link to='/upload'>
			<div class='nav-span' v-bind:style='uploadLinkStyle'>Upload</div>
		</router-link>
		<router-link to='/download'>
			<div class='nav-span' v-bind:style='downloadLinkStyle'>Download</div>
		</router-link>
	</div>
</template>

<script>


const active={
	color:'#000', 
	'border-bottom':'2px solid #1381B3'
}
const inactive={
	color:'#aaa',
	'border-bottom': 'none'
}

export default {
	data() {
		return {}
	},
	created() { 
		//console.log('NavBar created')
	},
	computed: {
		uploadLinkStyle() {
			return this.$store.getters.currPath=='upload' ? active : inactive   
		},
		downloadLinkStyle() {
			return this.$store.getters.currPath=='download' ? active : inactive
		}
	},
	methods: {
	}
}
</script>

<style>
.nav-span {
	display: inline-block;
	padding: 5px;
	font-size: 18px;
	color:#000;
}
</style>
