<template>
	<div class='sjcda-top-bar unselectable'>
		<div class='sjcda-top-bar__logo_container'>
			<img class="sjcda-top-bar__logo"
					 src="img/stjude-logo-child-white.png"
					 @click='goHome'>
		</div>
	    <div class="sjcda-title-container">
	      <span class="title-font" @click='goHome'>St. Jude Cloud</span>
	      <span class="title-font-thin" @click='goHome'>Platform</span>
	    </div>
	    <div class='material-icons' 
	    	style='float:right; margin: 10px 10px 0 0'
	    	@click.stop='toggleMenu'>
	    	view_headline
	    </div>
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
		},
		toggleMenu() {
			this.$store.commit('toggleMenu');
		}
	}
}
</script>

<style>
.sjcda-top-bar {
	/* background-color: #2A8BB6; */
	background-color: #1381B3;
	border-width: 3px;
	border-style: solid;
	border-color: #1381B3;
	color: #FFFFFF;
	cursor: default;
	display: inline-block; 
	font-family: "Open Sans", "Lato", "Helvetica Neue", Helvetica, Arial, sans-serif;
	font-size: 22px; 
	height: 60px;
	padding-top: 0.3rem; 
	vertical-align: top; 
	width: 100%;
	vertical-align: middle;
}

.sjcda-top-bar__logo_container {
	display: inline-block;
	margin-left: 2px;
}

.sjcda-top-bar__logo {
  margin-top: 2px;
  padding: 5px;
  padding-right: 8px;
	height: 47px;
  border-right: 1px solid #7DBAD5;
}

.sjcda-title-container {
  display: inline;
  margin-left: 15px;
  margin-top: 7px;
}

.title-font {
	font-weight: 800;
}

.title-font-thin {
	font-weight: 300;
  color: #A1CDE1;
}
</style>
