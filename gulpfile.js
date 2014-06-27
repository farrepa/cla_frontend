var gulp = require('gulp'),
  plugins = require('gulp-load-plugins')(),
  stylish = require('jshint-stylish'),
  runSequence = require('run-sequence');

var paths = {
  dest_dir: 'cla_frontend/assets/',
  src_dir: 'cla_frontend/assets-src/',
  styles: 'cla_frontend/assets-src/stylesheets/**/*.scss',
  fonts: 'cla_frontend/assets-src/fonts/**',
  templates: 'cla_frontend/assets-src/javascripts/templates/*.hbs',
  partials: 'cla_frontend/assets-src/javascripts/app/partials/**/*.html',
  scripts: [
    // vendor scripts
    'cla_frontend/assets-src/vendor/lodash/dist/lodash.min.js',
    'cla_frontend/assets-src/vendor/jquery-details/jquery.details.js',
    'cla_frontend/assets-src/vendor/handlebars/handlebars.js',
    // angular deps
    'cla_frontend/assets-src/vendor/angular/angular.js',
    'cla_frontend/assets-src/vendor/angular-sanitize/angular-sanitize.js',
    'cla_frontend/assets-src/vendor/angular-animate/angular-animate.js',
    'cla_frontend/assets-src/vendor/angular-resource/angular-resource.js',
    'cla_frontend/assets-src/vendor/angular-ui-router/release/angular-ui-router.js',
    'cla_frontend/assets-src/vendor/angular-i18n/angular-locale_en-gb.js',
    'cla_frontend/assets-src/javascripts/vendor/xeditable.js',
    'cla_frontend/assets-src/vendor/moment/moment.js',
    'cla_frontend/assets-src/vendor/angular-moment/angular-moment.js',
    // angular app code
    'cla_frontend/assets-src/javascripts/app/js/app.js',
    'cla_frontend/assets-src/javascripts/app/js/**/*.js',
    // templates
    'cla_frontend/assets-src/javascripts/templates.js',
    // CLA
    'cla_frontend/assets-src/javascripts/moj.Helpers.js',
    'cla_frontend/assets-src/javascripts/modules/*'
  ],
  vendor_scripts: 'cla_frontend/assets-src/javascripts/vendor/*',
  images: 'cla_frontend/assets-src/images/**/*'
};

// clean out assets folder
gulp.task('clean', function() {
  return gulp
    .src(paths.dest_dir, {read: false})
    .pipe(plugins.clean());
});

// compile scss
gulp.task('sass', function() {
  gulp
    .src(paths.styles)
    .pipe(plugins.rubySass({
      loadPath: 'node_modules/govuk_frontend_toolkit/' // add node module toolkit path
    }))
    .pipe(gulp.dest(paths.dest_dir + 'stylesheets'));
});

// js templates
gulp.task('templates', function(){
  return gulp.src(paths.templates)
    .pipe(plugins.handlebars())
    .pipe(plugins.defineModule('plain'))
    .pipe(plugins.declare({
      namespace: 'CLA.templates'
    }))
    .pipe(plugins.concat('templates.js'))
    .pipe(gulp.dest(paths.src_dir + 'javascripts'));
});

// default js task
gulp.task('js', ['templates', 'constants'], function() {
  var prod = paths.scripts.slice(0);

  // ignore debug files
  prod.push('!' + paths.src_dir + '**/*debug*');
  // create concatinated js file
  gulp
    .src(prod)
    .pipe(plugins.concat('cla.main.js'))
    .pipe(gulp.dest(paths.dest_dir + 'javascripts'));
  // copy static vendor files
  gulp
    .src(paths.vendor_scripts)
    .pipe(gulp.dest(paths.dest_dir + 'javascripts/vendor'));
  // copy static template files
  gulp
    .src(paths.partials)
    .pipe(gulp.dest(paths.dest_dir + 'javascripts/app/partials'));
  // create debug js file
  gulp
    .src(paths.src_dir + 'javascripts/**/*debug*')
    .pipe(plugins.concat('cla.debug.js'))
    .pipe(gulp.dest(paths.dest_dir + 'javascripts/'));
});


// jshint js code
gulp.task('lint', function() {
  var files = paths.scripts.slice(0);

  // files to ignore from linting
  files.push('!cla_frontend/assets-src/vendor/**');
  files.push('!cla_frontend/assets-src/javascripts/vendor/**');
  files.push('!cla_frontend/assets-src/javascripts/templates.js');

  gulp
    .src(files)
    .pipe(plugins.jshint())
    .pipe(plugins.jshint.reporter(stylish));
});

// copy across web fonts
gulp.task('fonts', function() {
  gulp
    .src(paths.fonts)
    .pipe(gulp.dest(paths.dest_dir + 'fonts'));
});

// optimise images
gulp.task('images', function() {
  gulp
    .src(paths.images)
    .pipe(plugins.imagemin({optimizationLevel: 5}))
    .pipe(gulp.dest(paths.dest_dir + 'images'));
});

// convert django cla_common constants into angular constants
gulp.task('constants', function () {
  return gulp
    .src(paths.src_dir + 'javascripts/app/constants.json')
    .pipe(plugins.ngConstant({
      name: 'cla.constants'
    }))
    // Writes config.js to dist folder
    .pipe(gulp.dest(paths.src_dir + 'javascripts/app/js/'));
});

// setup watches
gulp.task('watch', function() {
  gulp.watch(paths.fonts, ['fonts']);
  gulp.watch(paths.styles, ['sass']);
  gulp.watch(paths.src_dir + 'javascripts/**/*', ['lint', 'js']);
  gulp.watch(paths.images, ['images']);
});

// setup default tasks
gulp.task('default', ['build']);
// run build
gulp.task('build', function() {
  runSequence('clean', ['lint', 'fonts', 'templates', 'js', 'images', 'sass']);
});
