<template>
  <div class="dropzone" @dragover.prevent @drop="dropped">
    <div class="dropzone-content-container">
      <i class="material-icons md-48" style="height: 60px;">cloud_upload</i>
      <span class="dropzone-container-text">Click or drop files here</span>
    </div>
  </div>
</template>

<script>
export default {
  methods: {
    dropped(e) {
      e.preventDefault();

      for (let f of e.dataTransfer.files) {
        this.$store.commit('addFile', {name: f.path, size: 0});
      }
    }
  }
}
</script>

<style>
.dropzone {
  margin: 0px auto;
  margin-top: 25px;
  height: 450px;
  width: 540px;
  border: 3pt dashed #dedede;
  border-radius: 15px;
  font-size: 30px;
}

.dropzone-content-container {
  position: absolute;
  left: 115px;
  top: 275px;
  height: 60px;
  color: #dedede;
}

.dropzone-container-text {
  position: relative;
  top: -12px;
  left: 5px;
}

.material-icons.md-48 {
  font-size: 48px;
}
</style>