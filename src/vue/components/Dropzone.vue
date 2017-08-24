<template>
  <div class="dropzone"
       @dragover.prevent
       @dragenter.prevent="dragging = true"
       @dragexit.prevent="dragging = false"
       @dragleave.prevent="dragging = false"
       @click.prevent="clicked"
       @drop.prevent="dropped"
       :style="dragging ? draggingDropzoneStyle : nondraggingDropzoneStyle">

    <div class="dropzone-content-container"
       :style="dragging ? draggingColorStyle : nondraggingColorStyle">
      <i class="material-icons md-48" style="height: 60px;">cloud_upload</i>
      <span class="dropzone-container-text">CLICK OR DROP FILES HERE</span>
    </div>
  </div>
</template>

<script>
export default {
  data: () => {
    return {
      dragging: false,
      nondraggingDropzoneStyle: {
        border: "3pt dashed #dedede",
      },
      draggingDropzoneStyle: {
        border: "3pt dashed #BF355B",
      },
      nondraggingColorStyle: {
        color: "#dedede"
      },
      draggingColorStyle: {
        color: "#BF355B"
      }
    }
  },
  created() {
    this.dragging = false;
  },
  methods: {
    clicked(e) {
      window.utils.openFileDialog((files) => {
        for (let f of files) {
          this.$store.commit('addFile', window.utils.fileInfoFromPath(f, true));
        }
      })
    },
    dropped(e) {
      this.dragging = false;
      for (let f of e.dataTransfer.files) {
        this.$store.commit('addFile', window.utils.fileInfoFromPath(f.path, true));
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
  border-radius: 15px;
  font-size: 30px;
  -webkit-transition: border .5s;
  transition: border .5s;
}

.dropzone-content-container {
  position: absolute;
  left: 75px;
  top: 275px;
  height: 60px;
  -webkit-transition: color .5s;
  transition: color .5s;
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