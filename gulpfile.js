var gulp = require('gulp');
var eslint = require('gulp-eslint');

gulp.task('default', function() {

});

gulp.task('lint', function() {
    return gulp.src(['**/*.js','!node_modules/**'])
        .pipe(eslint())
        .pipe(eslint.format())
        .pipe(eslint.failAfterError());
});
