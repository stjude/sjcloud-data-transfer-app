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
       @dragover.prevent
       @dragenter.prevent="dragging = true"
       @dragexit.prevent="dragging = false"
       @dragleave.prevent="dragging = false"
       :style="dragging ? draggingColorStyle : nondraggingColorStyle">
      <i class="material-icons md-48 cloud-upload-icon">cloud_upload</i>
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
        border: "3pt dashed #2A8BB6",
      },
      nondraggingColorStyle: {
        color: "#dedede"
      },
      draggingColorStyle: {
        color: "#2A8BB6"
      }
    }
  },
  created() {
    this.dragging = false;
  },
  methods: {
    clicked(e) {
      this.$root.backend.utils.openFileDialog((files) => {
        for (let f of files) {
          this.$store.commit('addFile', this.$root.backend.utils.fileInfoFromPath(f, true));
        }
      })
    },
    dropped(e) {
      this.dragging = false;
      for (let f of e.dataTransfer.files) {
        this.$store.commit('addFile', this.$root.backend.utils.fileInfoFromPath(f.path, true));
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
  -webkit-transition: border 0.5s;
  transition: border 0.5s;
}

.dropzone-content-container {
  position: absolute;
  left: 75px;
  top: 275px;
  height: 60px;
  -webkit-transition: color 0.5s;
  transition: color 0.5s;
}

.dropzone-container-text {
  position: relative;
  top: 3px;
  left: 5px;
}

.material-icons.md-48 {
  font-size: 48px;
}

.cloud-upload-icon {
  height: 60px;
}
</style>