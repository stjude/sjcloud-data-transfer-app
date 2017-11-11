const path = require("path");
const gulp = require("gulp");
const karma = require("karma");
const gutil = require("gulp-util");
const webpack = require("webpack");
const gts = require("gulp-typescript");
const karmaParseConfig = require("karma/lib/config").parseConfig;

const webpackConfig = require("./config/webpack.conf.js");
const tsProject = gts.createProject("./config/tsconfig.json");

let sources = {
  frontend: ["app/src/frontend/**/*"],
  backend: ["app/src/backend/**/*"],
};

/**
 *
 * @param {object} options
 * @param {callback} callback
 */
function runKarma(options, callback) {
  const configPath = path.resolve(path.join(__dirname, "./karma.conf.js"));
  const config = karmaParseConfig(configPath, {});

  Object.keys(options).forEach(function(key) {
    config[key] = options[key];
  });

  let server = new karma.Server(config);
  server.start(callback);
}

gulp.task("webpack", (callback) => {
  return webpack(webpackConfig).run((err, stats) => {
    if (err) {
      gutil.log("ERROR:", err);
      return callback();
    }

    return callback();
  });
});

gulp.task("compile-frontend", ["webpack"]);

gulp.task("copy-javascript", () => {
  return gulp.src("app/src/backend/**/*.js")
    .pipe(gulp.dest("app/bin/backend"));
});

gulp.task("compile-typescript", () => {
  return gulp.src("app/src/backend/**/*.ts")
    .pipe(tsProject())
    .pipe(gulp.dest("app/bin/backend"));
});

gulp.task("compile-backend", ["copy-javascript", "compile-typescript"]);

gulp.task("watch", () => {
  gulp.watch(sources.frontend, ["compile-frontend"]);
  gulp.watch(sources.backend, ["compile-backend"]);
});

gulp.task("develop-once", ["compile-frontend", "compile-backend"]);

gulp.task("develop",
  ["watch", "compile-frontend", "compile-backend"],
  () => {
    gutil.log("Initial compilation complete!");
    gutil.log("Watching for new changes...");
  }
);

/**
 * Testing
 */
gulp.task("test-frontend",
  (done) => {
    runKarma({
      singleRun: true,
    }, done);
  }
);

gulp.task("test", ["test-frontend"]);

gulp.task("default", () => {
  gutil.log("Commands you might be interested in:");
  gutil.log("");
  gutil.log("  gulp develop-once : Compile front-end and backend code once.");
  gutil.log("  gulp develop      : Run a autocompiling server for both frontend and backend.");
  gutil.log("  gulp test         : Run all testing functionality for the project.");
  gutil.log("");
});
