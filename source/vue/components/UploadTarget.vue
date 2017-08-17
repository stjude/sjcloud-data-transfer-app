<template>
	<!--<div class=''
		style='height:400px; width:90%; margin:20px; border:1px dashed #aaa'>
		<p style="margin-top:100px">DRAG FILES HERE</p>
		<p>or</p>
		<p><button class='btn btn-xs'>Select files ...</button></p>
	</div>-->
	<dropzone ref="dz" id='sjcda-dz' url="https://httpbin.org/post" v-on:vdropzone-success="showSuccess">
        <!-- Optional parameters if any! -->
        <input type="hidden" name="token" value="xxx">
    </dropzone>
</template>

<script>
import Dropzone from 'vue2-dropzone'

export default {
	components:{
		Dropzone
	},
	props: [
		'currTool'
	],
	methods: {
		showSuccess() {
			const files=this.$refs.dz.getAcceptedFiles(); console.log(files)
		}
	}
}
</script>

<style scoped>
p {
	width:100%;
	text-align: center;
}
	
</style>
