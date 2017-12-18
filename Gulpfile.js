require('require-dir')('./tasks');
const gulp = require('gulp');
const util = require('gulp-util');

gulp.task('default', () => {
  util.log('Commands you might be interested in:');
  util.log('');
  util.log('  == General ==');
  util.log('');
  util.log('    gulp clean        , Clean relevant directories.');
  util.log('');
  util.log('  == Building ==');
  util.log('');
  util.log('    gulp compile      , Compile front-end and backend code once.');
  util.log('    gulp develop      , Run a autocompiling server for both frontend and backend.');
  util.log('');
  util.log('  == Testing ==');
  util.log('');
  util.log('    gulp test         , Run all testing functionality for the project.');
  util.log('    gulp test:watch   , Run all tests, watch for updates.');
  util.log('');
  util.log('  == Documentation ==');
  util.log('');
  util.log('    gulp docs         , Build documentation for the project.');
  util.log('    gulp docs:serve   , Build documentation then serve at localhost:8080.');
  util.log('');
});
