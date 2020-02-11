const gulp = require('gulp');
const path = require('path');
const webpack = require('webpack');
const typescript = require('gulp-typescript');

const TS_CONFIG_PATH = path.resolve(path.join(__dirname, '../tsconfig.json'));
const WEBPACK_CONFIG_PATH = path.resolve(
  path.join(__dirname, '../.webpack.conf.js'),
);
const webpackConfig = require(WEBPACK_CONFIG_PATH);

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
