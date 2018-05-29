<template>
	<div class='alert-main-div' v-show="alertType!=''">
		<div v-show="alertType=='info'" class='alert alert-info'>
			<span v-html='alertMessage' @click.stop='clickHandler'>{{ alertMessage }}</span>
			<div class='material-icons closer' @click.stop='close'>close</div>
		</div>
		<div v-show="alertType=='success'" class='alert alert-success'>
			<span v-html='alertMessage' @click.stop='clickHandler'>{{ alertMessage }}</span>
			<div class='material-icons closer' @click.stop='close'>close</div>
		</div>
		<div v-show="alertType=='warning'" class='alert alert-warning'>
			<span v-html='alertMessage' @click.stop='clickHandler'>{{ alertMessage }}</span>
			<div class='material-icons closer' @click.stop='close'>close</div>
		</div>
		<div v-show="alertType=='danger'" class='alert alert-danger'>
			<span v-html='alertMessage' @click.stop='clickHandler'>{{ alertMessage }}</span>
			<div class='material-icons closer' @click.stop='close'>close</div>
		</div>
	</div>
</template>

<script>
export default {
  computed: {
    alertMessage() {
      return this.$store.getters.alertMessage;
    },
    alertType() {
      return this.$store.getters.alertType;
    },
  },
  methods: {
    close() {
      this.$store.commit('byKey', {alertType: ''});
    },
    clickHandler(event) {
      if (event.target.className != 'alert-link') return;
      this.$root.backend.utils.openExternal(event.target.innerHTML);
    },
  },
};
</script>

<style scoped>
.alert-main-div {
  position: absolute;
  top: 5px;
  left: 40%;
  margin-right: 5px;
  z-index: 9999;
}

.alert {
  display: inline-block;
  padding-right: 25px;
}

.closer {
  position: absolute;
  top: 5px;
  right: 5px;
  font-size: 14px;
  font-weight: 600;
  cursor: default;
}
</style>
