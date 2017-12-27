const gulp = require('gulp');
const bump = require('gulp-bump');

function bumpVersion(level) {
  return gulp.src('./package.json')
    .pipe(bump({
      type: level,
    }))
    .pipe(gulp.dest('./'));
}

gulp.task('bump:major', () => bumpVersion('major'));
gulp.task('bump:minor', () => bumpVersion('minor'));
gulp.task('bump:patch', () => bumpVersion('patch'));
