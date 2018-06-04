<template>
	<div class='row'>
    <spin-kit id="loading-indicator" btmLabel='Loading...'></spin-kit>
	</div>
</template>

<script>
import SpinKit from './SpinKit.vue';
const { ipcRenderer } = 'electron';

export default {
  components: {
    SpinKit,
  },
  mounted() {
    if (ipcRenderer) {
      // Running in an electron browser.
      // @TODO IPC call to determine state.
    } else {
      // Running in the web browser
      setTimeout(() => {
        this.$router.replace('home');
      }, 1000);
    }
  },
};
</script>

<style scoped>
#loading-indicator {
  width: 100%;
  height: 100%;
  margin-top: 150px;
}
</style>
