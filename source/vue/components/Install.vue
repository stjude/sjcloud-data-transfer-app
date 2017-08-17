<template>
	<div class="row">
		<div class='col-xs-12 main'>
			<div class="theater-heading">
				<h1>Install</h1>
				<hr>
			</div>
			<div class='theater-body'>
				<div class="col-xs-6">
					<img src="http://via.placeholder.com/350x300">
				</div>
				<div class="col-xs-6">
					<div>
						Use of the St. Jude Cloud desktop application requires the installation of third-party software. We'll take care of installing that for you.
					</div>
					<div class="btn btn-large btn-stjude">Install</div>
				</div>
			</div>
		</div>
		<div class='col-xs-12 footer'>
			<div class='progress'>
				<div class='progress-bar' style='width: 100%'></div>
				<div class='progress-node progress-node-active'>1</div>
				<div class='progress-node progress-node-nonactive' style='margin-left: 142px'>2</div>
				<div class='progress-node progress-node-nonactive' style='margin-left: 277px'>3</div>
			</div>
			<div class='progress-text'>
				<span style="left: 295px">Install</span>
				<span style="left: 435px">Log In</span>
				<span style="left: 565px">Upload</span>
			</div>
		</div>
	</div>
</template>

<style scoped>
	.row {
		margin: 0px;
	}

	.main {
		margin-bottom: 50px;
	}

	.theater-heading {
		margin: 0px 45px 0px 45px;
	}

	.theater-heading > h1 {
		margin-top: 35px;
		font-style: 'Open Sans', 'Helvetica Neue';
		font-size: 36px;
		color: #000000;
	}

	.theater-heading > hr {
		margin: 10px 0px 10px 0px;
		float: center;
		border-top: 2px solid #dedede;
		width: 780px;
	}

	.theater-body {
		margin: 35px 45px 0px 45px;
		text-align: center;
		font-style: 'Open Sans', 'Helvetica Neue';
		font-size: 24px;
	}

	.theater-body .btn {
		margin: 35px 0px 50px 0px;
		width: 145px;
		font-size: 24px;
	}

	.footer .progress {
		width: 300px;
		height: 4pt;
		float: center;
		margin: 0 auto;
		margin-bottom: 25px;
	}

	.footer .progress-bar {
		background-color: #158cba;
	}

	.footer .progress-node {
		position: absolute;
		margin-top: -20px;
		z-index: 1;
		height: 45px;
		width: 45px;
		border: 3px solid #1381b3;
		border-radius: 25px;
		line-height: 40px;
		font-size: 26px;
		text-align: center;
	}

	.footer .progress-node-active{
		color: #FFFFFF;
		background-color: #158cba;
	}

	.footer .progress-node-nonactive{
		color: #158cba;
		background-color: #FFFFFF;
	}

	.footer .progress-text span{
		position: absolute;
		color: #158cba;
		font-size: 16pt;
	}
</style>