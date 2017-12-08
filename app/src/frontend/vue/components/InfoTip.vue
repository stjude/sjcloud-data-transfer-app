<template>
  <i id="icon"
     class='material-icons icon'
     :title="infoTipText"
     v-tippy="{'size': 'big', 'position': 'bottom', 'arrow': true}">
    info
  </i>
</template>

<script>
export default {
  computed: {
    infoTipText() {
      return this.$store.getters.infoTipText
    }
  },
  data: () => {
    return {
      tippyOptions: {
        size: 'big'
      }
    }
  }
}
</script>

<style scoped>
  .icon {
    color: #018dc4;
    cursor: pointer
  }
</style>

<style>
  .tippy-tooltip-content {
    font-size: 16px !important;
  }
</style>