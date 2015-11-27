'use strict';

var gulp = require('gulp');
var gutil = require('gulp-util');
var bower = require('gulp-bower');
var mainBowerFiles = require('main-bower-files');
var concat = require('gulp-concat');
var minifyCss = require('gulp-minify-css');
var sourcemaps = require('gulp-sourcemaps');

var options = {
    src: '.',
    dist: './source',
    tmp: '.tmp',
    test: 'test/spec',
    e2e: 'test/e2e',
    errorHandler: function (title) {
        return function (err) {
            gutil.log(gutil.colors.red('[' + title + ']'), err.toString());
            this.emit('end');
        };
    },
    bower: {
        directory: './bower_components'
    }
};

var $ = require('gulp-load-plugins')({
    pattern: ['gulp-*', 'main-bower-files']
});

// Bower
gulp.task('bower-dep', function() {
    return bower()
});

gulp.task('bower', ['bower-dep'], function() {
    return gulp.src(mainBowerFiles())
        .pipe(gulp.dest(options.tmp + "/vendor"))
});

// Javascript
gulp.task('earlyJS', function() {
    return gulp.src([options.bower.directory + "/modernizr/modernizr.js"])
        .pipe(sourcemaps.init())
        .pipe(concat('early.js'))
        .pipe(sourcemaps.write())
        .pipe(gulp.dest(options.tmp + '/js'));
});

gulp.task('vendorJS', function() {
    return gulp.src([options.tmp + "/vendor/**/*.js", options.src + '/js/libs/**/*.js', '!' + options.src + '/vendor/jquery.js'])
        .pipe(gulp.dest(options.tmp + '/js'));
});

//gulp.task('vendorJS', function() {
//    return gulp.src([options.tmp + "/vendor/**/*.js", options.src + '/js/libs/**/*.js', '!' + options.src + '/vendor/jquery.js'])
//        .pipe(sourcemaps.init())
//        .pipe(concat('vendor.js'))
//        .pipe(sourcemaps.write())
//        .pipe(gulp.dest(options.tmp + '/js'));
//});

gulp.task('concatJs', function() {
    return gulp.src([options.src + "/js/**/*.js", '!' + options.src + '/js/libs/**/*.js'])
        .pipe(sourcemaps.init())
        .pipe(concat('main.js'))
        .pipe(sourcemaps.write())
        .pipe(gulp.dest(options.tmp + '/js'));
});

gulp.task('javascript', ['earlyJS', 'vendorJS', 'concatJs'], function() {
    return gulp.src([
        options.tmp + '/js/**/*.js',
        options.bower.directory + "/html5shiv/dist/html5shiv.js",
        options.bower.directory + "/jquery/dist/jquery.js"
    ])
        .pipe(gulp.dest(options.dist + '/js'));
});

// CSS
gulp.task('sass', function () {
    return gulp.src(options.src + '/scss/**/*.scss')
        .pipe($.sass().on('error', $.sass.logError))
        .pipe($.sass({
            outputStyle: 'expanded',
            sourceComments: 'normal'
        }))
        .pipe(gulp.dest(options.tmp + '/css'));
});

gulp.task('concatCss', ['sass'], function() {
    return gulp.src([
        options.tmp + "/css/reset.css",
        options.tmp + "/vendor/owl.carousel.css",
        options.tmp + "/vendor/owl.theme.css",
        options.src + "/css/libs/**/*.css",
        options.tmp + "/css/main.css"
    ])
        .pipe(sourcemaps.init())
        .pipe(concat('styles.css'))
        .pipe(sourcemaps.write())
        .pipe(gulp.dest(options.tmp + '/css'));
});

gulp.task('styles', ['concatCss'], function () {
    gulp.src(options.tmp + '/css/styles.css')
        .pipe(gulp.dest(options.dist + '/css'));
    gulp.src(options.src + '/css/libs/device-mockups/**/*')
        .pipe(gulp.dest(options.dist + '/css'));
});


// Fonts
gulp.task('fonts', function() {
    return gulp.src([
        options.bower.directory + '/fontawesome/fonts/*.*',
        './fonts/*.*'
        ])
        .pipe(gulp.dest(options.dist + '/fonts/'));
});
//
//// Images
//gulp.task('images', function() {
//    gulp.src('./images/**/*.{jpg,png,jpeg}')
//        .pipe(gulp.dest(options.dist + '/images'));
//});
//

gulp.task('sass:watch', function () {
    return gulp.watch(options.src + '/scss/**/*.scss', ['styles']);
});

gulp.task('js:watch', function () {
    return gulp.watch(options.src + '/js/**/*.js', ['javascript']);
});

gulp.task('build', [
    'bower',
    'fonts',
    'javascript',
    'styles',
    'js:watch',
    'sass:watch'
]);

gulp.task('default', function () {
    gulp.start('build');
});