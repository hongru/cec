/*global module:false*/
module.exports = function (grunt) {

    grunt.task.registerMultiTask('removeKissy', 'remove Kissy.', function() {
        //grunt.log.writeln(this.target + ': ' + this.data);

        var start = 
        'var KISSY = {};\
        KISSY.mods = {};\
        KISSY.add = function (name, fn, cfg) {\
            var requires = [];\
            cfg && cfg.requires && cfg.requires.forEach(function (s) {\
                if (/\\/$/.test(s)) s += "index";\
                requires.push("mods[\'"+s+"\']");\
            });\
\
            if (/\\/$/.test(name)) name += "index";\
            KISSY.mods[name] = {\
                name: name,\
                fn: fn,\
                requires: requires\
            }\
        };'
        ;

        var end = 
        'module.exports = KISSY;';

        var pre = 
        '\n;(function () {\n\
    \n\
    var mods = {},\n\
        KISSY;\n';

        var last = '\n})();'


        this.data.forEach(function (file) {
            var code = grunt.file.read(file.src);
            // console.log(code)
            grunt.file.write(file.dest, start + code + end);
            var KISSY = require(file.dest);
            var codeArr = [];
            for (var m in KISSY.mods) {
                var mod = KISSY.mods[m];
                var args = ['KISSY'].concat(mod['requires']).join(',');
                var mCode = 'mods[\''+m+'\'] = ('+mod['fn'].toString()+')('+args+');';
                codeArr.push(mCode);
            }
            pre = 'var '+file.exportsName+';\n' + pre;
            last = '\n' + file.exportsName + ' = mods[\'' + file.exportsKey + '\']; \n' + last;
            grunt.file.write(file.dest, pre + codeArr.join('\n') + last);

        })
    });


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

        removeKissy: {
            files: [
                {
                    exportsKey: 'cec/cec',
                    exportsName: 'CEC',
                    src: './build/cec/cec.js',
                    dest: './build/cec/cec-nokissy.js'
                }
            ]
        },

        concat: {
            ra: {
                src: [
                    './build/cec/cec-nokissy.js', 
                    './src/cec/raphael/raphael.1.5.2.js',
                    './src/cec/raphael/cec._.js', 
                    './src/cec/raphael/cec.cobject.js',
                    './src/cec/raphael/cec.sprite.js',
                    './src/cec/raphael/cec.sprite.anim.js',
                    './src/cec/raphael/cec.sprite.path.js'
                ],
                dest: './build/cec/cec.ra.js'
            }
        }

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
    grunt.registerTask('default', [ 'kmc', 'removeKissy', 'concat:ra']);
};
