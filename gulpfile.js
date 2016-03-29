var gulp = require('gulp');
var concat = require('gulp-concat');
var uglify = require('gulp-uglify');
var minifycss = require('gulp-minify-css');
var Server = require('karma').Server;
var jshint = require('gulp-jshint');
var connect = require('gulp-connect');
var debug = require('gulp-debug');
var browserify = require('browserify');
var gutil = require('gulp-util');
var tap = require('gulp-tap');
var source = require('vinyl-source-stream');
var buffer = require('vinyl-buffer');
var sourcemaps = require('gulp-sourcemaps');
var through = require('through2');
var globby = require('globby');
var reactify = require('reactify');


gulp.task('buildJavascript', function () {
    // gulp expects tasks to return a stream, so we create one here.
    var bundledStream = through();

    bundledStream
    // turns the output bundle stream into a stream containing
    // the normal attributes gulp plugins expect.
        .pipe(source('app.js'))
        // the rest of the gulp task, as you would normally write it.
        // here we're copying from the Browserify + Uglify2 recipe.
        .pipe(buffer())
        .pipe(sourcemaps.init({loadMaps: true}))
        // Add gulp plugins to the pipeline here.
        .pipe(uglify())
        .on('error', gutil.log)
        .pipe(sourcemaps.write('./'))
        .pipe(gulp.dest('./dist/js/'));

    // "globby" replaces the normal "gulp.src" as Browserify
    // creates it's own readable stream.
    globby(['./src/js/*.js']).then(function(entries) {
        // create the Browserify instance.
        var b = browserify({
            entries: entries,
            debug: true,
            transform: [reactify]
        });

        // pipe the Browserify stream into the stream we created earlier
        // this starts our gulp pipeline.
        b.bundle().pipe(bundledStream);
    }).catch(function(err) {
        // ensure any errors from globby are handled
        bundledStream.emit('error', err);
    });

    // finally, we return the stream, so gulp knows when this task is done.
    return bundledStream;
});

gulp.task('buildCSS', function(){
    return gulp.src([
            'bower_components/bootstrap/dist/css/bootstrap.css',
            'src/css/**/*.css'])
        .pipe(concat('styles.css'))
        .pipe(minifycss())
        .pipe(gulp.dest('dist'))
        .pipe(connect.reload());
});

gulp.task('moveHTML', function(){
    return gulp.src(['src/**/*.html', 'src/**/*.json'])
        .pipe(gulp.dest('dist'))
        .pipe(connect.reload());
});

gulp.task('build', ['buildJavascript', 'buildCSS', 'moveHTML']);

// **********************************

gulp.task('karma', function (done) {
    new Server({
        configFile: __dirname + '/karma.conf.js',
        singleRun: true
    }, done).start();
});

gulp.task('jshint', function(){
    return gulp.src(['src/js/**/*.js', 'src/tests/**/*.js'])
        .pipe(jshint())
        .pipe(jshint.reporter('jshint-stylish'));
});

gulp.task('test', ['karma', 'jshint']);

// ***************************************

gulp.task('connect', function(){
    connect.server({
        root: 'dist',
        livereload: true
    });
});

gulp.task('watch', function(){
    gulp.watch('src/js/**/*.js', ['buildJavascript']);
    gulp.watch('src/tests/**/*.js', ['test']);
    gulp.watch('src/css/**/*.css', ['buildCSS']);
    gulp.watch('src/**/*.html', ['moveHTML']);
});

// *******************************************

gulp.task('default', ['build', 'test', 'watch', 'connect']);