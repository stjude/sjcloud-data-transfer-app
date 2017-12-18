const gulp = require('gulp');
const clean = require('gulp-clean');

gulp.task('clean:tmp:test:frontend', () => gulp.src('.tmp/test/frontend', { read: false }).pipe(clean()));
gulp.task('clean:tmp:test:backend', () => gulp.src('.tmp/test/backend', { read: false }).pipe(clean()));
gulp.task(
  'clean:tmp:test',
  ['clean:tmp:test:backend', 'clean:tmp:test:frontend'],
);
gulp.task('clean:tmp', ['clean:tmp:test']);
gulp.task('clean', ['clean:tmp']);
