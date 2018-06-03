<template>
	<div class='sjcda-container'>
		<top-bar></top-bar>
    Hello, world!
  </div>
</template>

<script>
import TopBar from './components/TopBar.vue';

export default {
  components: {
    TopBar,
  },
};
</script>

<style>
html {
  background-color: darkgrey;
}

body {
  position: fixed;
  width: 900px;
  height: 600px;
  margin: 0px auto;
  font-family: 'Open Sans', 'Helvetica Neue', Helvetica, Arial, sans-serif;
}
</style>
