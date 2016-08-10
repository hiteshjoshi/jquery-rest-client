var gulp = require('gulp');
var minify = require('gulp-minify');
var connect = require('gulp-connect');

gulp.task('default', function() {
    gulp.src('src/jquery.restclient.js')
        .pipe(minify({
            ext: {
                min: '.min.js'
            },
            ignoreFiles: ['.combo.js', '-min.js', '.min.js', '.map']
        }))
        .pipe(gulp.dest('dist'))
});

gulp.task('example', function () {
    gulp.src(['bower_components/jquery/dist/jquery.min.js', 'dist/jquery.restclient.js'])
        .pipe(gulp.dest('example/js'))

    connect.server({
        port: 3001,
        root: 'example',
        livereload: true
    });
});
