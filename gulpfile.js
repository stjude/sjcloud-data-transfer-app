const path = require("path");
const gulp = require("gulp");
const karma = require("karma");
const gutil = require("gulp-util");
const webpack = require("webpack");
const jsdoc = require("gulp-jsdoc3");
const gts = require("gulp-typescript");
const jasmine = require("gulp-jasmine");
const karmaParseConfig = require("karma/lib/config").parseConfig;

const webpackConfig = require("./webpack.conf.js");
const tsProject = gts.createProject("./tsconfig.json");

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

gulp.task("copy-frontend-spec", () => {
  return gulp.src("app/src/frontend/spec/*.js")
    .pipe(gulp.dest("test/frontend/"));
});

gulp.task("webpack",
  (callback) => {
    return webpack(webpackConfig).run((err, stats) => {
      if (err) {
        gutil.log("ERROR:", err);
        return callback();
      }

      return callback();
    });
  });

gulp.task("compile-frontend", ["copy-frontend-spec", "webpack"]);

gulp.task("copy-javascript", () => {
  return gulp.src("app/src/backend/**/*.js")
    .pipe(gulp.dest("app/bin/backend"));
});

gulp.task("compile-typescript", () => {
  return gulp.src("app/src/backend/**/*.ts")
    .pipe(tsProject())
    .pipe(gulp.dest("app/bin/backend"));
});

gulp.task("copy-backend-spec", () => {
  return gulp.src("app/bin/backend/spec/*.js")
    .pipe(gulp.dest("test/backend/"));
});

gulp.task("compile-backend",
  [
    "copy-javascript",
    "compile-typescript",
    "copy-backend-spec",
  ]);

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
const testFrontend = (done) => {
  runKarma({
    singleRun: true,
  }, done);
}

const testBackend = () => {
  return gulp.src("test/backend/*.spec.js")
             .pipe(jasmine());
}

gulp.task(
  "test-frontend",
  ["compile-frontend"],
  testFrontend
);

gulp.task(
  "test-backend",
  ["compile-backend"],
  testBackend
);

gulp.task("test", ["test-frontend", "test-backend"]);
gulp.task("test-frontend-no-compile", testFrontend);
gulp.task("test-backend-no-compile", testBackend);

gulp.task("docs", ["compile-backend"], (callback) => {
  gulp.src(
    ["README.md", "app/bin/backend/**/*.js"],
    {read: false}
  ).pipe(jsdoc({"opts": {"destination": "./docs"}}, callback));
});

gulp.task("default", () => {
  gutil.log("Commands you might be interested in:");
  gutil.log("");
  gutil.log("  gulp develop-once : Compile front-end and backend code once.");
  gutil.log("  gulp develop      : Run a autocompiling server for both frontend and backend.");
  gutil.log("  gulp test         : Run all testing functionality for the project.");
  gutil.log("");
});
