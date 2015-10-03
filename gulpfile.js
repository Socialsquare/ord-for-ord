var gulp          = require('gulp'),
    sass          = require('gulp-sass'),
    autoprefixer  = require('gulp-autoprefixer'),
    minifyCss     = require('gulp-minify-css'),
    rimraf        = require('rimraf'),
    concat        = require('gulp-concat'),
    livereload    = require('gulp-livereload'),
    browserify    = require('browserify'),
    watchify      = require('watchify'),
    reactify      = require('reactify'),
    source        = require('vinyl-source-stream'),
    merge         = require('merge-stream'),
    rename        = require('gulp-rename'),
    plumber       = require('gulp-plumber'),
    runSeq        = require('run-sequence'),
    uglify        = require('gulp-uglify');

var production = process.env.NODE_ENV === 'production';

var paths = {
  scripts: {
    vendor: './client/lib/vendor/**/*.js',
    src: ['./client/**/*.{js,hbs}'],
    main: './client/main.js',
    dest: './public/assets/scripts/'
  },
  styles: {
    vendor: './client/assets/styles/vendor/**/*.css',
    src: ['./client/assets/styles/**/*.{scss,css}'],
    main: './client/assets/styles/main.scss',
    dest: './public/assets/styles/'
  },
  copy: {
    src: [
      './client/assets/fonts/**/*.*',
      './client/assets/images/**/*.*'
    ],
    dest: './public/assets'
  }
};

var libs = [
  'mithril'
];

function handleError(err) {
  console.log(err.toString());
  this.emit('end');
}


function scripts(watch) {
  var bundler, rebundle;

  // add global scope libraries to browsrify
  // so they can be required
  var globalShim = require('browserify-global-shim').configure({
    'socket.io': 'io',
  });

  bundler = browserify(paths.scripts.main, {
    'opts.basedir': './',
    transform: [
      [reactify, { es6: true }],
      globalShim
    ],
    debug: !production, 
    cache: {}, // required for watchify
    packageCache: {}, // required for watchify
    fullPaths: watch // required to be true only for watchify
  });

  if (watch) {
    bundler = watchify(bundler);
  }
 
  rebundle = function() {
    console.log('Rebundling');
    return bundler.bundle()
      .on('error', handleError)
      .pipe(source('app.js'))
      .pipe(gulp.dest(paths.scripts.dest));
  };
 
  bundler.on('update', rebundle);
  return rebundle();
}


gulp.task('scripts:vendor', function() {
  return gulp.src(paths.scripts.vendor)
    .pipe(concat('vendor.js'))
    .pipe(gulp.dest(paths.scripts.dest))
    .on('error', handleError);
});

gulp.task('scripts', function() {
  return scripts(false);
});

gulp.task('scripts:watch', function() {
  return scripts(true);
});


gulp.task('scripts:vendor', function() {
  return gulp.src(paths.scripts.vendor)
    .pipe(concat('vendor.js'))
    .pipe(gulp.dest(paths.scripts.dest));
});


gulp.task('styles', function() {
  var vendorStream = gulp.src(paths.styles.vendor);
  var appStream = gulp.src(paths.styles.main)
    .pipe(plumber())
    .pipe(sass({ style: 'expand' }))
    .pipe(autoprefixer('last 2 version', 'safari 5', 'ie 8', 'ie 9', 
      'opera 12.1', 'ios 6', 'android 4'));

  return merge(vendorStream, appStream)
    .pipe(concat('main.css'))
    .pipe(gulp.dest(paths.styles.dest));
});

// Clean
gulp.task('clean', function(cb) {
  return rimraf('./public/assets', cb);
});

// Copy files
gulp.task('copy', function() {
  return gulp.src(paths.copy.src, { base: './app/assets' })
    .pipe(gulp.dest(paths.copy.dest));
});


// Watch
gulp.task('watch', ['default'], function() {
  gulp.start('scripts:watch');
  gulp.watch(paths.styles.src, ['styles']);
});


// Minify styles and scripts
gulp.task('minify', ['default', 'styles', 'scripts'], function() {
  gulp.src(paths.styles.dest + '/*.css')
    .pipe(minifyCss({ compatibility: 'ie8' }))
    .pipe(rename('main.min.css'))
    .pipe(gulp.dest(paths.styles.dest));

  gulp.src(paths.scripts.dest + '/app.js')
    .pipe(uglify())
    .pipe(rename('app.min.js'))
    .pipe(gulp.dest(paths.scripts.dest));
});


// Default task 
gulp.task('default', ['clean'], function() {
  gulp.start('copy', 'styles', 'scripts');
});




