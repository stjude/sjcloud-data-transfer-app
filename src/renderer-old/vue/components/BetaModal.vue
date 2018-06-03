<template>
	<transition name="modal">
		<div class="modal-mask" @click='hide'>
		  <div class="modal-wrapper">
		    <div class="modal-container modal-container-toolkit">
		      <div class="close-div" @click='hide'>
		      	<i class="material-icons">close</i>
		      </div>

		      <div class="modal-body">
		        <slot name="body">
              <p>
                Thank you for using the St. Jude Cloud data transfer application!
                We are aware that some users (especially those using Windows)
                are experiencing issues with the app. If you get stuck, please
                follow <a href='' target='_blank' @click.prevent='open("https://stjude.github.io/sjcloud-docs/guides/data/upload-data.html",$event)'>this guide</a>
                for how to upload/download data using the command line. You 
                can also <a href='' target='_blank' @click.prevent='open("https://github.com/stjude/sjcloud-data-transfer-app/issues",$event)'>file an issue</a>
                or <a href='' target='_blank' @click.prevent='open("https://stjude.cloud/contact/",$event)'>contact us</a>.
              </p>
		        </slot>
		      </div>
		    </div>
		  </div>
		</div>
	</transition>
</template>

<script>
export default {
  methods: {
    hide() {
      this.$store.commit('hideModal', 'beta');
    },
    open(url, event) {
      event.preventDefault();
      event.stopPropagation();
      this.$root.backend.utils.openExternal(url);
      return false;
    },
  },
};
</script>

<style scoped>
p {
  font-size: 18px;
  color: black;
  font-family: 'Helvetica Neue', Helvetica, sans-serif;
}

.modal-mask {
  position: fixed;
  z-index: 9998;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  max-height: 640px;
  background-color: rgba(0, 0, 0, 0.5);
  display: table;
  transition: opacity 0.3s ease;
}

.modal-wrapper {
  display: table-cell;
  vertical-align: middle;
}

.modal-container {
  width: 450px;
  margin: 0px auto;
  padding: 20px 30px;
  background-color: #fff;
  border-radius: 2px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.33);
  transition: all 0.3s ease;
}

.modal-header h3 {
  margin-top: 0;
  color: #42b983;
}

.modal-body {
  margin: 20px 0;
  font-size: 24px;
}

.modal-default-button {
  float: right;
}

/*
* The following styles are auto-applied to elements with
* transition="modal" when their visibility is toggled
* by Vue.js.
*
* You can easily play with the modal transition by editing
* these styles.
*/

.modal-enter {
  opacity: 0;
}

.modal-leave-active {
  opacity: 0;
}

.modal-enter .modal-container,
.modal-leave-active .modal-container {
  -webkit-transform: scale(1.1);
  transform: scale(1.1);
}

.modal-container-toolkit {
  position: relative;
}

.close-div {
  position: absolute;
  top: 20px;
  right: 20px;
  cursor: default;
}
</style>