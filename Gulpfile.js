//Gulpfile.js
const gulp = require('gulp');
const gulpUtil = require('gulp-util');
//build.js
const path = require('path');
const webpack = require('webpack');
const merge = require('merge-stream');
const typescript = require('gulp-typescript');
//docs.js
const serve = require('gulp-webserver');
const jsdoc = require('gulp-jsdoc3');
//general.js
const clean = require('gulp-clean');
//publish.js
const fs = require('fs');
const util = require('util');
const log = require('fancy-log');
const bump = require('gulp-bump');
const child = require('child_process');
const PluginError = require('plugin-error');
//test.js
const karma = require('karma');
const jasmine = require('gulp-jasmine');
const { parseConfig } = require('karma/lib/config');

//---------general.js----------------

if (!process.env.NODE_ENV) process.env.NODE_ENV = 'production';
const DEFAULT_ENV = process.env.NODE_ENV || 'production';

/**
 *  Temp folder
 */

gulp.task('clean:tmp:test:frontend', () =>
  gulp
    .src('.tmp/test/frontend', { allowEmpty: true }, { read: false })
    .pipe(clean()),
);
gulp.task('clean:tmp:test:backend', () =>
  gulp
    .src('.tmp/test/backend', { allowEmpty: true }, { read: false })
    .pipe(clean()),
);
gulp.task(
  'clean:tmp:test',
  gulp.parallel('clean:tmp:test:backend', 'clean:tmp:test:frontend'),
);
gulp.task('clean:tmp', gulp.series('clean:tmp:test'));

/**
 *  App folder
 */

gulp.task('clean:app:bin:frontend', () =>
  gulp
    .src('app/bin/frontend', { allowEmpty: true }, { read: false })
    .pipe(clean()),
);
gulp.task('clean:app:bin:backend', () =>
  gulp
    .src('app/bin/backend', { allowEmpty: true }, { read: false })
    .pipe(clean()),
);
gulp.task(
  'clean:app:bin',
  gulp.parallel('clean:app:bin:frontend', 'clean:app:bin:backend'),
);
gulp.task('clean:app', gulp.series('clean:app:bin'));

/**
 *  Main tasks
 */

gulp.task('clean', gulp.parallel('clean:tmp', 'clean:app:bin'));

gulp.task('env:set-test', done => {
  process.env.NODE_ENV = 'testing';
  done();
});

gulp.task('env:set-default', done => {
  process.env.NODE_ENV = DEFAULT_ENV;
  done();
});

//--------build.js--------

const TS_CONFIG_PATH = path.resolve(path.join(__dirname, './tsconfig.json'));
const WEBPACK_CONFIG_PATH = path.resolve(
  path.join(__dirname, './.webpack.conf.js'),
);
const webpackConfig = require(WEBPACK_CONFIG_PATH);

const sources = {
  frontend: ['app/src/frontend/**/*'],
  backend: ['app/src/backend/**/*'],
};

gulp.task(
  'compile:frontend:source',
  gulp.series(
    (compileFrontendSourceCB = callback => {
      const wpInstance = webpack(webpackConfig);
      wpInstance.run(err => {
        if (err) {
          return callback(err);
        }
        return callback();
      });
    }),
  ),
);

gulp.task(
  'compile:frontend:spec',
  gulp.series(
    (compileFrontendSpecCB = () =>
      gulp
        .src('app/src/frontend/spec/*.js')
        .pipe(gulp.dest('.tmp/test/frontend/'))),
  ),
);

gulp.task(
  'compile:frontend',
  gulp.series('compile:frontend:source', 'compile:frontend:spec'),
);

gulp.task(
  'compile:backend:source',
  gulp.series(
    (compileBackendSourceCB = () =>
      gulp
        .src('app/src/backend/**/*.ts')
        .pipe(typescript.createProject(TS_CONFIG_PATH)())
        .pipe(gulp.dest('app/bin/backend'))),
  ),
);

gulp.task(
  'compile:backend:spec',
  gulp.series(
    (compileBackendSpecCB = () =>
      gulp
        .src('app/src/backend/spec/*.ts')
        .pipe(typescript.createProject(TS_CONFIG_PATH)())
        .pipe(gulp.dest('.tmp/test/backend/'))),
  ),
);

gulp.task(
  'compile:backend',
  gulp.parallel('compile:backend:source', 'compile:backend:spec'),
);
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
    () => {
      gulpUtil.log('Initial compilation complete!');
      gulpUtil.log('Watching for new changes...');
    },
  ),
);

//----------docs.js-------------

gulp.task(
  'docs:build',
  gulp.series('clean', 'compile:backend', callback => {
    gulp
      .src(['README.md', 'app/bin/backend/**/*.js'], { read: false })
      .pipe(jsdoc({ opts: { destination: './docs' } }, callback));
  }),
);

gulp.task('docs:serve', done => {
  gulp.src('docs').pipe(
    serve({
      livereload: true,
      open: true,
      port: 8080,
    }),
  );
  done();
});

gulp.task('docs', gulp.series('docs:build', 'docs:serve'));

//------------publish.js---------------

/* eslint-disable no-console */

const exec = util.promisify(child.exec);
const readFile = util.promisify(fs.readFile);

function bumpVersion(level, cb) {
  exec('git rev-parse --abbrev-ref HEAD')
    .then(result => {
      const { stdout } = result;
      const [branch] = stdout.split('\n');
      if (branch !== 'development') {
        throw new Error('Branch must be "development" when bumping version!');
      }

      gulp
        .src('./package.json')
        .pipe(bump({ type: level }))
        .pipe(gulp.dest('./'))
        .on('end', () => {
          exec('git add package.json')
            .then(() => readFile('./package.json', 'utf-8'))
            .then(contents => {
              const { version } = JSON.parse(contents);
              return exec(`git commit -m "Bumped to version ${version}"`);
            })
            .then(() => {
              console.log();
              console.log(
                'Your version bump has now been successfully committed to git.',
              );
              console.log(
                'However, you\'ll need to do a "git push" to see the change in Github',
              );
              console.log();
              cb();
            })
            .catch(error => {
              console.log(error.stack);
              process.exit(1);
            });
        });
    })
    .catch(error => {
      console.log(error.stack);
      process.exit(1);
    });
}

gulp.task('bump:major', cb => bumpVersion('major', cb));
gulp.task('bump:minor', cb => bumpVersion('minor', cb));
gulp.task('bump:patch', cb => bumpVersion('patch', cb));

//--------------test.js----------------

const KARMA_CONFIG_PATH = path.resolve(
  path.join(__dirname, './.karma.conf.js'),
);

//const sources = {
//  frontend: ['app/src/frontend/**/*'],
//  backend: ['app/src/backend/**/*'],
//};

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
  gulpUtil.log('');
  return runKarma({ singleRun: true }, done);
};

const testBackend = () => {
  gulpUtil.log('');
  return gulp.src('app/bin/backend/*.spec.js').pipe(jasmine({ verbose: true }));
};

gulp.task('test:frontend:no-compile', testFrontend);
gulp.task('test:backend:no-compile', testBackend);
gulp.task(
  'test:frontend',
  gulp.series(gulp.series('env:set-test', 'compile:frontend'), testFrontend),
);
gulp.task(
  'test:backend',
  gulp.series(gulp.series('env:set-test', 'compile:backend'), testBackend),
);
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
  gulp.series('clean', gulp.series('test:backend', 'test:frontend')),
);

//------------Gulpfile.js--------------

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
