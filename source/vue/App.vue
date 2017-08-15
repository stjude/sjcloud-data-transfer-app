<template>
	<div id='sjcda-container' style='background-color: #fff'>
		<top-bar></top-bar>
		<router-view keep-alive class='app-route-placement' style='height:560px;width:840px;margin-left:-5px;'>
		</router-view>
	</div>
</template>

<script>
import TopBar from './page/TopBar.vue';
import jquery from 'jquery';

export default {
	data() {
		return {}
	},
	components: {
		TopBar
	},
	mounted() {
		console.log('App mounted')
	}
}
</script>

<style>
body {
	width:850px;
	height:600px;
	margin:auto;
}
</style>