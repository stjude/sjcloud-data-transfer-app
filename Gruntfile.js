module.exports = function(grunt) {

  // configure the tasks
  grunt.initConfig({
    copy: {
      build: {
        cwd: 'source',
        src: [ '**' ],
        dest: 'build',
        expand: true
      },
    },
    clean: {
      pre: {
        src: [ 'build' ]
      },
      post: {
        src: [ 'build/client/css/**.less',
               'build/client/css/bootstrap/' ]
      },
    },
    less: {
      build: {
        options: {
          //compress: true,
          //yuicompress: true,
          optimization: 2
        },
        files: {
          "build/client/css/main.css": "build/client/css/main.less"
        }
      }
    },
	watch: {
        src: {
            files: ['source/**/*'],
            tasks: ['build']
        }
    } 
  });

  // load the tasks
  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-contrib-less');
  grunt.loadNpmTasks('grunt-contrib-watch');

  // define the tasks
  grunt.registerTask(
    'build', 
    'Compiles all of the assets and copies the files to the build directory.', 
    [ 'clean:pre', 'copy', 'less', 'clean:post' ]
  );
	
  grunt.registerTask(
    'default', 
    'Watch source directory and rebuild.', 
    [ 'watch:src' ]
  );
};
