const path = require('path');
const gulp = require('gulp');
const util = require('gulp-util');
const webpack = require('webpack');
const merge = require('merge-stream');
const typescript = require('gulp-typescript');

const TS_CONFIG_PATH = path.resolve(path.join(__dirname, '../.tsconfig.json'));
const WEBPACK_CONFIG_PATH = path.resolve(path.join(__dirname, '../.webpack.conf.js'));
const webpackConfig = require(WEBPACK_CONFIG_PATH);

const sources = {
  frontend: ['app/src/frontend/**/*'],
  backend: ['app/src/backend/**/*'],
};

gulp.task('compile:frontend:source', (callback) => {
  const wpInstance = webpack(webpackConfig);
  wpInstance.run((err) => {
    if (err) { return callback(err); }
    return callback();
  });
});

gulp.task(
  'compile:frontend:spec', ['clean:tmp:test:frontend'],
  () => gulp.src('app/src/frontend/spec/*.js')
    .pipe(gulp.dest('.tmp/test/frontend/')),
);

gulp.task('compile:frontend', ['compile:frontend:source', 'compile:frontend:spec']);

gulp.task('compile:backend:source', () => gulp.src('app/src/backend/**/*.ts')
  .pipe(typescript.createProject(TS_CONFIG_PATH)())
  .pipe(gulp.dest('app/bin/backend')));

gulp.task(
  'compile:backend:spec', ['clean:tmp:test:backend'],
  () => gulp.src('app/src/backend/spec/*.ts')
    .pipe(typescript.createProject(TS_CONFIG_PATH)())
    .pipe(gulp.dest('.tmp/test/backend/')),
);

gulp.task('compile:backend', ['compile:backend:source', 'compile:backend:spec']);
gulp.task('compile', ['compile:frontend', 'compile:backend']);

gulp.task('watch', () => {
  const frontend = gulp.watch(sources.frontend, ['compile:frontend']);
  const backend = gulp.watch(sources.backend, ['compile:backend']);
  return merge(frontend, backend);
});


/**
 * Watch the source files then recompile on changes.
 */
gulp.task(
  'develop',
  ['watch', 'compile:frontend', 'compile:backend'],
  () => {
    util.log('Initial compilation complete!');
    util.log('Watching for new changes...');
  },
);
