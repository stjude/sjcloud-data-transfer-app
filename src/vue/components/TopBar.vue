<template>
	<div class='sjcda-top-bar'>
		<div class='sjcda-top-bar__logo_container'>
			<a href='#/home'>
				<img class="sjcda-top-bar__logo" src="img/stjude-logo-child-white.png">
			</a>
		</div>
		<span class="bold-font" v-on:click='goHome'>ST. JUDE CLOUD</span>
		<span class="lighter-font" v-on:click='goHome'>PLATFORM</span>
	</div>
</template>

<script>
export default {
	methods: {
		goHome() {
			if (this.$store.getters.environment === "dev") {
				this.$router.replace('/home');
			} else {
				console.error("Tried to go home, but we are not in 'dev' mode!");
			}
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

.sjcda-top-bar__logo_container {
	display: inline-block;
	margin-left: 5px;
}

.sjcda-top-bar__logo {
	height: 50px;
}

.bold-font {
	font-weight: bold;
}

.lighter-font {
	font-weight: lighter;
}
</style>
