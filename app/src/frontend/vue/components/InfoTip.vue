<template>
  <div class='info-icon-wrapper-div'>
    <i class='material-icons icon'
       :title="infoTipText"
       v-tippy="{'size': 'big', 'position': 'bottom', 'arrow': true}">
      info
    </i>
  </div>
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
.info-icon-wrapper-div {
  display: inline-block;
  vertical-align: middle;
  padding: 0 0 0 0;
  overflow: hidden;
  margin: 0;
  height: 30px;
}

.tippy-tooltip-content {
  font-size: 16px !important;
}
</style>