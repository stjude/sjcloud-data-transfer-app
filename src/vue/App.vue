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
		this.$store.commit('setCurrPath',this.$route.path.slice(1))
	},
	mounted() {
		console.log('App mounted')
	},
	updated() {
		//console.log('App updated')
		this.$store.commit('setCurrPath',this.$route.path.slice(1))
	},
	methods: {
		toggleToolPath() {
			if (event.keyCode==38 || event.keyCode==40) {
				const names=[]
				const incr=event.keyCode==38 ? -1 : 1
				let i=-1
				this.tools.forEach((t,j)=>{
					names.push(t.name)
					if (t.name==this.currTool.name) i=j;
				});
				
				const toolName=i<0 || i+incr<0 || i+incr>=names.length ? names[0] : names[i+incr]
				this.$store.commit('setCurrToolName',toolName)
			}
			else if (event.keyCode==37) {
				this.$router.push('/upload')
			}
			else if (event.keyCode==39) {
				this.$router.push('/download')
			}
		}
	}
}
</script>

<style>
body {
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
}

</style>
