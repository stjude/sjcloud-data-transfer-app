<template>
	<div class='sjcda-container'>
		<top-bar></top-bar>
		<router-view keep-alive class='app-route-placement'></router-view>
	</div>
</template>

<script>
import TopBar from './components/TopBar.vue';

export default {
	components: {
		TopBar
	},
	data() {
		return {}
	},
	computed: {
		currTool() {
			return this.$store.getters.currTool
		},
		tools() {
			return this.$store.getters.tools
		}
	},
	created() {
		window.addEventListener('keydown', this.toggleToolPath)
		this.$store.commit('setCurrPath', this.$route.path.slice(1))
	},
	updated() {
		this.$store.commit('setCurrPath', this.$route.path.slice(1))
	},
	mounted() {
		window.VueApp = this;
	},
	methods: {
		toggleToolPath() {
			if (this.$store.getters.currPath != "upload" && this.$store.getters.currPath != "download") {
				return;
			}

			if (event.keyCode == 38 || event.keyCode == 40) {
				const names = []
				const incr = event.keyCode == 38 ? -1 : 1;
				let i = -1;
				this.tools.forEach((t,j) => {
					names.push(t.name)
					if (t.name == this.currTool.name) i = j;
				});
				
				const toolName=i<0 || i+incr<0 ? names[0] 
					: i+incr>=names.length ? names[names.length-1]
					: names[i+incr]
				this.$store.commit('setCurrToolName',toolName)
			}
			// else if (event.keyCode==37) {
			// 	this.$router.push('/upload')
			// }
			// else if (event.keyCode==39) {
			// 	this.$router.push('/download')
			// }
		}
	}
}
</script>

<style>
body {
	position:fixed;
	width: 900px;
	height: 600px;
	margin: 0px auto;
	font-family: "Open Sans", "Helvetica Neue", Helvetica, Arial, sans-serif;
}

.app-route-placement {
	height: 560px;
	width: 900px;
}


.sjcda-container {
	background-color: #FFFFFF;
	overflow: hidden;
}


.row {
	margin-left:0;
	margin-right:0;
}

.left-panel-container {
	padding: 0px;
}

.right-panel-container {
	height: 570px;
    overflow: scroll;
}

.right-panel {
    border-bottom: 1px solid #ccc;
}

.bottom-bar {
	position: absolute;
	bottom: 20px;
	left: 10px;
	width: 570px;
	margin-left: 10px;
	background-color: #fff;
}

.bottom-bar-left {
	text-align: left;
	float: left;
}

.bottom-bar-right {
	text-align: right;
	float: right;
}

</style>
