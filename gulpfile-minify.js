"use strict";

var gulp = require("gulp"),
    minify = require("gulp-minify"),
    tslint = require("gulp-tslint"),
    tsc = require("gulp-typescript"),
    runSequence = require("run-sequence"),
    sourcemaps = require('gulp-sourcemaps'),
    merge = require('merge2');

gulp.task("minify", function() {
    gulp.src('dist/**/*.js')
    .pipe(minify({
      noSource : true,
      ext:{
            min:'.min.js'
        }
    }))
    .pipe(gulp.dest('dist_min'));
});
