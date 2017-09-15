<template>
	<div class='sjcda-top-bar unselectable'>
		<div class='sjcda-top-bar__logo_container'>
			<img class="sjcda-top-bar__logo"
					 src="img/stjude-logo-child-white.png"
					 @click='goHome'>
		</div>
		<span class="bold-font" @click='goHome'>St. Jude Cloud</span>
		<span class="lighter-font" @click='goHome'>Platform</span>
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
	cursor: default;
	display: inline-block; 
	font-family: "Open Sans", "Lato", "Helvetica Neue", Helvetica, Arial, sans-serif;
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
  border-right: 1px solid #7DBAD5;
}

.bold-font {
	font-weight: 600;
}

.lighter-font {
	font-weight: 300;
  color: #A1CDE1;
}
</style>
