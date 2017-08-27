<template>
  <i id="icon"
     class='material-icons icon'
     :title="tooltipText"
     v-tippy="{'size': 'big', 'position': 'bottom', 'arrow': true}">
    info
  </i>
</template>

<script>
export default {
  props: {
    tooltipText: {
      default: 'Fill me in!'
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