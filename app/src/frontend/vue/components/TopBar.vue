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
	    <span id='logout-btn' 
	    	class='btn btn-sm' 
	    	style='float:right; margin: 6px 10px 0 0'
	    	v-show='showLogoutBtn'
	    	@click='logout'>
	    	Logout
	    </span>
	     <span id='tour-btn' 
	    	class='btn btn-sm' 
	    	style='float:right; margin: 6px 10px 0 0'
	    	v-show='showTourBtn'
	    	@click.stop='tour'>
	    	Tour
	    </span>
	</div>
</template>

<script>
import tour from '../../tour.js';

let tourInitialized=false;

export default {
	computed: {
		showLogoutBtn() {
			return this.$route.path=='/download' || this.$route.path=='/upload';
		},
		showTourBtn() {
			return this.$route.path=='/download' || this.$route.path=='/upload';
		}
	},
	mounted() {
		/*if (this.$route.path!='/download' && this.$route.path!='/upload') return;
		setTimeout(()=>{
			this.$store.commit('setCurrPath','download');
			setTimeout(tour.promptUser,500);
		},500);*/
	},
	methods: {
		goHome() {
			if (this.$store.getters.environment === "dev") {
				this.$router.replace('/home');
			} else {
				console.error("Tried to go home, but we are not in 'dev' mode!");
			}
		},
		logout() {
	      window.dx.logout((err, result) => {
	      	this.$store.commit('setLoginState','waiting');
	        this.$router.replace('/login');
	      });
		},
		tour() {
			if (!tourInitialized) {
				tour.init();
				tour.goTo(0);
				tourInitialized=true;
			} else {
				tour.goTo(1);
			}
			tour.start(true);
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

#logout-btn {
	padding: 5px 10px;
	font-size: 12px;
	line-height: 1.5;
	border-radius: 3px;
}

.title-font {
	font-weight: 800;
}

.title-font-thin {
	font-weight: 300;
  color: #A1CDE1;
}
</style>
