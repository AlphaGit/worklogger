require('app-module-path').addPath(__dirname);

var gulp = require('gulp');
var eslint = require('gulp-eslint');
var mocha = require('gulp-mocha');
var gutil = require('gulp-util');
var istanbul = require('gulp-istanbul');

const sourcesGlob = ['**/*.js', '!node_modules/**', '!coverage/**'];
const testsGlob = ['tests/**/*.js'];

gulp.task('default', function() {

});

function handleError(error) {
    gutil.log(error);
    this.emit('end');
}

gulp.task('lint', () =>
    gulp.src(sourcesGlob)
        .pipe(eslint())
        .pipe(eslint.format())
        .pipe(eslint.failAfterError())
        .on('error', handleError)
);

gulp.task('instrument-code', () =>
    gulp.src(sourcesGlob)
        .pipe(istanbul())
        .pipe(istanbul.hookRequire())
        .on('error', handleError)
);

gulp.task('test', ['instrument-code'], () =>
    gulp.src(testsGlob)
        .pipe(mocha({reporter: 'nyan'}))
        .pipe(istanbul.writeReports())
        .on('error', handleError)
);

gulp.task('watch', ['lint', 'test'], function() {
    gulp.watch(testsGlob.concat(sourcesGlob), ['lint', 'test']);
});
