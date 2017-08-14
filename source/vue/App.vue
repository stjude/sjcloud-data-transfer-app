<template>
	<div class="container" id='sjcda-container'>
		<div style='margin:1rem'>
			<router-link to='/home'>Home</router-link> | 
			<router-link to='/upload'>Upload</router-link>
		</div>
		<router-view keep-alive class='app-route-placement'>
		</router-view>
	</div>
</template>

<script>
export default {
	data() {
		return {}
	},
	mounted() {
		console.log('App mounted')
	}
}
</script>

<style>
</style>