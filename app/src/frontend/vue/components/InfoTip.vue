<template>
  <div class='info-icon-wrapper-div'>
    <i class='material-icons info-icon'
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
      return this.$store.getters.infoTipText;
    },
  },
  data: () => {
    return {
      tippyOptions: {
        size: 'big',
      },
    };
  },
};
</script>

<style scoped>
.info-icon {
  color: #018dc4;
  cursor: pointer;
  margin-top: -5px;
}

.info-icon-wrapper-div {
  display: inline-block;
  padding: 0;
  margin: 0;
}

.tippy-tooltip-content {
  font-size: 16px !important;
}
</style>
