const gulp = require('gulp');
const serve = require('gulp-webserver');
const jsdoc = require('gulp-jsdoc3');

gulp.task(
  'docs:build',
  gulp.series(
    (docsBuildCB = callback => {
      gulp
        .src(['README.md', 'app/bin/backend/**/*.js'], { read: false })
        .pipe(jsdoc({ opts: { destination: './docs' } }, callback));
    }),
  ),
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
