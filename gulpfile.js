require('app-module-path').addPath(__dirname);

var gulp = require('gulp');
var eslint = require('gulp-eslint');
var mocha = require('gulp-mocha');
var gutil = require('gulp-util');
var istanbul = require('gulp-istanbul');

const sourcesGlob = ['**/*.js','!node_modules/**'];
const testsGlob = ['tests/**/*.js'];

gulp.task('default', function() {

});

gulp.task('lint', () =>
    gulp.src(sourcesGlob)
        .pipe(eslint())
        .pipe(eslint.format())
        .pipe(eslint.failAfterError())
);

gulp.task('instrument-code', () =>
    gulp.src(sourcesGlob)
        .pipe(istanbul())
        .pipe(istanbul.hookRequire())
);

gulp.task('test', ['instrument-code'], () =>
    gulp.src(testsGlob)
        .pipe(mocha({reporter: 'nyan'}))
        .pipe(istanbul.writeReports())
);

gulp.task('watch-test', () =>
    gulp.watch(testsGlob.concat(sourcesGlob), ['test'])
        .on('error', gutil.log)
);
