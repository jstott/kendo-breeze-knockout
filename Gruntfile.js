module.exports = function(grunt) {

  // Project configuration.
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    jshint: {
    all: ['src/<%= pkg.name %>.js']
  },
  concat: {
    options: {
      separator: '',
      banner: '/*! <%= pkg.name %> - v<%= pkg.version %> - ' +
        '<%= grunt.template.today("yyyy-mm-dd") %> - <%= pkg.repository.url %> */\n'
    },
    build: {
      src: ['src/<%= pkg.name %>.js'],
      dest: 'build/<%= pkg.name %>.js'
    },
    sample: {
      src: ['src/<%= pkg.name %>.js'],
      dest: 'sample/HotTowelSpa/scripts/<%= pkg.name %>.js'
    }
  },
  uglify: {
    options: {
      stripBanners: true,
      banner: '/*! <%= pkg.name %> - v<%= pkg.version %> - ' +
        '<%= grunt.template.today("yyyy-mm-dd") %> - <%= pkg.repository.url %> */\n'
    },
    build: {
      src: 'src/<%= pkg.name %>.js',
      dest: 'build/<%= pkg.name %>.min.js'
    },
    sample: {
      src: 'src/<%= pkg.name %>.js',
      dest: 'sample/HotTowelSpa/scripts/<%= pkg.name %>.min.js'
    }
  }
  });

  // Load the plugin that provides the "uglify" task.
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-bump');
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-concat');
  // Default task(s).
  grunt.registerTask('default', ['jshint','concat']);
  grunt.registerTask('syntax', ['jshint']);
  grunt.registerTask('build',['jshint','concat','uglify']);
  grunt.registerTask('version',['bump']);

};