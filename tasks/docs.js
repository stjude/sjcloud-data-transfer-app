const gulp = require('gulp');
const serve = require('gulp-webserver');
const jsdoc = require('gulp-jsdoc3');

gulp.task('docs:build', ['compile:backend'], callback => {
  gulp
    .src(['README.md', 'app/bin/backend/**/*.js'], { read: false })
    .pipe(jsdoc({ opts: { destination: './docs' } }, callback));
});

gulp.task('docs:serve', () => {
  gulp.src('docs').pipe(
    serve({
      livereload: true,
      open: true,
      port: 8080,
    }),
  );
});

gulp.task('docs', ['docs:build', 'docs:serve']);
