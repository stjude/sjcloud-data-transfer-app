<template>
	<div class='sjcda-top-bar'>
		<div style='display:inline-block;margin-left:5px'>
			<a href='#/home'>
				<img class="sjcda-top-bar__logo" src="img/stjude-logo-child-white.png">
			</a>
		</div>
		<span v-on:click='goHome'>ST. JUDE CLOUD</span>
		<span style="font-weight: lighter;" v-on:click='goHome'>PLATFORM</span>
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
.sjcda-top-bar {
	background-color: #2A8BB6;
	border-width: 3px;
	border-style: solid;
	border-color: #1381B3;
	color: #FFFFFF;
	cursor: pointer;
	display:inline-block; 
	font-family: "Lato", "Open Sans", "Helvetica Neue", Helvetica, Arial, sans-serif;
	font-size: 24px; 
	height: 60px;
	padding-top: 0.3rem; 
	vertical-align: top; 
	width: 100%;
	vertical-align: middle;
}

.sjcda-top-bar__logo {
	height: 50px;
}
</style>
