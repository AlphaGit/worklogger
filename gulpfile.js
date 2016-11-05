var gulp = require('gulp');
var eslint = require('gulp-eslint');
var mocha = require('gulp-mocha');
var gutil = require('gulp-util');

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

gulp.task('test', () =>
    gulp.src(testsGlob)
        .pipe(mocha({reporter: 'nyan'}))
);

gulp.task('watch-test', () =>
    gulp.watch(testsGlob.concat(sourcesGlob), ['test'])
        .on('error', gutil.log)
);
