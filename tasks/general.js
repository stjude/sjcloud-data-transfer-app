const gulp = require('gulp');
const clean = require('gulp-clean');

if (!process.env.NODE_ENV) process.env.NODE_ENV = 'production';
const DEFAULT_ENV = process.env.NODE_ENV || 'production';

/**
 *  Temp folder
 */

gulp.task('clean:tmp:test:frontend', () => gulp.src('.tmp/test/frontend', { read: false }).pipe(clean()));
gulp.task('clean:tmp:test:backend', () => gulp.src('.tmp/test/backend', { read: false }).pipe(clean()));
gulp.task(
  'clean:tmp:test',
  ['clean:tmp:test:backend', 'clean:tmp:test:frontend'],
);
gulp.task('clean:tmp', ['clean:tmp:test']);


/**
 *  App folder
 */

gulp.task('clean:app:bin:frontend', () => gulp.src('app/bin/frontend', { read: false }).pipe(clean()));
gulp.task('clean:app:bin:backend', () => gulp.src('app/bin/backend', { read: false }).pipe(clean()));
gulp.task('clean:app:bin', ['clean:app:bin:frontend', 'clean:app:bin:backend']);
gulp.task('clean:app', ['clean:app:bin']);

/**
 *  Main tasks
 */

gulp.task('clean', ['clean:tmp', 'clean:app:bin']);

gulp.task('env:set-test', () => {
  process.env.NODE_ENV = 'testing';
});

gulp.task('env:set-default', () => {
  process.env.NODE_ENV = DEFAULT_ENV;
});
