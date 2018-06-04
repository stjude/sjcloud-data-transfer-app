<template>
	<div class='row'>
		<div class='col-xs-12 home-container' >
			<h1>Development Mode Enabled</h1>
			<div class="home-container-text">
				<div><router-link to='/login'>Log In</router-link></div>
				<div><router-link to='/upload'>Upload</router-link></div>
				<div><router-link to='/download'>Download</router-link></div>
			</div>
		</div>
	</div>
</template>

<script>
export default {};
</script>

<style>
.home-container {
  text-align: center;
  padding-top: 20%;
  margin: auto;
}

.home-container-text {
  font-size: 20px;
}
</style>
