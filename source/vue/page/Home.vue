<template>
	<div class='row'>
		<div class='col-xs-12' style='text-align:center;padding-top:20%;'>
			<h1>Homepage under contruction ...</h1>
			<div style='font-size:20px'>
				<router-link to='/upload'>Upload</router-link>
				<span>&nbsp;&nbsp;&nbsp;</span>
				<router-link to='/download'>Download</router-link>
			</div>
		</div>
	</div>
</template>

<script>
export default {
	data() {
		return {}
	},
	mounted() {
		console.log('Welcome mounted')
	}
}
</script>

<style>
</style>