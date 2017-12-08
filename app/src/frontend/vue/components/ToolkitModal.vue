<template>
	<transition name="modal">
		<div class="modal-mask" @click='hide'>
		  <div class="modal-wrapper">
		    <div class="modal-container modal-container-toolkit">
		      <div class="close-div" @click='hide'>
		      	<i class="material-icons">close</i>
		      </div>

		      <div class="modal-body">
		        <slot name="body" style='font-style: "Open Sans", "Helvetica Neue", Helvetica, Arial, sans-serif'>
		          <div>The St. Jude Cloud Platform is powered by the genomics processing company <a href='' target='_blank' @click.prevent='open("https://www.dnanexus.com/", $event)'>DNAnexus</a>. This desktop application uses their "dx-toolkit" software, a suite of tools that enables reliable uploads and downloads of files from their servers.</div>
		          <h3>Learn more</h3>
		          <ul>
		          	<li><a href='' target='_blank' @click.prevent='open("https://github.com/dnanexus/dx-toolkit",$event)'>View dx-toolkit source</a></li>
		          	<li><a href='' target='_blank' @click.prevent='open("https://wiki.dnanexus.com/Downloads#DNAnexus-Platform-SDK",$event)'>Install the dx-toolkit yourself</a></li>
		          	<li><a href='' target='_blank' @click.prevent='open("https://wiki.dnanexus.com/Home",$event)'>DNAnexus documentation</a></li>
		          </ul>
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
			this.$store.commit('hideModal','toolkit')
		},
		open(url,event) {
			event.preventDefault();
			event.stopPropagation();
			window.utils.openExternal(url)
			return false
		}
	}
}
</script>

<style>
.modal-mask {
	position: fixed;
	z-index: 9998;
	top: 0;
	left: 0;
	width: 100%;
	height: 100%;
	max-height: 640px;
	background-color: rgba(0, 0, 0, .5);
	display: table;
	transition: opacity .3s ease;
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
	box-shadow: 0 2px 8px rgba(0, 0, 0, .33);
	transition: all .3s ease;
	font-family: Helvetica, Arial, sans-serif;
}

.modal-header h3 {
	margin-top: 0;
	color: #42b983;
}

.modal-body {
	margin: 20px 0;
	font-size: 18px;
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