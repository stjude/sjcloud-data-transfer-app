const path = require('path');
const gulp = require('gulp');
const karma = require('karma');
const util = require('gulp-util');
const jasmine = require('gulp-jasmine');
const { parseConfig } = require('karma/lib/config');

const KARMA_CONFIG_PATH = path.resolve(
  path.join(__dirname, '../.karma.conf.js'),
);

const sources = {
  frontend: ['app/src/frontend/**/*'],
  backend: ['app/src/backend/**/*'],
};

/**
 * Runs Karma testing through Gulp.
 *
 * @param {object} options Options on top of the default configuration.
 * @param {callback} callback Success callback
 */
function runKarma(options, callback) {
  const defaultKarmaConfig = parseConfig(KARMA_CONFIG_PATH, {});
  const config = Object.assign({}, defaultKarmaConfig, options);
  const server = new karma.Server(config);
  return server.start(callback);
}

const testFrontend = done => {
  util.log('');
  runKarma({ singleRun: true }, done);
};

const testBackend = () => {
  util.log('');
  return gulp.src('.tmp/test/backend/*.spec.js').pipe(
    jasmine({
      verbose: true,
    }),
  );
};

gulp.task('test:frontend:no-compile', testFrontend);
gulp.task('test:backend:no-compile', testBackend);
gulp.task('test:frontend', ['env:set-test', 'compile:frontend'], testFrontend);
gulp.task('test:backend', ['env:set-test', 'compile:backend'], testBackend);
gulp.task('test:frontend:watch', () =>
  gulp.watch(sources.frontend, ['test:frontend']),
);
gulp.task('test:backend:watch', () =>
  gulp.watch(sources.backend, ['test:backend']),
);
gulp.task('test:watch', ['test:frontend:watch', 'test:backend:watch']);
gulp.task('test', ['test:frontend', 'test:backend']);
