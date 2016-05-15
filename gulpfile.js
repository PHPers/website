var browserSync  = require('browser-sync');
var watchify     = require('watchify');
var browserify   = require('browserify');
var source       = require('vinyl-source-stream');
var buffer       = require('vinyl-buffer');
var gulp         = require('gulp');
var gutil        = require('gulp-util');
var gulpSequence = require('gulp-sequence');
var sass         = require('gulp-sass');
var autoprefixer = require('gulp-autoprefixer');
var watch        = require('gulp-watch');
var cleancss     = require('gulp-clean-css');
var uglify       = require('gulp-uglify');
var streamify    = require('gulp-streamify');
var sourcemaps   = require('gulp-sourcemaps');
var concat       = require('gulp-concat');
var babel        = require('gulp-babel');
var prod         = gutil.env.prod;

var onError = function(err) {
    console.log(err.message);
    this.emit('end');
};

var options = {
    src: './src/Assets',
    dist: './source',
    tmp: '.tmp',
    vendor: "./node_modules"
};

// bundling js with browserify and watchify
var b = watchify(browserify(options.src + '/js/main', {
    cache: {},
    packageCache: {},
    fullPaths: true
}));

gulp.task('js', bundle);
b.on('update', bundle);
b.on('log', gutil.log);

function bundle() {
    return b.bundle()
        .on('error', onError)
        .pipe(source('bundle.js'))
        .pipe(buffer())
        .pipe(!prod ? sourcemaps.init() : gutil.noop())
        .pipe(prod ? babel({
            presets: ['es2015']
        }) : gutil.noop())
        .pipe(concat('main.js'))
        .pipe(!prod ? sourcemaps.write('.') : gutil.noop())
        .pipe(prod ? streamify(uglify()) : gutil.noop())
        .pipe(gulp.dest(options.dist + '/js'))
        .pipe(browserSync.stream());
}

// sass
gulp.task('sass', function() {
    return gulp.src(options.src + '/scss/**/*.scss')
        .pipe(sass({
            includePaths: [].concat(require('node-bourbon').includePaths, [
                'node_modules/foundation-sites/scss',
                'node_modules/spinkit/scss',
                'node_modules/font-awesome/scss'
            ])
        }))
        .on('error', onError)
        .pipe(prod ? cleancss() : gutil.noop())
        .pipe(prod ? autoprefixer({
            browsers: ['last 2 versions'],
            cascade: false
        }) : gutil.noop())
        .pipe(gulp.dest(options.tmp + '/css'));
});

// concat css
gulp.task('css', ['sass'], function() {
    return gulp.src([
            options.vendor + "/owlcarousel/owl-carousel/owl.carousel.css",
            options.vendor + "/owlcarousel/owl-carousel/owl.theme.css",
            options.tmp + "/css/main.css"
        ])
        .pipe(sourcemaps.init())
        .pipe(concat('main.css'))
        .pipe(sourcemaps.write())
        .pipe(gulp.dest(options.dist + '/css'))
        .pipe(browserSync.stream());
});

// Others scripts
gulp.task('scripts', function() {
    return gulp.src([options.vendor + '/html5shiv/dist/html5shiv.min.js'
        ])
        .on('error', onError)
        .pipe(!prod ? sourcemaps.init() : gutil.noop())
        .pipe(concat('plugins.js'))
        .pipe(!prod ? sourcemaps.write('.') : gutil.noop())
        .pipe(gulp.dest(options.dist + '/js/'));
});

// Fonts
gulp.task('fonts', function() {
    gulp.src(options.vendor + '/font-awesome/fonts/*.{eot,svg,ttf,woff,woff2}')
        .pipe(gulp.dest(options.dist + '/fonts'));
});

// // images
// gulp.task('img', function() {
//     return gulp.src(options.src + './src/images/**/*')
//         .pipe(gulp.dest('./build/img'))
//         .pipe(browserSync.stream());
// });

// browser sync server for live reload
gulp.task('serve', function() {
    browserSync.init({
        server: {
            baseDir: './output_dev'
        }
    });

    gulp.watch(options.src + '/scss/**/*.scss', ['css']);
    gulp.watch(options.src + '/js/**/*.js', ['js']);
});

// use gulp-sequence to finish building html, sass and js before first page load
gulp.task('build', gulpSequence(['css', 'js', 'scripts', 'fonts']));
gulp.task('default', gulpSequence(['build'], 'serve'));