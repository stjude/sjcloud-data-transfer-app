const gulp = require('gulp');
const gulpUtil = require('gulp-util');
const karma = require('karma');
const jasmine = require('gulp-jasmine');
const { parseConfig } = require('karma/lib/config');
const path = require('path');
var HubRegistry = require('gulp-hub');

var hub = new HubRegistry(['./tasks/*.js']);
gulp.registry(hub);

const sources = {
  frontend: ['app/src/frontend/**/*'],
  backend: ['app/src/backend/**/*'],
};

const KARMA_CONFIG_PATH = path.resolve(
  path.join(__dirname, './.karma.conf.js'),
);

/**
 *  Main tasks
 */

if (!process.env.NODE_ENV) process.env.NODE_ENV = 'production';
const DEFAULT_ENV = process.env.NODE_ENV || 'production';

gulp.task('clean', gulp.parallel('clean:tmp', 'clean:app:bin'));

gulp.task('env:set-test', done => {
  process.env.NODE_ENV = 'testing';
  done();
});

gulp.task('env:set-default', done => {
  process.env.NODE_ENV = DEFAULT_ENV;
  done();
});

// Build
gulp.task(
  'compile',
  gulp.series('clean', gulp.parallel('compile:frontend', 'compile:backend')),
);

gulp.task('watch', done => {
  gulp.watch(sources.frontend, gulp.series('compile:frontend'));
  gulp.watch(sources.backend, gulp.series('compile:backend'));
  done();
});

/**
 * Watch the source files then recompile on changes.
 */
gulp.task(
  'develop',
  gulp.series(
    'clean',
    gulp.parallel('watch', 'compile:frontend', 'compile:backend'),
    function logMessage(cb) {
      gulpUtil.log('Initial compilation complete!');
      gulpUtil.log('Watching for new changes...');
      cb();
    },
  ),
);

// Tests

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

const startFrontendTest = done => {
  gulpUtil.log('Starting frontend tests');
  return runKarma({ singleRun: true }, done);
};

const testBackend = () => {
  gulpUtil.log('');
  return gulp.src('app/bin/backend/*.spec.js').pipe(jasmine({ verbose: true }));
};

gulp.task('test:frontend:no-compile', startFrontendTest);
gulp.task('test:backend:no-compile', testBackend);
gulp.task('test:frontend', gulp.series('compile:frontend', startFrontendTest));
gulp.task('test:backend', gulp.series('compile:backend', testBackend));
gulp.task('test:frontend:watch', () =>
  gulp.watch(sources.frontend, gulp.series('test:frontend')),
);
gulp.task('test:backend:watch', () =>
  gulp.watch(sources.backend, gulp.series('test:backend')),
);
gulp.task(
  'test:watch',
  gulp.parallel('test:frontend:watch', 'test:backend:watch'),
);
gulp.task(
  'test',
  gulp.series('clean', 'env:set-test', 'test:backend', 'test:frontend'),
);

// Docs
gulp.task(
  'docs',
  gulp.series('clean', 'compile:backend', 'docs:build', 'docs:serve'),
);

gulp.task('default', done => {
  gulpUtil.log('Commands you might be interested in:');
  gulpUtil.log('');
  gulpUtil.log('  == General ==');
  gulpUtil.log('');
  gulpUtil.log('    gulp clean        , Clean relevant directories.');
  gulpUtil.log('');
  gulpUtil.log('  == Building ==');
  gulpUtil.log('');
  gulpUtil.log(
    '    gulp compile      , Compile front-end and backend code once.',
  );
  gulpUtil.log(
    '    gulp develop      , Run a autocompiling server for both frontend and backend.',
  );
  gulpUtil.log('');
  gulpUtil.log('  == Testing ==');
  gulpUtil.log('');
  gulpUtil.log(
    '    gulp test         , Run all testing functionality for the project.',
  );
  gulpUtil.log('    gulp test:watch   , Run all tests, watch for updates.');
  gulpUtil.log('');
  gulpUtil.log('  == Publishing ==');
  gulpUtil.log(
    '    gulp bump:<LEVEL> , Bump the version of the app by the SemVer <LEVEL> (semver.org).',
  );
  gulpUtil.log('');
  gulpUtil.log('  == Documentation ==');
  gulpUtil.log('');
  gulpUtil.log('    gulp docs         , Build documentation for the project.');
  gulpUtil.log(
    '    gulp docs:serve   , Build documentation then serve at localhost:8080.',
  );
  gulpUtil.log('');
  done();
});
