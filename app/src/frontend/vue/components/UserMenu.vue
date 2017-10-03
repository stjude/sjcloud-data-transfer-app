<template>
    <div id='sjcda-top-bar-menu' v-show='isVisible'>
	    <div id='tour-btn'
	    	class='menu-item'
	    	v-show='showTourBtn'
	    	@click.stop='tour'>
	    	Tour
	    	<span class='material-icons menu-icon' style='color: #1381B3;'>explore</span>
	    </div>
	    <div id='issues-btn'
	    	class='menu-item'
	    	title='File A Bug Report' tippy
	    	@click.stop='fileAnIssue'>
	    	Bug Report
	    	<span class='material-icons menu-icon' style='color: #b71c1c;'>error_outline</span>
	    </div>
	    <div id='logout-btn'
	    	class='menu-item'
	    	v-show='showLogoutBtn'
	    	@click='logout'>
	    	Logout
	    	<span class='material-icons menu-icon'>exit_to_app</span>
	    </div>
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
			return true //this.$route.path=='/download' || this.$route.path=='/upload';
		},
		isVisible() {
			return this.$store.getters.menuIsVisible;
		}
	},
	methods: {
		logout() {
	      this.$store.commit('toggleMenu');
	      window.dx.logout((err, result) => {
	      	this.$store.commit('setLoginState','waiting');
	        this.$router.replace('/login');
	    	});
    	},
    	tour() {
    		this.$store.commit('toggleMenu');
			tour.__start();
		},
		fileAnIssue() {
			window.utils.openExternal('https://github.com/stjude/sjcloud-data-transfer/issues');
			this.$store.commit('toggleMenu');
		}
	}
}
</script>

<style scoped>
#sjcda-top-bar-menu {
	position: absolute;
	top: 40px;
	right: 17px;
	/*width: 100px;*/
	padding: 10px;
	z-index: 2000;
	background-color: #fff;
	border: 1px solid #ccc;
}

.menu-item {
	width: 120px;
	/*text-align: center;*/
	cursor: pointer;
	padding: 5px 10px;
	line-height: 16px;
}

.menu-item:hover {
	background-color: rgba(145, 202, 251, 0.3);
}


.menu-icon {
	vertical-align: top;
	font-size: 16px;
}

#tour-btn {
}

#logout-btn {
	font-size: 12px;
	line-height: 1.5;
	border-radius: 3px;
}

#issues-btn {
}
</style>
