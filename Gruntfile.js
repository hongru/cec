/*global module:false*/
module.exports = function (grunt) {

    // Project configuration.
    grunt.initConfig({
        // Metadata.
        pkg: grunt.file.readJSON('package.json'),
        version: '1.0.0',
        banner: '/*<%= grunt.template.today("yyyy-mm-dd") %>-<%= pkg.author%>*/',
        // Task configuration.

        /**
         * 进行KISSY 打包
         * @link https://github.com/daxingplay/grunt-kmc
         */
        kmc: {
            options: {
                packages: [
                    {
                        name: 'cec',
                        path: 'src'
                    }
                ]
            },
            page: {
                files: [
                    {   
                        expand: true,
                        cwd: 'src/cec',
                        src: ['*.js', '*/index.js' ],
                        dest: 'build/cec/'
                    }
                ]
            }
        },

        // watch: {
        //     less: {
        //         files: ['./src/mdh5/assets/less/*.less'],
        //         tasks: ['less:tnl']
        //     }
        // },
        
    });

    // These plugins provide necessary tasks.
    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks('grunt-contrib-watch');
    grunt.loadNpmTasks('grunt-kmc');

    // Default task.
    grunt.registerTask('default', [ 'kmc']);
};
