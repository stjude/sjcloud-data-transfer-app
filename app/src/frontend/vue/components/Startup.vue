<template>
	<div class='row'>
    <spin-kit id="loading-indicator" btmLabel='Loading...'></spin-kit>
	</div>
</template>

<script>
import SpinKit from './SpinKit.vue'

export default {
  components: {
    SpinKit
  },
  mounted() {
  	if (process.env.NODE_ENV === "development") {
  		setTimeout(()=>{
  			VueApp.$router.replace("home");
  		},1000);
  	}
  }
}
</script>

<style>
#loading-indicator {
  height: 100%;
  margin-top: 150px;
}
</style>
