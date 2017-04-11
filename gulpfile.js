var gulp = require('gulp'),
    minifyCss = require('gulp-minify-css'),
    autoprefixer = require('gulp-autoprefixer'),
    concat = require('gulp-concat'),
    order = require('gulp-order'),
    uglify = require('gulp-uglify');


gulp.task('css', function() {
    gulp.src('src/css/**/*.css')
        .pipe(autoprefixer({
            browsers: ['last 15 versions'],
            cascade: false
        }))
        .pipe(order([
            'src/css/reset.css',
            'src/css/main.css'
        ]))
        .pipe(minifyCss())
        .pipe(concat('main.css'))
        .pipe(gulp.dest('public/css'));
});

gulp.task('js', function() {
    gulp.src('src/js/**/*.js')
        //.pipe(uglify())
        .pipe(concat('main.js'))
        .pipe(gulp.dest('public/js'));
});

gulp.task('watch', function () {
    gulp.watch('src/css/**/*.css', ['css']);
    gulp.watch('src/js/**/*.js', ['js']);
});