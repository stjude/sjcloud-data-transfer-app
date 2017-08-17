<template>
	<div id='sjcda-container' style='background-color: #fff'>
		<top-bar></top-bar>
			<router-view keep-alive 
				class='app-route-placement' 
				style='height:560px;width:900px;'>
			</router-view>
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
		this.$store.commit('trackProgress')
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
	width:900px;
	height:600px;
	margin:auto;
	font-family: "Open Sans", "Helvetica Neue", Helvetica, Arial, sans-serif;
}

.btn-stjude {
  display: inline-block;
  -webkit-box-sizing: content-box;
  -moz-box-sizing: content-box;
  box-sizing: content-box;
  cursor: pointer;
  padding: 10px 20px;
  border: 1px solid #018dc4;
  border-bottom: 3px solid #0f6282;
  -webkit-border-radius: 3px;
  border-radius: 3px;
  font: normal 16px / normal "Open Sans", "Roboto", Times, serif;
  color: rgba(255, 255, 255, 0.9);
  -o-text-overflow: clip;
  text-overflow: clip;
  background: #158cba;
  -webkit-transition: all 100ms cubic-bezier(0.42, 0, 0.58, 1);
  -o-transition: all 100ms cubic-bezier(0.42, 0, 0.58, 1);
  transition: all 100ms cubic-bezier(0.42, 0, 0.58, 1);
}

.btn-stjude:hover {
  color: #ffffff;
}

.btn-stjude:active {
  background-color: #0076AD;
  transform: translateY(1px);
}

.btn-stjude-warning {
  display: inline-block;
  -webkit-box-sizing: content-box;
  -moz-box-sizing: content-box;
  box-sizing: content-box;
  cursor: pointer;
  padding: 10px 20px;
  border-bottom: 3px solid #4d0b1e;
  -webkit-border-radius: 3px;
  border-radius: 3px;
  font: normal 16px / normal "Open Sans", "Roboto", Times, serif;
  color: rgba(255, 255, 255, 0.9);
  -o-text-overflow: clip;
  text-overflow: clip;
  background: #921638;
  -webkit-transition: all 100ms cubic-bezier(0.42, 0, 0.58, 1);
  -o-transition: all 100ms cubic-bezier(0.42, 0, 0.58, 1);
  transition: all 100ms cubic-bezier(0.42, 0, 0.58, 1);
}

.btn-stjude-warning:hover {
  color: #ffffff;
}

.btn-stjude-warning:active {
  background-color: #7c132f;
  transform: translateY(1px);
}
</style>
