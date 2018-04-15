/* eslint-disable no-console */

const fs = require('fs');
const gulp = require('gulp');
const util = require('util');
const log = require('fancy-log');
const bump = require('gulp-bump');
const child = require('child_process');
const PluginError = require('plugin-error');

const exec = util.promisify(child.exec);
const readFile = util.promisify(fs.readFile);

function bumpVersion(level, cb) {
  exec('git rev-parse --abbrev-ref HEAD')
    .then((result) => {
      const { stdout } = result;
      const [branch] = stdout.split('\n');
      if (branch !== 'development') {
        throw new Error('Branch must be "development" when bumping version!');
      }

      gulp.src('./package.json')
        .pipe(bump({ type: level }))
        .pipe(gulp.dest('./'))
        .on('end', () => {
          exec('git add package.json')
            .then(() => readFile('./package.json', 'utf-8'))
            .then((contents) => {
              const { version } = JSON.parse(contents);
              return exec(`git commit -m "Bumped to version ${version}"`);
            })
            .then(() => {
              console.log();
              console.log('Your version bump has now been successfully committed to git.');
              console.log('However, you\'ll need to do a "git push" to see the change in Github');
              console.log();
              cb();
            })
            .catch((error) => {
              console.log(error.stack);
              process.exit(1);
            });
        });
    })
    .catch((error) => {
      console.log(error.stack);
      process.exit(1);
    });
}

gulp.task('bump:major', cb => bumpVersion('major', cb));
gulp.task('bump:minor', cb => bumpVersion('minor', cb));
gulp.task('bump:patch', cb => bumpVersion('patch', cb));
