window.$ = window.jQuery = require("../../bower_components/jquery/dist/jquery.min.js");

$(function () {
	const dx = require('../../src/dx-toolkit');
	const sjutils = require('../../src/utils');
	const {dialog} = require('electron').remote
	const async = require('async')

	$('#select-files-btn').click(function () {
		dialog.showOpenDialog({properties: ['openFile', 'multiSelections']},
			function (files) {
				$('#files-list').empty()
				files.forEach(function (elem) {
					$('#files-list').append("<li>"+elem+"</li>")
				})
			})
	})

	$('#upload-btn').click(function () {
		$('.hide-on-upload').hide()
		$('.show-on-upload').show()
		performUpload();
	})

	var holder = document.getElementById('drag-file');

	holder.ondragover = () => {
		return false;
	};

	holder.ondragleave = () => {
		return false;
	};

	holder.ondragend = () => {
		return false;
	};

	holder.ondrop = (e) => {
		e.preventDefault();

		$('#files-list').empty()
		for (let f of e.dataTransfer.files) {
			$('#files-list').append("<li>"+f.path+"</li>")
		}
		
		return false;
	};

	function performUpload() {
		let projectName = $('#project-list').find(":selected").text()
		var tasks = []
		$('#files-list').children().each(function () {
			let fileName = $(this).text();
			tasks.push(function (next) {
				$('body').append("Uploading ", fileName, " to ", projectName, ".<br>")
				dx.uploadFile(fileName, projectName, function (err, result) {
					next(err, result)
				})
			})
		})

		async.series(tasks, function (err, result) {
			if (err) {
				console.error("An error occurred!")
				return
			}

			console.log("Successful!")
		})
	}

	sjutils.readToken(function (err, token) {
		if (err) {
			console.log("Error: " + err)
			return;
		}

		dx.login(token, function (err, status) {
			if (err || !status) {
				document.write("Could not log in!")
				return
			}

			dx.listProjects(function (err, status, results) {
				if (err || !status) {
					document.write("Could not get projects.")

					return
				} else {
					let project_select = document.getElementById("project-list")
					results.forEach(function (elem) {
						var option = document.createElement("option");
						option.text = elem["project_name"]
						project_select.add(option);
					})
				}
			});
		})
	})
})
