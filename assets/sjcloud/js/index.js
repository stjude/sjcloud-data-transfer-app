$(function() {
  const dx = require("../../../src/dx");
  const sjutils = require("../../../src/utils");
  const { dialog } = require("electron").remote;
  const async = require("async");

  $("#select-files-btn").click(function() {
    dialog.showOpenDialog(
      { properties: ["openFile", "multiSelections"] },
      function(files) {
        $("#files-list").empty();
        files.forEach(function(elem) {
          $("#files-list").append("<li>" + elem + "</li>");
        });
      }
    );
  });

  $("#upload-btn").click(function() {
    $(".hide-on-upload").hide();
    $(".show-on-upload").show();
    performUpload();
  });

    // $("#files-list").empty();
    // for (let f of e.dataTransfer.files) {
    //   $("#files-list").append("<li>" + f.path + "</li>");
    // }

    // return false;

  function performUpload() {
    let projectName = $("#project-list").find(":selected").text();
    var tasks = [];
    $("#files-list").children().each(function() {
      let fileName = $(this).text();
      tasks.push(function(next) {
        $("body").append("Uploading ", fileName, " to ", projectName, ".<br>");
        dx.uploadFile(fileName, projectName, function(err, result) {
          next(err, result);
        });
      });
    });

    async.series(tasks, function(err, result) {
      if (err) {
        console.error("An error occurred!");
        return;
      }

      console.log("Successful!");
    });
  }

  dx.listProjects(function(err, results) {
    if (err) {
      console.error(err);
      document.write("Could not get projects.");
      return;
    }
    let project_select = document.getElementById("project-list");
    results.forEach(function(elem) {
      var option = document.createElement("option");
      option.text = elem["project_name"];
      project_select.add(option);
    });
  });
});
