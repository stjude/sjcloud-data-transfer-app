<template>
	<div class='row'>
		<div class='col-xs-12 home-container' >
			<h1>Homepage under contruction ...</h1>
			<div class="home-container-text">
				<div><router-link to='/install'>Install</router-link></div>
				<div><router-link to='/login'>Log In</router-link></div>
				<div><router-link to='/upload'>Upload</router-link></div>
				<div><router-link to='/download'>Download</router-link></div>
			</div>
		</div>
	</div>
</template>

<script>
export default {
	data() {
		return {}
	},
}
</script>

<style>
.home-container {
	text-align: center;
	padding-top: 20%;
}

.home-container-text {
  font-size: 20px;
}
</style>
