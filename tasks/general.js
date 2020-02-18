const gulp = require('gulp');
const gulpClean = require('gulp-clean');

/**
 *  Temp folder
 */

gulp.task('clean:tmp:test:frontend', () =>
  gulp
    .src('.tmp/test/frontend', { allowEmpty: true }, { read: false })
    .pipe(gulpClean()),
);
gulp.task('clean:tmp:test:backend', () =>
  gulp
    .src('.tmp/test/backend', { allowEmpty: true }, { read: false })
    .pipe(gulpClean()),
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
    .pipe(gulpClean()),
);
gulp.task('clean:app:bin:backend', () =>
  gulp
    .src('app/bin/backend', { allowEmpty: true }, { read: false })
    .pipe(gulpClean()),
);
gulp.task(
  'clean:app:bin',
  gulp.parallel('clean:app:bin:frontend', 'clean:app:bin:backend'),
);
gulp.task('clean:app', gulp.series('clean:app:bin'));
