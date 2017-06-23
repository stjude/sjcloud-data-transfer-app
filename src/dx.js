const path = require("path");
const utils = require("./utils");

module.exports.login = function(token, callback) {
  utils.runCommand(
    "dx login --token " + token.toString() + " --noprojects",
    function(err, status, stdout) {
      if (err) {
        console.error("Could not login: " + err);
        callback(err, null);
      }

      callback(null, status);
    }
  );
};

module.exports.listProjects = function(callback) {
  utils.runCommand("dx find projects --delim $'\t'", function(
    err,
    result,
    stdout
  ) {
    if (err) {
      return callback(err, false, []);
    }

    var results = [];
    stdout.split("\n").forEach(function(el) {
      [dx_location, name, access_level, _] = el.split("\t");
      results.push({
        project_name: name,
        dx_location: dx_location,
        access_level: access_level
      });
    });

    return callback(null, true, results);
  });
};

module.exports.uploadFile = function(file, project, callback) {
  let dx_path = project + ":/" + path.basename(file.trim());
  let command = "dx upload --path '" + dx_path + "' '" + file + "'";
  utils.runCommand(command, function(err, result, stdout) {
    if (err) {
      return callback(err, false);
    }

    return callback(null, true);
  });
};
