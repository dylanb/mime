module.exports = function(grunt) {
  // Do grunt-related things in here
    grunt.initConfig({
        pkg: grunt.file.readJSON("package.json"),
        jshint: {
            src: {
                options: {
                    jshintrc: "examplesrc/.jshintrc"
                },
                files: {
                    src: "examplesrc/*.js"
                }
            },
            tests: {
                options: {
                    jshintrc: "tests/.jshintrc"
                },
                files: {
                    src: "tests/**/*.js"
                }
            }
        },
        watch: {
            scripts : {
                files: ["examplesrc/*.js", "examplesrc/*.json", "tests/src/*.js", "mime/*.js"],
                tasks: ["lint", "mochaTest"]
            }
        },
        connect: {
            server: {
                options: {
                    hostname: "0.0.0.0",
                    port: 9876,
                    base: "."
                }
            }
        },
        executedocs: {
            main: {
            }
        },
        mochaTest: {
            test: {
                options: {
                  reporter: "spec",
                  // Require blanket wrapper here to instrument other required
                  // files on the fly.
                  //
                  // NB. We cannot require blanket directly as it
                  // detects that we are not running mocha cli and loads differently.
                  //
                  // NNB. As mocha is 'clever' enough to only run the tests once for
                  // each file the following coverage task does not actually run any
                  // tests which is why the coverage instrumentation has to be done here
                  require: "coverage/blanket",
                  clearRequireCache: true
                },
                src: ["tests/**/*.js"]
            },
            coverage: {
                options: {
                    reporter: "html-cov",
                    // use the quiet flag to suppress the mocha console output
                    quiet: true,
                    // specify a destination file to capture the mocha
                    // output (the quiet option does not suppress this)
                    captureFile: "coverage.html"
                },
                src: ["tests/**/*.js"]
            }
        }
    });

    // grunt plugins
    grunt.loadNpmTasks("grunt-contrib-jshint");
    grunt.loadNpmTasks("grunt-contrib-uglify");
    grunt.loadNpmTasks("grunt-contrib-concat");
    grunt.loadNpmTasks("grunt-contrib-watch");
    grunt.loadNpmTasks("grunt-contrib-connect");
    grunt.loadNpmTasks("grunt-contrib-copy");
    grunt.loadNpmTasks("grunt-git-authors");
    grunt.loadNpmTasks("grunt-mocha-test");

    grunt.registerMultiTask("executedocs", "generate YUI docs", function(outDir) {
        var done = this.async();
        executedocs = grunt.util.spawn({
            cmd: "yuidoc",
            args: ["-T", "simple", "--themedir", "./doctheme"]
        }, function(error, result, code) {
              if(code == 127) {
                    return grunt.warn(
                       "Me no happy!!"
                    );
              }
              done(error);
        });
        executedocs.stdout.pipe(process.stdout);
        executedocs.stderr.pipe(process.stderr);
    });

    grunt.registerTask("lint", [ "jshint"] );
    grunt.registerTask("server", [ "connect" ] );
    grunt.registerTask("watcher", [ "watch" ] );
    grunt.registerTask("all", [ "lint", "mochaTest", "docs" ] );
    grunt.registerTask("default", "all");
    grunt.registerTask("docs", "executedocs");
};