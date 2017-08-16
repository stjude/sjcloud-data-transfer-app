<template>
	<div id='sjcda-top-bar' style='font-family:"Open Sans", "Helvetica Neue", Helvetica, Arial, sans-serif;  color:#fff;'>
		<div style='display:inline-block;margin-left:5px'>
			<a href='#/home'>
			<img id='sj-portal-topbar-logo' align="left" src="img/stjude-logo-small-white.svg" class="logo" style='width:10rem;max-height:40px;margin-top:5px;' vspace="">
			</a>
		</div>
		<div style='display:inline-block; padding-top: 0.3rem; vertical-align:top; margin-left:20px; font-size:24px; cursor:pointer' v-on:click='goHome'>
			St. Jude Cloud Platform
		</div>
	</div>
</template>
<script>
export default {
	methods: {
		goHome() { console.log('go Home')
			this.$router.push('/home')
		}
	}
}
</script>
<style>
#sjcda-top-bar {
	background-color: #1381B3;
	width:100%;
	height:40px;
}
</style>
