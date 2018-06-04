<template>
	<div class='sjcdta-container'>
		<nav-bar></nav-bar>
		<router-view keep-alive class='app-route-placement'></router-view>
  </div>
</template>

<script>
import NavBar from './components/NavBar.vue';

export default {
  components: {
    NavBar,
  },
};
</script>

<style scoped>
.sjcdta-container {
  width: 100%;
  height: 100%;
}

.app-route-placement {
  margin: 0px;
}
</style>
